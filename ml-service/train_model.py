# %% [markdown]
# # CredSage AI — Alt-Data Model Training & Comparison
#
# **Goal**: Train CatBoost and XGBoost regressors on non-traditional digital signals
# from `synthetic_credit_dataset.csv`, build a feature engineering pipeline,
# compare models, create an ensemble, and generate SHAP explainability.
#
# **Raw Features** (10 inputs — non-traditional digital signals):
# - Mobile recharge: `recharge_freq_per_month`, `avg_recharge_value`, `recharge_gap_std`
# - Utility payments: `bill_on_time_ratio`, `avg_days_late`, `autopay_enrolled`
# - E-commerce: `monthly_spend_volatility`, `emi_usage_rate`, `order_freq_trend`
# - Digital footprint: `phone_tenure_months`
#
# **Engineered Features** (3 derived):
# - `bill_regularity_index`, `recharge_consistency`, `spend_stability`
#
# **Target**: `credit_likelihood_score` (300–900)

# %% — Imports
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

from catboost import CatBoostRegressor, Pool
from xgboost import XGBRegressor
import shap
import joblib
import os
import json

plt.rcParams["figure.figsize"] = (14, 5)
sns.set_style("whitegrid")
print("All imports successful")

# %% [markdown]
# ## 1. Load & Explore Dataset

# %%
DATASET_PATH = r"C:\Users\Ved\OneDrive\Desktop\tetrathon\credsage_ai\ml-service\synthetic_credit_dataset.csv"
MODELS_DIR   = r"C:\Users\Ved\OneDrive\Desktop\tetrathon\credsage_ai\ml-service\models"
os.makedirs(MODELS_DIR, exist_ok=True)

df = pd.read_csv(DATASET_PATH)
print(f"Shape: {df.shape}")
print(f"Columns: {list(df.columns)}")
df.head()

# %%
df.info()

# %%
df.describe()

# %% [markdown]
# ### 1.1 Target Distribution & Risk Buckets

# %%
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

axes[0].hist(df["credit_likelihood_score"], bins=50, edgecolor="black", color="#4C72B0")
axes[0].set_title("Credit Likelihood Score Distribution", fontsize=13)
axes[0].set_xlabel("Score (300–900)")
axes[0].set_ylabel("Count")

df["risk_bucket"].value_counts().plot.bar(ax=axes[1], color=["#E24A33", "#FBC15E", "#55A868"],
                                          edgecolor="black")
axes[1].set_title("Risk Bucket Distribution", fontsize=13)
axes[1].set_ylabel("Count")
plt.tight_layout()
plt.show()

# %% [markdown]
# ### 1.2 Feature Distributions

# %%
raw_features = [
    "recharge_freq_per_month", "avg_recharge_value", "recharge_gap_std",
    "bill_on_time_ratio", "avg_days_late", "autopay_enrolled",
    "monthly_spend_volatility", "emi_usage_rate", "order_freq_trend",
    "phone_tenure_months"
]

fig, axes = plt.subplots(2, 5, figsize=(20, 8))
for ax, feat in zip(axes.ravel(), raw_features):
    ax.hist(df[feat], bins=40, edgecolor="black", alpha=0.7, color="#348ABD")
    ax.set_title(feat, fontsize=9)
    ax.tick_params(labelsize=7)
plt.suptitle("Raw Feature Distributions", fontsize=14, y=1.02)
plt.tight_layout()
plt.show()

# %% [markdown]
# ### 1.3 Correlation Heatmap

# %%
numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
numeric_cols = [c for c in numeric_cols if c != "user_id"]

corr = df[numeric_cols].corr()
plt.figure(figsize=(14, 10))
sns.heatmap(corr, annot=True, fmt=".2f", cmap="RdBu_r", center=0, square=True,
            linewidths=0.5, annot_kws={"size": 7})
plt.title("Feature Correlation Heatmap", fontsize=14)
plt.tight_layout()
plt.show()

# %% [markdown]
# ## 2. Feature Engineering Pipeline
#
# The dataset already contains 3 engineered features from `generate_dataset.py`:
# - `bill_regularity_index` = 1 - (avg_days_late / mean(avg_days_late))
# - `recharge_consistency` = 1 - (recharge_gap_std / max(recharge_gap_std))
# - `spend_stability` = 1 - (monthly_spend_volatility / max(monthly_spend_volatility))
#
# We will verify they exist and add additional derived features for richer signal.

# %%
# Verify existing engineered features
print("Engineered features already in dataset:")
for col in ["bill_regularity_index", "recharge_consistency", "spend_stability"]:
    print(f"  {col}: min={df[col].min():.4f}, max={df[col].max():.4f}, mean={df[col].mean():.4f}")

# Additional feature engineering
# 1. Recharge value per frequency (spending intensity)
df["recharge_intensity"] = df["avg_recharge_value"] / (df["recharge_freq_per_month"] + 1)

# 2. Payment discipline composite (combines on-time ratio, days late, autopay)
df["payment_discipline"] = (
    df["bill_on_time_ratio"] * 0.5
    + (1 - df["avg_days_late"] / (df["avg_days_late"].max() + 1e-6)) * 0.3
    + df["autopay_enrolled"] * 0.2
)

# 3. Digital stability score (phone tenure + recharge consistency)
df["digital_stability"] = (
    df["phone_tenure_months"] / (df["phone_tenure_months"].max() + 1e-6) * 0.6
    + df["recharge_consistency"] * 0.4
)

print(f"\nNew features added: recharge_intensity, payment_discipline, digital_stability")
print(f"Total feature columns available: {len(df.columns) - 3}")  # minus user_id, target, risk_bucket

# %% [markdown]
# ## 3. Prepare Training Data

# %%
TARGET = "credit_likelihood_score"
DROP_COLS = ["user_id", "credit_likelihood_score", "risk_bucket"]

# All features to train on (raw + engineered)
ALL_FEATURES = [c for c in df.columns if c not in DROP_COLS]
print(f"Training features ({len(ALL_FEATURES)}):")
for i, f in enumerate(ALL_FEATURES, 1):
    print(f"  {i:2d}. {f}")

X = df[ALL_FEATURES]
y = df[TARGET]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"\nTrain: {X_train.shape[0]} samples | Test: {X_test.shape[0]} samples")

# %% [markdown]
# ## 4. Train CatBoost

# %%
cb_model = CatBoostRegressor(
    iterations=1000,
    learning_rate=0.05,
    depth=6,
    loss_function="RMSE",
    random_seed=42,
    verbose=100,
    early_stopping_rounds=50,
)

train_pool = Pool(X_train, y_train)
test_pool  = Pool(X_test, y_test)

cb_model.fit(train_pool, eval_set=test_pool, use_best_model=True)

# %%
cb_preds = cb_model.predict(X_test)

cb_rmse = np.sqrt(mean_squared_error(y_test, cb_preds))
cb_mae  = mean_absolute_error(y_test, cb_preds)
cb_r2   = r2_score(y_test, cb_preds)

print(f"\nCatBoost Results:")
print(f"   RMSE : {cb_rmse:.4f}")
print(f"   MAE  : {cb_mae:.4f}")
print(f"   R2   : {cb_r2:.4f}")

# %% [markdown]
# ## 5. Train XGBoost

# %%
xgb_model = XGBRegressor(
    n_estimators=1000,
    learning_rate=0.05,
    max_depth=6,
    objective="reg:squarederror",
    random_state=42,
    early_stopping_rounds=50,
    verbosity=1,
)

xgb_model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    verbose=100,
)

# %%
xgb_preds = xgb_model.predict(X_test)

xgb_rmse = np.sqrt(mean_squared_error(y_test, xgb_preds))
xgb_mae  = mean_absolute_error(y_test, xgb_preds)
xgb_r2   = r2_score(y_test, xgb_preds)

print(f"\nXGBoost Results:")
print(f"   RMSE : {xgb_rmse:.4f}")
print(f"   MAE  : {xgb_mae:.4f}")
print(f"   R2   : {xgb_r2:.4f}")

# %% [markdown]
# ## 6. Model Comparison

# %%
comparison = pd.DataFrame({
    "Model":    ["CatBoost", "XGBoost"],
    "RMSE":     [cb_rmse,    xgb_rmse],
    "MAE":      [cb_mae,     xgb_mae],
    "R2 Score": [cb_r2,      xgb_r2],
})
print("\n" + "=" * 50)
print("        MODEL COMPARISON TABLE")
print("=" * 50)
print(comparison.to_string(index=False))
print("=" * 50)

# Visual comparison
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
metrics = ["RMSE", "MAE", "R2 Score"]
colors  = ["#E24A33", "#348ABD"]

for ax, metric in zip(axes, metrics):
    vals = comparison[metric].values
    bars = ax.bar(["CatBoost", "XGBoost"], vals, color=colors, edgecolor="black")
    ax.set_title(metric, fontsize=14, fontweight="bold")
    for bar, v in zip(bars, vals):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height(),
                f"{v:.4f}", ha="center", va="bottom", fontsize=11)
plt.tight_layout()
plt.show()

# %% [markdown]
# ## 7. Ensemble (Weighted Average)
#
# We combine both models using inverse-RMSE weighting — the better model gets more weight.

# %%
w_cb  = (1 / cb_rmse)
w_xgb = (1 / xgb_rmse)
total = w_cb + w_xgb
W_CB  = w_cb / total
W_XGB = w_xgb / total
print(f"Ensemble weights  ->  CatBoost: {W_CB:.4f}  |  XGBoost: {W_XGB:.4f}")

ensemble_preds = W_CB * cb_preds + W_XGB * xgb_preds

ens_rmse = np.sqrt(mean_squared_error(y_test, ensemble_preds))
ens_mae  = mean_absolute_error(y_test, ensemble_preds)
ens_r2   = r2_score(y_test, ensemble_preds)

print(f"\nEnsemble Results:")
print(f"   RMSE : {ens_rmse:.4f}")
print(f"   MAE  : {ens_mae:.4f}")
print(f"   R2   : {ens_r2:.4f}")

# %%
# Final comparison with ensemble
final_comparison = pd.DataFrame({
    "Model":    ["CatBoost", "XGBoost", "Ensemble"],
    "RMSE":     [cb_rmse,    xgb_rmse,  ens_rmse],
    "MAE":      [cb_mae,     xgb_mae,   ens_mae],
    "R2 Score": [cb_r2,      xgb_r2,    ens_r2],
})
print("\n" + "=" * 55)
print("     FINAL MODEL COMPARISON (incl. Ensemble)")
print("=" * 55)
print(final_comparison.to_string(index=False))
print("=" * 55)

best_idx = final_comparison["RMSE"].idxmin()
print(f"\nBest model by RMSE: {final_comparison.loc[best_idx, 'Model']}")

# %% [markdown]
# ## 8. SHAP Explainability
#
# SHAP values explain each feature's contribution to the prediction.
# The problem statement requires **top-3 feature explanations**.

# %%
# SHAP for CatBoost
explainer_cb = shap.TreeExplainer(cb_model)
shap_values_cb = explainer_cb.shap_values(X_test)

print(f"SHAP values shape: {shap_values_cb.shape}")
print(f"Expected value (base score): {explainer_cb.expected_value:.2f}")

# %%
# Summary bar plot — global feature importance
shap.summary_plot(shap_values_cb, X_test, plot_type="bar", show=False)
plt.title("SHAP Feature Importance — CatBoost (Alt-Data)", fontsize=14)
plt.tight_layout()
plt.savefig(os.path.join(MODELS_DIR, "shap_importance_altdata.png"), dpi=150, bbox_inches="tight")
plt.show()

# %%
# Beeswarm plot — direction of impact
shap.summary_plot(shap_values_cb, X_test, show=False)
plt.title("SHAP Beeswarm — CatBoost (Alt-Data)", fontsize=14)
plt.tight_layout()
plt.savefig(os.path.join(MODELS_DIR, "shap_beeswarm_altdata.png"), dpi=150, bbox_inches="tight")
plt.show()

# %%
# SHAP for XGBoost
explainer_xgb = shap.TreeExplainer(xgb_model)
shap_values_xgb = explainer_xgb.shap_values(X_test)

shap.summary_plot(shap_values_xgb, X_test, plot_type="bar", show=False)
plt.title("SHAP Feature Importance — XGBoost (Alt-Data)", fontsize=14)
plt.tight_layout()
plt.show()

# %%
# Waterfall for a single user (top-3 feature explanation demo)
shap_explanation = shap.Explanation(
    values=shap_values_cb[0],
    base_values=explainer_cb.expected_value,
    data=X_test.iloc[0],
    feature_names=ALL_FEATURES
)
shap.waterfall_plot(shap_explanation, show=False)
plt.title("SHAP Waterfall — Single User Prediction")
plt.tight_layout()
plt.show()

# %%
# Demo: Extract top-3 features for the first test user
abs_shap = np.abs(shap_values_cb[0])
top3_idx = np.argsort(abs_shap)[-3:][::-1]
print("\nTop-3 Feature Explanations for User 0:")
for rank, idx in enumerate(top3_idx, 1):
    feat = ALL_FEATURES[idx]
    val  = X_test.iloc[0][feat]
    sv   = shap_values_cb[0][idx]
    direction = "increases" if sv > 0 else "decreases"
    print(f"  {rank}. {feat} = {val:.4f}  (SHAP: {sv:+.2f}, {direction} score)")

# %% [markdown]
# ## 9. Save Models & Metadata

# %%
# Save CatBoost
cb_path = os.path.join(MODELS_DIR, "catboost_altdata.cbm")
cb_model.save_model(cb_path)
print(f"CatBoost saved -> {cb_path}")

# Save XGBoost
xgb_path = os.path.join(MODELS_DIR, "xgboost_altdata.json")
xgb_model.save_model(xgb_path)
print(f"XGBoost saved -> {xgb_path}")

# Save metadata
metadata = {
    "model_type": "alt_data_ensemble",
    "ensemble_weights": {"catboost": round(W_CB, 6), "xgboost": round(W_XGB, 6)},
    "feature_names": ALL_FEATURES,
    "raw_features": raw_features,
    "engineered_features": ["bill_regularity_index", "recharge_consistency", "spend_stability",
                            "recharge_intensity", "payment_discipline", "digital_stability"],
    "target": TARGET,
    "score_range": {"min": 300, "max": 900},
    "metrics": {
        "catboost": {"rmse": round(cb_rmse, 4), "mae": round(cb_mae, 4), "r2": round(cb_r2, 4)},
        "xgboost":  {"rmse": round(xgb_rmse, 4), "mae": round(xgb_mae, 4), "r2": round(xgb_r2, 4)},
        "ensemble": {"rmse": round(ens_rmse, 4), "mae": round(ens_mae, 4), "r2": round(ens_r2, 4)},
    },
    "model_version": "3.0.0-altdata",
    "feature_engineering": {
        "bill_regularity_index": "1 - (avg_days_late / mean(avg_days_late))",
        "recharge_consistency": "1 - (recharge_gap_std / max(recharge_gap_std))",
        "spend_stability": "1 - (monthly_spend_volatility / max(monthly_spend_volatility))",
        "recharge_intensity": "avg_recharge_value / (recharge_freq_per_month + 1)",
        "payment_discipline": "bill_on_time_ratio*0.5 + normalized_days_late*0.3 + autopay*0.2",
        "digital_stability": "normalized_phone_tenure*0.6 + recharge_consistency*0.4",
    },
}

meta_path = os.path.join(MODELS_DIR, "model_metadata_altdata.json")
with open(meta_path, "w") as f:
    json.dump(metadata, f, indent=2)
print(f"Metadata saved -> {meta_path}")

print(f"\nAll artifacts saved to: {MODELS_DIR}")

# %%
# Final summary
print("\n" + "=" * 60)
print("  ALT-DATA TRAINING COMPLETE")
print("=" * 60)
print(f"  Dataset:        {DATASET_PATH}")
print(f"  Train samples:  {X_train.shape[0]}")
print(f"  Test samples:   {X_test.shape[0]}")
print(f"  Total features: {len(ALL_FEATURES)}")
print(f"    Raw:          {len(raw_features)}")
print(f"    Engineered:   {len(ALL_FEATURES) - len(raw_features)}")
print(f"  Best RMSE:      {min(cb_rmse, xgb_rmse, ens_rmse):.4f}")
print(f"  Ensemble R2:    {ens_r2:.4f}")
print(f"  Models dir:     {MODELS_DIR}")
print("=" * 60)
print("\nNext: Refactor credit_scorer.py to load these models!")
