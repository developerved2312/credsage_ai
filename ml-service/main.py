from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, List
import logging
from datetime import datetime

from app.models.credit_scorer import CreditScorer
from app.config import settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="CredSage ML Service",
    description="Machine Learning API for Credit Score Prediction",
    version=settings.MODEL_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize credit scorer
credit_scorer = CreditScorer()

# Request/Response Models
class CreditScoreRequest(BaseModel):
    recharge_freq_per_month: float = Field(..., ge=0, description="Average recharges per month")
    avg_recharge_value: float = Field(..., ge=0, description="Average recharge value")
    recharge_gap_std: float = Field(..., ge=0, description="Recharge-gap standard deviation")
    bill_on_time_ratio: float = Field(..., ge=0, le=1, description="Ratio of bills paid on time")
    avg_days_late: float = Field(..., ge=0, description="Average days a bill is late")
    autopay_enrolled: bool = Field(..., description="Whether autopay is enrolled")
    monthly_spend_volatility: float = Field(..., ge=0, description="Monthly spend volatility")
    emi_usage_rate: float = Field(..., ge=0, le=1, description="EMI usage rate")
    order_freq_trend: float = Field(..., description="Order-frequency trend")
    phone_tenure_months: int = Field(..., ge=0, description="Phone tenure in months")

    class Config:
        json_schema_extra = {
            "example": {
                "recharge_freq_per_month": 4,
                "avg_recharge_value": 399,
                "recharge_gap_std": 2.5,
                "bill_on_time_ratio": 0.95,
                "avg_days_late": 1,
                "autopay_enrolled": True,
                "monthly_spend_volatility": 0.18,
                "emi_usage_rate": 0.25,
                "order_freq_trend": 0.12,
                "phone_tenure_months": 36
            }
        }

class CreditScoreResponse(BaseModel):
    score: int
    scoreCategory: str
    confidence: float
    shapValues: Dict[str, float]
    topFactors: List[Dict[str, any]]
    modelVersion: str

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    model_loaded: bool

# Routes
@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint"""
    return {
        "service": "CredSage ML Service",
        "version": settings.MODEL_VERSION,
        "status": "running"
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        version=settings.MODEL_VERSION,
        model_loaded=credit_scorer.is_loaded()
    )

@app.post("/api/v1/credit/predict", response_model=CreditScoreResponse)
async def predict_credit_score(request: CreditScoreRequest):
    """
    Predict credit score based on input features
    
    Returns credit score (300-850), category, confidence, and SHAP explanations
    """
    try:
        logger.info(f"Credit score prediction request received")
        
        # Convert request to dict
        features = request.model_dump()
        
        # Make prediction
        result = credit_scorer.predict(features)
        
        logger.info(f"Prediction completed: score={result['score']}")
        
        return CreditScoreResponse(**result)
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/credit/insights/{credit_score_id}")
async def get_credit_insights(credit_score_id: str):
    """
    Get detailed insights for a credit score
    
    This endpoint would typically fetch additional analysis
    """
    # Placeholder for future implementation
    return {
        "creditScoreId": credit_score_id,
        "insights": {
            "message": "Detailed insights coming soon",
            "recommendations": []
        }
    }

@app.get("/api/v1/models/info")
async def get_model_info():
    """Get information about the loaded model"""
    return {
        "modelType": settings.MODEL_TYPE,
        "modelVersion": settings.MODEL_VERSION,
        "features": credit_scorer.get_feature_names(),
        "scoreRange": {"min": 300, "max": 850}
    }

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "status_code": 500}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development"
    )
