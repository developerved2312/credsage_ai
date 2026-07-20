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
            'age', 'income', 'employmentLength', 'loanAmount', 'loanTerm',
            'homeOwnership', 'loanPurpose', 'debtToIncome', 'creditHistory',
            'numCreditLines', 'numOpenAccounts', 'totalDebt'
        ]
        self.categorical_features = ['homeOwnership', 'loanPurpose']
        
        # Feature weights for rule-based scoring
        self.feature_weights = {
            'income': 0.20,
            'debtToIncome': -0.25,
            'creditHistory': 0.18,
            'employmentLength': 0.12,
            'numCreditLines': 0.10,
            'numOpenAccounts': 0.08,
            'loanAmount': -0.05,
            'totalDebt': -0.15,
            'age': 0.05,
            'loanTerm': -0.02
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
        
        # Income factor (normalize to 0-1 range, assuming max 500k)
        income_factor = min(features['income'] / 500000, 1.0)
        score += income_factor * 100
        
        # Debt-to-income factor (lower is better)
        dti_factor = 1 - features['debtToIncome']
        score += dti_factor * 80
        
        # Credit history factor (normalize, assuming max 30 years)
        history_factor = min(features['creditHistory'] / 30, 1.0)
        score += history_factor * 70
        
        # Employment length factor (normalize, assuming max 40 years)
        emp_factor = min(features['employmentLength'] / 40, 1.0)
        score += emp_factor * 50
        
        return score
    
    def _apply_adjustments(self, base_score: float, features: Dict[str, Any]) -> float:
        """Apply additional adjustments based on other factors"""
        score = base_score
        
        # Number of credit lines (more is generally better, up to a point)
        if features['numCreditLines'] >= 3:
            score += min((features['numCreditLines'] - 3) * 5, 30)
        
        # Home ownership bonus
        if features['homeOwnership'] == 'OWN':
            score += 20
        elif features['homeOwnership'] == 'MORTGAGE':
            score += 10
        
        # Age factor (older is generally more stable)
        if features['age'] >= 40:
            score += 15
        elif features['age'] >= 30:
            score += 10
        
        # High debt penalty
        if features['totalDebt'] > features['income'] * 0.5:
            score -= 30
        
        # Loan amount vs income ratio
        loan_to_income = features['loanAmount'] / features['income']
        if loan_to_income > 0.5:
            score -= 20
        elif loan_to_income > 0.3:
            score -= 10
        
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
        if features['creditHistory'] > 5:
            base_confidence += 0.05
        if features['employmentLength'] > 3:
            base_confidence += 0.05
        if features['debtToIncome'] < 0.3:
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
            if feature in features and not isinstance(features[feature], str):
                # Normalize feature value
                feature_value = features[feature]
                
                if feature == 'income':
                    normalized = min(feature_value / 100000, 1.0)
                elif feature == 'debtToIncome':
                    normalized = feature_value
                elif feature == 'creditHistory':
                    normalized = min(feature_value / 20, 1.0)
                elif feature == 'employmentLength':
                    normalized = min(feature_value / 30, 1.0)
                elif feature == 'totalDebt':
                    normalized = min(feature_value / 50000, 1.0)
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
            'income': 'Annual Income',
            'debtToIncome': 'Debt-to-Income Ratio',
            'creditHistory': 'Credit History Length',
            'employmentLength': 'Employment Length',
            'numCreditLines': 'Number of Credit Lines',
            'numOpenAccounts': 'Open Accounts',
            'totalDebt': 'Total Debt',
            'loanAmount': 'Loan Amount',
            'age': 'Age',
            'loanTerm': 'Loan Term'
        }
        
        for factor, value in sorted_factors[:5]:
            top_factors.append({
                'factor': factor_names.get(factor, factor),
                'impact': 'positive' if value > 0 else 'negative',
                'value': round(value, 4)
            })
        
        return top_factors
