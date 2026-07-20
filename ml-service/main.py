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
    age: int = Field(..., ge=18, le=100, description="Age of the applicant")
    income: float = Field(..., gt=0, description="Annual income")
    employmentLength: int = Field(..., ge=0, description="Years of employment")
    loanAmount: float = Field(..., gt=0, description="Requested loan amount")
    loanTerm: int = Field(..., gt=0, description="Loan term in months")
    homeOwnership: str = Field(..., description="Home ownership status")
    loanPurpose: str = Field(..., description="Purpose of the loan")
    debtToIncome: float = Field(..., ge=0, le=1, description="Debt-to-income ratio")
    creditHistory: int = Field(..., ge=0, description="Years of credit history")
    numCreditLines: int = Field(..., ge=0, description="Number of credit lines")
    numOpenAccounts: int = Field(..., ge=0, description="Number of open accounts")
    totalDebt: float = Field(..., ge=0, description="Total debt amount")

    class Config:
        json_schema_extra = {
            "example": {
                "age": 32,
                "income": 75000,
                "employmentLength": 5,
                "loanAmount": 25000,
                "loanTerm": 36,
                "homeOwnership": "RENT",
                "loanPurpose": "debt_consolidation",
                "debtToIncome": 0.35,
                "creditHistory": 8,
                "numCreditLines": 5,
                "numOpenAccounts": 3,
                "totalDebt": 15000
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
