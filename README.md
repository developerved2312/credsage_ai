# CredSage AI

AI-powered credit scoring and investment recommendation platform with intelligent chatbot assistance.

## Architecture

```
React + TypeScript Frontend
         ↓
Node.js API (Express + Prisma)
         ↓
Neon PostgreSQL
         ↓
┌────────┬──────────┬──────────┐
│ Credit │Investment│   Chat   │
│Service │ Service  │ Service  │
└────┬───┴────┬─────┴────┬─────┘
     ↓        ↓          ↓
Python ML  Recommendation LLM API
(FastAPI)     Engine    (Gemini)
```

## Project Structure

```
credsage-ai/
├── backend/          # Node.js + Express + Prisma
├── frontend/         # React + TypeScript + Vite
└── ml-service/       # Python FastAPI ML service
```

## Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: Neon PostgreSQL
- **Validation**: Zod

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router
- **HTTP Client**: Axios
- **UI**: TailwindCSS (optional)

### ML Service
- **Framework**: FastAPI
- **ML Libraries**: CatBoost, XGBoost, SHAP
- **Language**: Python 3.11+

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (or Neon account)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd credsage-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**

Create `.env` files in each service directory:

**backend/.env**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/credsage"
JWT_SECRET="your-secret-key"
ML_SERVICE_URL="http://localhost:8000"
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```

**ml-service/.env**
```env
MODEL_PATH="./models"
PORT=8000
```

4. **Setup database**
```bash
npm run prisma:migrate
```

5. **Start development servers**
```bash
# All services
npm run dev

# Or individually
npm run dev:backend
npm run dev:frontend
npm run dev:ml
```

## API Endpoints

### User Module
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Credit Module
- `POST /api/credit/score` - Calculate credit score
- `GET /api/credit/history` - Get credit history
- `GET /api/credit/factors` - Get SHAP explanations

### Investment Module
- `GET /api/investment/recommendations` - Get personalized recommendations
- `POST /api/investment/portfolio` - Create portfolio
- `GET /api/investment/portfolio` - Get portfolio status

### Chatbot Module
- `POST /api/chatbot/message` - Send message to AI assistant
- `GET /api/chatbot/history` - Get chat history

## Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### ML Service Development
```bash
cd ml-service
python -m uvicorn main:app --reload
```

### Database Management
```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

## Features

- Credit score prediction using ML models
- Explainable AI with SHAP values
- Personalized investment recommendations
- AI-powered financial chatbot
- User authentication & authorization
- Real-time credit monitoring
- Portfolio tracking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
