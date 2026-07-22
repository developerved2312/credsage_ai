# CredSage ML Service

Machine Learning API for credit score prediction using FastAPI, CatBoost, XGBoost, and SHAP.

## Features

- Credit score prediction (300-850 range)
- SHAP-based explainability
- RESTful API with FastAPI
- Swagger/OpenAPI documentation
- Model versioning support

## Setup

### Prerequisites

- Python 3.11+
- pip

### Installation

1. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Run the server**
```bash
# Development
python -m uvicorn main:app --reload --port 8000

# Or using npm script
npm run dev
```

## API Endpoints

### Health Check
```
GET /health
```

### Predict Credit Score
```
POST /api/v1/credit/predict
Content-Type: application/json

{
  "recharge_freq_per_month": 4,
  "avg_recharge_value": 399,
  "recharge_gap_std": 2.5,
  "bill_on_time_ratio": 0.95,
  "avg_days_late": 1,
  "autopay_enrolled": true,
  "monthly_spend_volatility": 0.18,
  "emi_usage_rate": 0.25,
  "order_freq_trend": 0.12,
  "phone_tenure_months": 36
}
```

Response:
```json
{
  "score": 720,
  "scoreCategory": "Good",
  "confidence": 0.92,
  "shapValues": {
    "bill_on_time_ratio": 0.15,
    "phone_tenure_months": 0.12,
    "avg_days_late": -0.08
  },
  "topFactors": [
    {
      "factor": "Annual Income",
      "impact": "positive",
      "value": 0.15
    }
  ],
  "modelVersion": "1.0.0"
}
```

### Model Info
```
GET /api/v1/models/info
```

## Documentation

Once the server is running, access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Model Training

The current implementation uses a rule-based scoring system for demonstration.

To use actual ML models:

1. Train your CatBoost/XGBoost models
2. Save models to `./models/` directory
3. Update `CreditScorer` class to load trained models
4. Integrate SHAP for true explainability

### Example Model Training

```python
import catboost as cb
import pandas as pd

# Load training data
train_data = pd.read_csv('credit_data.csv')
X_train = train_data.drop('credit_score', axis=1)
y_train = train_data['credit_score']

# Train CatBoost model
model = cb.CatBoostRegressor(
    iterations=1000,
    learning_rate=0.03,
    depth=6,
    loss_function='RMSE'
)

model.fit(X_train, y_train)
model.save_model('./models/catboost_model.cbm')
```

## Testing

```bash
# Run tests
pytest

# Test with curl
curl -X POST http://localhost:8000/api/v1/credit/predict \
  -H "Content-Type: application/json" \
  -d @test_data.json
```

## Production Deployment

1. Set `ENVIRONMENT=production` in `.env`
2. Use proper WSGI server (Gunicorn + Uvicorn workers)
3. Configure logging and monitoring
4. Use actual trained models
5. Implement caching for predictions
6. Add authentication/authorization

```bash
gunicorn main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

## License

MIT
