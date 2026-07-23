import numpy as np
import pandas as pd
from typing import Dict, List, Any
import logging
import os
import json
from catboost import CatBoostRegressor
from xgboost import XGBRegressor
import shap

logger = logging.getLogger(__name__)

class CreditScorer:
    """
    Credit Score Prediction Model
    
    Loads trained CatBoost and XGBoost alt-data models,
    performs real-time feature engineering, and uses SHAP
    to return top-3 interpretability factors.
    """
    
    def __init__(self):
        self.model_loaded = False
        
        # Paths to models
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.models_dir = os.path.join(base_dir, "models")
        
        self.catboost_path = os.path.join(self.models_dir, "catboost_altdata.cbm")
        self.xgboost_path = os.path.join(self.models_dir, "xgboost_altdata.json")
        self.metadata_path = os.path.join(self.models_dir, "model_metadata_altdata.json")
        
        try:
            # Load Metadata
            with open(self.metadata_path, "r") as f:
                self.metadata = json.load(f)
                
            self.ensemble_weights = self.metadata["ensemble_weights"]
            self.ordered_features = self.metadata["feature_names"]
            self.raw_features = self.metadata["raw_features"]
            
            # Load CatBoost
            self.cb_model = CatBoostRegressor()
            self.cb_model.load_model(self.catboost_path)
            
            # Load XGBoost
            self.xgb_model = XGBRegressor()
            self.xgb_model.load_model(self.xgboost_path)
            
            # Initialize SHAP explainer (using CatBoost for speed)
            self.explainer = shap.TreeExplainer(self.cb_model)
            
            logger.info("Alt-Data CreditScorer models loaded successfully")
            self.model_loaded = True
            
        except Exception as e:
            logger.error(f"Failed to load models: {str(e)}")
            self.model_loaded = False

    def is_loaded(self) -> bool:
        """Check if model is loaded"""
        return self.model_loaded
    
    def get_feature_names(self) -> List[str]:
        """Get list of raw feature names expected by the API"""
        return self.raw_features if self.model_loaded else []
        
    def _preprocess_features(self, raw_features: Dict[str, Any]) -> Dict[str, float]:
        """
        Engineers the 6 alt-data features from the 10 raw inputs.
        Formulas derived from train_alt_model.ipynb
        """
        f = dict(raw_features) # copy
        
        # Means and maxes extracted from training distribution
        avg_days_late_mean = 2.0
        recharge_gap_std_max = 30.0
        spend_vol_max = 5000.0
        phone_tenure_max = 120.0
        
        # 1. Bill regularity index
        f['bill_regularity_index'] = 1.0 - (f['avg_days_late'] / avg_days_late_mean)
        
        # 2. Recharge consistency
        f['recharge_consistency'] = 1.0 - (f['recharge_gap_std'] / recharge_gap_std_max)
        
        # 3. Spend stability
        f['spend_stability'] = 1.0 - (f['monthly_spend_volatility'] / spend_vol_max)
        
        # 4. Recharge intensity
        f['recharge_intensity'] = f['avg_recharge_value'] / (f['recharge_freq_per_month'] + 1.0)
        
        # 5. Payment discipline
        normalized_days_late = 1.0 - (min(f['avg_days_late'], 30.0) / 30.0)
        f['payment_discipline'] = (
            f['bill_on_time_ratio'] * 0.5 
            + normalized_days_late * 0.3 
            + float(f['autopay_enrolled']) * 0.2
        )
        
        # 6. Digital stability
        f['digital_stability'] = (
            (min(f['phone_tenure_months'], phone_tenure_max) / phone_tenure_max) * 0.6 
            + f['recharge_consistency'] * 0.4
        )
        
        return f

    def predict(self, raw_features: Dict[str, Any]) -> Dict[str, Any]:
        """Predict credit score and generate explanations"""
        if not self.is_loaded():
            raise RuntimeError("Models are not loaded.")
            
        # 1. Feature Engineering
        full_features = self._preprocess_features(raw_features)
        
        # 2. Format into DataFrame with correct column order
        input_df = pd.DataFrame([full_features])[self.ordered_features]
        
        # 3. Predict Ensemble
        cb_pred = self.cb_model.predict(input_df)[0]
        xgb_pred = self.xgb_model.predict(input_df)[0]
        
        score = (self.ensemble_weights["catboost"] * cb_pred) + (self.ensemble_weights["xgboost"] * xgb_pred)
        score = int(np.clip(score, 300, 900))
        
        # 4. Score Category (High/Medium/Low as per ps.txt risk buckets)
        if score >= 720:
            category = "Low Risk"
        elif score >= 580:
            category = "Medium Risk"
        else:
            category = "High Risk"
            
        # 5. SHAP Explanations
        shap_values = self.explainer.shap_values(input_df)[0]
        top_factors = self._get_top_factors(shap_values)
        
        # Format SHAP values for full dictionary response if needed
        shap_dict = {feat: round(float(val), 4) for feat, val in zip(self.ordered_features, shap_values)}
        
        # Confidence calculation based on variance between the two models
        variance = abs(cb_pred - xgb_pred)
        confidence = max(0.5, 1.0 - (variance / 100.0))
        
        return {
            'score': score,
            'scoreCategory': category,
            'confidence': round(confidence, 4),
            'shapValues': shap_dict,
            'topFactors': top_factors,
            'modelVersion': self.metadata.get("model_version", "1.0.0")
        }
        
    def _get_top_factors(self, shap_values: np.ndarray) -> List[Dict[str, Any]]:
        """Extract top 3 contributing factors via SHAP"""
        abs_shap = np.abs(shap_values)
        top3_indices = np.argsort(abs_shap)[-3:][::-1]
        
        # User-friendly mapping for frontend display
        friendly_names = {
            'recharge_freq_per_month': 'Mobile Recharge Frequency',
            'avg_recharge_value': 'Average Recharge Value',
            'recharge_gap_std': 'Consistency of Mobile Recharges',
            'bill_on_time_ratio': 'Utility Bills Paid On Time',
            'avg_days_late': 'Days Late on Utility Bills',
            'autopay_enrolled': 'Autopay Enrollment Status',
            'monthly_spend_volatility': 'E-commerce Spend Volatility',
            'emi_usage_rate': 'Usage of EMIs (Buy Now Pay Later)',
            'order_freq_trend': 'E-commerce Order Trend',
            'phone_tenure_months': 'Mobile Phone Tenure',
            'bill_regularity_index': 'Overall Bill Regularity',
            'recharge_consistency': 'Recharge Consistency Index',
            'spend_stability': 'Overall Spend Stability',
            'recharge_intensity': 'Recharge Spend Intensity',
            'payment_discipline': 'Payment Discipline Score',
            'digital_stability': 'Digital Footprint Stability'
        }
        
        top_factors = []
        for idx in top3_indices:
            raw_feat = self.ordered_features[idx]
            val = float(shap_values[idx])
            
            impact = "positive" if val > 0 else "negative"
            
            top_factors.append({
                "factor": friendly_names.get(raw_feat, raw_feat),
                "impact": impact,
                "value": round(val, 4)
            })
            
        return top_factors
