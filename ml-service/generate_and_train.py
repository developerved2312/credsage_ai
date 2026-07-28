#!/usr/bin/env python3
"""
Generate synthetic alt-data credit dataset and train the CatBoost + XGBoost
ensemble used by app/models/credit_scorer.py.

Produces:
  - models/catboost_altdata.cbm
  - models/xgboost_altdata.json
  - models/model_metadata_altdata.json
"""

import os
import json
import logging
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from catboost import CatBoostRegressor, Pool
from xgboost import XGBRegressor
import shap

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

np.random.seed(42)

N_SAMPLES = 5000
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

RAW_FEATURES = [
    "recharge_freq_per_month",
    "avg_recharge_value",
    "recharge_gap_std",
    "bill_on_time_ratio",
    "avg_days_late",
    "autopay_enrolled",
    "monthly_spend_volatility",
    "emi_usage_rate",
    "order_freq_trend",
    "phone_tenure_months",
]


def generate_synthetic_dataset(n: int) -> pd.DataFrame:
    """Create realistic synthetic behavioral credit data."""
    df = pd.DataFrame()

    df["recharge_freq_per_month"] = np.clip(np.random.poisson(4, n) + np.random.normal(0, 1, n), 0, 15)
    df["avg_recharge_value"] = np.clip(np.random.lognormal(5.5, 0.5, n), 50, 3000)
    df["recharge_gap_std"] = np.clip(np.random.exponential(5, n), 0.1, 30)
    df["bill_on_time_ratio"] = np.clip(np.random.beta(8, 2, n), 0, 1)
    df["avg_days_late"] = np.clip(np.random.exponential(3, n), 0, 30)
    df["autopay_enrolled"] = np.random.binomial(1, 0.35, n)
    df["monthly_spend_volatility"] = np.clip(np.random.exponential(1200, n), 100, 5000)
    df["emi_usage_rate"] = np.clip(np.random.beta(2, 8, n), 0, 1)
    df["order_freq_trend"] = np.clip(np.random.normal(0.05, 0.2, n), -1, 1)
    df["phone_tenure_months"] = np.clip(np.random.poisson(36, n) + 6, 1, 120)

    # Engineered features
    avg_days_late_mean = 2.0
    recharge_gap_std_max = 30.0
    spend_vol_max = 5000.0
    phone_tenure_max = 120.0

    df["bill_regularity_index"] = 1.0 - (df["avg_days_late"] / avg_days_late_mean)
    df["recharge_consistency"] = 1.0 - (df["recharge_gap_std"] / recharge_gap_std_max)
    df["spend_stability"] = 1.0 - (df["monthly_spend_volatility"] / spend_vol_max)
    df["recharge_intensity"] = df["avg_recharge_value"] / (df["recharge_freq_per_month"] + 1.0)
    df["payment_discipline"] = (
        df["bill_on_time_ratio"] * 0.5
        + (1.0 - (df["avg_days_late"] / 30.0)) * 0.3
        + df["autopay_enrolled"] * 0.2
    )
    df["digital_stability"] = (
        (df["phone_tenure_months"] / phone_tenure_max) * 0.6
        + df["recharge_consistency"] * 0.4
    )

    # Target: credit score 300-900, built from weighted behavioral signals plus noise
    score = (
        400
        + 80 * df["bill_on_time_ratio"]
        + 60 * df["payment_discipline"]
        + 40 * df["digital_stability"]
        + 30 * df["spend_stability"]
        - 50 * df["emi_usage_rate"]
        - 30 * (df["avg_days_late"] / 30.0)
        - 20 * (df["monthly_spend_volatility"] / spend_vol_max)
        + 15 * df["order_freq_trend"]
        + np.random.normal(0, 50, n)
    )
    df["credit_likelihood_score"] = np.clip(score, 300, 900).astype(int)

    # Risk bucket aligned with credit_scorer.py thresholds (>=720 low, >=580 medium, else high)
    conditions = [
        df["credit_likelihood_score"] >= 720,
        df["credit_likelihood_score"] >= 580,
    ]
    choices = ["low", "medium"]
    df["risk_bucket"] = np.select(conditions, choices, default="high")

    return df


def main():
    logger.info("Generating synthetic alt-data dataset...")
    df = generate_synthetic_dataset(N_SAMPLES)

    engineered_features = [
        "bill_regularity_index",
        "recharge_consistency",
        "spend_stability",
        "recharge_intensity",
        "payment_discipline",
        "digital_stability",
    ]
    all_features = RAW_FEATURES + engineered_features
    target = "credit_likelihood_score"

    X = df[all_features]
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    logger.info("Training CatBoost regressor...")
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
    test_pool = Pool(X_test, y_test)
    cb_model.fit(train_pool, eval_set=test_pool, use_best_model=True)

    cb_preds = cb_model.predict(X_test)
    cb_rmse = float(np.sqrt(mean_squared_error(y_test, cb_preds)))
    cb_mae = float(mean_absolute_error(y_test, cb_preds))
    cb_r2 = float(r2_score(y_test, cb_preds))

    logger.info("Training XGBoost regressor...")
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
        X_train,
        y_train,
        eval_set=[(X_test, y_test)],
        verbose=100,
    )

    xgb_preds = xgb_model.predict(X_test)
    xgb_rmse = float(np.sqrt(mean_squared_error(y_test, xgb_preds)))
    xgb_mae = float(mean_absolute_error(y_test, xgb_preds))
    xgb_r2 = float(r2_score(y_test, xgb_preds))

    # Ensemble with inverse-RMSE weighting
    w_cb = 1 / cb_rmse
    w_xgb = 1 / xgb_rmse
    total = w_cb + w_xgb
    w_cb = w_cb / total
    w_xgb = w_xgb / total

    ensemble_preds = w_cb * cb_preds + w_xgb * xgb_preds
    ens_rmse = float(np.sqrt(mean_squared_error(y_test, ensemble_preds)))
    ens_mae = float(mean_absolute_error(y_test, ensemble_preds))
    ens_r2 = float(r2_score(y_test, ensemble_preds))

    logger.info("CatBoost  -> RMSE: %.4f | MAE: %.4f | R2: %.4f", cb_rmse, cb_mae, cb_r2)
    logger.info("XGBoost   -> RMSE: %.4f | MAE: %.4f | R2: %.4f", xgb_rmse, xgb_mae, xgb_r2)
    logger.info("Ensemble  -> RMSE: %.4f | MAE: %.4f | R2: %.4f", ens_rmse, ens_mae, ens_r2)

    # Save models
    cb_path = os.path.join(MODELS_DIR, "catboost_altdata.cbm")
    xgb_path = os.path.join(MODELS_DIR, "xgboost_altdata.json")
    meta_path = os.path.join(MODELS_DIR, "model_metadata_altdata.json")

    cb_model.save_model(cb_path)
    logger.info("Saved CatBoost model to %s", cb_path)

    xgb_model.save_model(xgb_path)
    logger.info("Saved XGBoost model to %s", xgb_path)

    metadata = {
        "model_type": "alt_data_ensemble",
        "model_version": "3.0.0-altdata",
        "ensemble_weights": {
            "catboost": round(w_cb, 6),
            "xgboost": round(w_xgb, 6),
        },
        "feature_names": all_features,
        "raw_features": RAW_FEATURES,
        "engineered_features": engineered_features,
        "target": target,
        "score_range": {"min": 300, "max": 900},
        "metrics": {
            "catboost": {"rmse": cb_rmse, "mae": cb_mae, "r2": cb_r2},
            "xgboost": {"rmse": xgb_rmse, "mae": xgb_mae, "r2": xgb_r2},
            "ensemble": {"rmse": ens_rmse, "mae": ens_mae, "r2": ens_r2},
        },
        "feature_engineering": {
            "bill_regularity_index": "1 - (avg_days_late / 2.0)",
            "recharge_consistency": "1 - (recharge_gap_std / 30.0)",
            "spend_stability": "1 - (monthly_spend_volatility / 5000.0)",
            "recharge_intensity": "avg_recharge_value / (recharge_freq_per_month + 1)",
            "payment_discipline": "bill_on_time_ratio*0.5 + (1 - avg_days_late/30.0)*0.3 + autopay*0.2",
            "digital_stability": "(phone_tenure_months/120.0)*0.6 + recharge_consistency*0.4",
        },
    }

    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
    logger.info("Saved model metadata to %s", meta_path)

    # Generate SHAP summary plots for documentation
    try:
        explainer = shap.TreeExplainer(cb_model)
        shap_values = explainer.shap_values(X_test)

        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt

        shap.summary_plot(shap_values, X_test, plot_type="bar", show=False)
        plt.title("SHAP Feature Importance - CatBoost (Alt-Data)")
        plt.tight_layout()
        plt.savefig(os.path.join(MODELS_DIR, "shap_importance_altdata.png"), dpi=150, bbox_inches="tight")
        plt.close()

        shap.summary_plot(shap_values, X_test, show=False)
        plt.title("SHAP Beeswarm - CatBoost (Alt-Data)")
        plt.tight_layout()
        plt.savefig(os.path.join(MODELS_DIR, "shap_beeswarm_altdata.png"), dpi=150, bbox_inches="tight")
        plt.close()

        logger.info("Saved SHAP plots to %s", MODELS_DIR)
    except Exception as e:
        logger.warning("SHAP plotting skipped: %s", e)

    logger.info("Training complete.")


if __name__ == "__main__":
    main()
