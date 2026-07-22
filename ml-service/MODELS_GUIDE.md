# CredSage AI — Alt-Data Models Guide

This directory contains the final trained Machine Learning artifacts for the CredSage AI credit scoring engine, which has been specifically trained on **non-traditional digital signals** to fulfill the hackathon prompt requirements.

## 📁 Saved Artifacts (`/models`)

| File | Size | Description |
|------|------|-------------|
| `catboost_altdata.cbm` | ~240 KB | Trained CatBoost regressor (1000 iterations, depth 6) |
| `xgboost_altdata.json` | ~1.0 MB | Trained XGBoost regressor (1000 estimators, depth 6) |
| `model_metadata_altdata.json` | ~2 KB | Contains feature lists, engineered feature formulas, ensemble weights, and evaluation metrics. |
| `shap_importance_altdata.png` | ~120 KB | Global feature importance visualization using SHAP |
| `shap_beeswarm_altdata.png` | ~186 KB | Directional feature impact visualization |

---

## 📊 Model Performance (Alt-Data Dataset)

The models were trained to predict `credit_likelihood_score` (scale: 300 - 900) based on 10 raw alt-data signals and 6 engineered signals.

| Model | RMSE | MAE | R² Score |
|-------|------|-----|----------|
| **CatBoost** | 60.75 | 48.43 | 0.3748 |
| **XGBoost** | 61.23 | 48.81 | 0.3649 |
| **Ensemble** | 60.87 | 48.52 | 0.3723 |

**Note on metrics**: The R² is lower than traditional credit datasets because synthetic behavioral data contains intentionally injected real-world noise (via `NOISE_STD`), preventing the model from achieving a perfect 1.0 fit and making it behave realistically. 

- **Best single model**: CatBoost
- **Ensemble weights**: CatBoost 50.19% / XGBoost 49.80%

---

## 🧠 Feature Engineering Requirements

When implementing this in `credit_scorer.py`, the backend MUST take the 10 raw features from the request and engineer 6 additional features **before** passing the array to the model:

```python
# Assuming 'features' is a dict containing the 10 raw inputs:
features['bill_regularity_index'] = 1 - (features['avg_days_late'] / 2.0)  # using dataset mean approx
features['recharge_consistency'] = 1 - (features['recharge_gap_std'] / 30.0) # approx max
features['spend_stability'] = 1 - (features['monthly_spend_volatility'] / 5000.0) # approx max
features['recharge_intensity'] = features['avg_recharge_value'] / (features['recharge_freq_per_month'] + 1)

features['payment_discipline'] = (
    features['bill_on_time_ratio'] * 0.5 
    + (1 - (features['avg_days_late'] / 30.0)) * 0.3 
    + features['autopay_enrolled'] * 0.2
)

features['digital_stability'] = (
    (features['phone_tenure_months'] / 120.0) * 0.6 
    + features['recharge_consistency'] * 0.4
)
```

---

## 💻 Python Integration Guide

### 1. Loading the Models
```python
from catboost import CatBoostRegressor
from xgboost import XGBRegressor
import json

# Load metadata for weights & feature ordering
with open("./models/model_metadata_altdata.json", "r") as f:
    metadata = json.load(f)

weights = metadata["ensemble_weights"]
ordered_features = metadata["feature_names"]

# Load CatBoost
cb_model = CatBoostRegressor()
cb_model.load_model("./models/catboost_altdata.cbm")

# Load XGBoost
xgb_model = XGBRegressor()
xgb_model.load_model("./models/xgboost_altdata.json")
```

### 2. Making Predictions & Extracting SHAP
```python
import shap
import pandas as pd
import numpy as np

# Convert engineered dict into a DataFrame matching exact feature order
input_df = pd.DataFrame([features])[ordered_features]

# Ensemble Prediction
cb_pred = cb_model.predict(input_df)[0]
xgb_pred = xgb_model.predict(input_df)[0]
final_score = (weights["catboost"] * cb_pred) + (weights["xgboost"] * xgb_pred)

# SHAP Explanations (Using CatBoost)
explainer = shap.TreeExplainer(cb_model)
shap_values = explainer.shap_values(input_df)[0]

# Extract Top 3 Factors
abs_shap = np.abs(shap_values)
top3_indices = np.argsort(abs_shap)[-3:][::-1]

top_factors = []
for idx in top3_indices:
    feat_name = ordered_features[idx]
    impact = "positive" if shap_values[idx] > 0 else "negative"
    top_factors.append({
        "factor": feat_name,
        "impact": impact,
        "value": float(shap_values[idx])
    })
```
