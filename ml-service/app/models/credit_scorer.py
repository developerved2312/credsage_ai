import numpy as np
import pandas as pd
from typing import Dict, List, Any
import logging
import os

logger = logging.getLogger(__name__)

class CreditScorer:
    """
    Credit Score Prediction Model
    
    This is a mock implementation that uses rule-based scoring.
    In production, this would load trained CatBoost/XGBoost models
    and use SHAP for explanations.
    """
    
    def __init__(self):
        self.model_loaded = False
        self.feature_names = [
            'recharge_freq_per_month', 'avg_recharge_value', 'recharge_gap_std',
            'bill_on_time_ratio', 'avg_days_late', 'autopay_enrolled',
            'monthly_spend_volatility', 'emi_usage_rate', 'order_freq_trend',
            'phone_tenure_months'
        ]
        self.categorical_features = ['autopay_enrolled']
        
        # Feature weights for rule-based scoring
        self.feature_weights = {
            'recharge_freq_per_month': 0.10,
            'avg_recharge_value': 0.12,
            'recharge_gap_std': -0.08,
            'bill_on_time_ratio': 0.25,
            'avg_days_late': -0.18,
            'autopay_enrolled': 0.08,
            'monthly_spend_volatility': -0.08,
            'emi_usage_rate': -0.10,
            'order_freq_trend': 0.05,
            'phone_tenure_months': 0.10,
        }
        
        logger.info("CreditScorer initialized (mock mode)")
        self.model_loaded = True
    
    def is_loaded(self) -> bool:
        """Check if model is loaded"""
        return self.model_loaded
    
    def get_feature_names(self) -> List[str]:
        """Get list of feature names"""
        return self.feature_names
    
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict credit score
        
        Args:
            features: Dictionary of input features
            
        Returns:
            Dictionary with score, category, confidence, and SHAP values
        """
        # Validate features
        self._validate_features(features)
        
        # Calculate base score using rule-based approach
        base_score = self._calculate_base_score(features)
        
        # Apply adjustments
        score = self._apply_adjustments(base_score, features)
        
        # Ensure score is in valid range (300-850)
        score = int(np.clip(score, 300, 850))
        
        # Determine score category
        category = self._get_score_category(score)
        
        # Calculate confidence (mock implementation)
        confidence = self._calculate_confidence(features, score)
        
        # Generate SHAP-like values (feature importance)
        shap_values = self._generate_shap_values(features, score)
        
        # Get top factors
        top_factors = self._get_top_factors(shap_values)
        
        return {
            'score': score,
            'scoreCategory': category,
            'confidence': round(confidence, 4),
            'shapValues': shap_values,
            'topFactors': top_factors,
            'modelVersion': '1.0.0'
        }
    
    def _validate_features(self, features: Dict[str, Any]) -> None:
        """Validate input features"""
        for feature in self.feature_names:
            if feature not in features:
                raise ValueError(f"Missing required feature: {feature}")
    
    def _calculate_base_score(self, features: Dict[str, Any]) -> float:
        """Calculate base credit score"""
        # Start with average score
        score = 650.0
        
        score += min(features['recharge_freq_per_month'] / 8, 1.0) * 35
        score += min(features['avg_recharge_value'] / 1000, 1.0) * 35
        score += (1 - min(features['recharge_gap_std'] / 30, 1.0)) * 25
        score += features['bill_on_time_ratio'] * 95
        score += (1 - min(features['avg_days_late'] / 30, 1.0)) * 50
        score += 20 if features['autopay_enrolled'] else 0
        score += (1 - min(features['monthly_spend_volatility'], 1.0)) * 30
        score += (1 - features['emi_usage_rate']) * 30
        score += min(features['phone_tenure_months'] / 60, 1.0) * 35
        
        return score
    
    def _apply_adjustments(self, base_score: float, features: Dict[str, Any]) -> float:
        """Apply additional adjustments based on other factors"""
        score = base_score
        
        if features['order_freq_trend'] > 0:
            score += min(features['order_freq_trend'] * 25, 20)
        else:
            score += max(features['order_freq_trend'] * 25, -20)
        
        return score
    
    def _get_score_category(self, score: int) -> str:
        """Determine credit score category"""
        if score >= 800:
            return "Excellent"
        elif score >= 740:
            return "Very Good"
        elif score >= 670:
            return "Good"
        elif score >= 580:
            return "Fair"
        else:
            return "Poor"
    
    def _calculate_confidence(self, features: Dict[str, Any], score: int) -> float:
        """Calculate prediction confidence"""
        # Mock confidence calculation
        # In real implementation, this would come from model uncertainty
        
        base_confidence = 0.85
        
        # Higher confidence for more stable profiles
        if features['phone_tenure_months'] >= 24:
            base_confidence += 0.05
        if features['bill_on_time_ratio'] >= 0.9:
            base_confidence += 0.05
        if features['avg_days_late'] <= 2:
            base_confidence += 0.03
        
        return min(base_confidence, 0.98)
    
    def _generate_shap_values(self, features: Dict[str, Any], score: int) -> Dict[str, float]:
        """Generate SHAP-like feature importance values"""
        shap_values = {}
        
        # Calculate approximate contributions (mock SHAP values)
        avg_score = 650
        total_contribution = score - avg_score
        
        # Distribute contributions based on feature weights
        for feature, weight in self.feature_weights.items():
            if feature in features:
                # Normalize feature value
                feature_value = features[feature]
                
                if feature == 'autopay_enrolled':
                    normalized = float(feature_value)
                elif feature in ('recharge_freq_per_month', 'phone_tenure_months'):
                    normalized = min(feature_value / (8 if feature == 'recharge_freq_per_month' else 60), 1.0)
                elif feature == 'avg_recharge_value':
                    normalized = min(feature_value / 1000, 1.0)
                elif feature in ('recharge_gap_std', 'avg_days_late'):
                    normalized = 1 - min(feature_value / (30 if feature == 'recharge_gap_std' else 30), 1.0)
                elif feature in ('bill_on_time_ratio', 'emi_usage_rate', 'monthly_spend_volatility'):
                    normalized = feature_value
                elif feature == 'order_freq_trend':
                    normalized = min(abs(feature_value), 1.0)
                else:
                    normalized = 0.5
                
                # Calculate SHAP value
                shap_value = weight * normalized * total_contribution
                shap_values[feature] = round(shap_value, 4)
        
        return shap_values
    
    def _get_top_factors(self, shap_values: Dict[str, float]) -> List[Dict[str, Any]]:
        """Get top contributing factors"""
        # Sort by absolute value
        sorted_factors = sorted(
            shap_values.items(),
            key=lambda x: abs(x[1]),
            reverse=True
        )
        
        # Format top 5 factors
        top_factors = []
        factor_names = {
            'recharge_freq_per_month': 'Recharge Frequency per Month',
            'avg_recharge_value': 'Average Recharge Value',
            'recharge_gap_std': 'Recharge Gap Standard Deviation',
            'bill_on_time_ratio': 'Bill On-Time Ratio',
            'avg_days_late': 'Average Days Late',
            'autopay_enrolled': 'Autopay Enrolled',
            'monthly_spend_volatility': 'Monthly Spend Volatility',
            'emi_usage_rate': 'EMI Usage Rate',
            'order_freq_trend': 'Order Frequency Trend',
            'phone_tenure_months': 'Phone Tenure Months',
        }
        
        for factor, value in sorted_factors[:5]:
            top_factors.append({
                'factor': factor_names.get(factor, factor),
                'impact': 'positive' if value > 0 else 'negative',
                'value': round(value, 4)
            })
        
        return top_factors
