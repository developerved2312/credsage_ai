# CredSage AI Frontend

React + TypeScript frontend for CredSage AI platform.

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Create environment file**
```bash
cp .env.example .env
```

3. **Configure environment**
```env
VITE_API_URL=http://localhost:3000/api
```

4. **Start development server**
```bash
npm run dev
```

The app will be available at http://localhost:5173

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── common/      # Common components (Button, Input, etc.)
│   │   ├── layouts/     # Layout components
│   │   └── features/    # Feature-specific components
│   ├── pages/           # Page components
│   │   ├── auth/        # Authentication pages
│   │   ├── credit/      # Credit score pages
│   │   ├── investment/  # Investment pages
│   │   ├── chatbot/     # Chatbot pages
│   │   └── profile/     # Profile pages
│   ├── services/        # API service layer
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Zustand stores
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # App entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind configuration
└── tsconfig.json       # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Features

### Authentication
- User registration and login
- JWT token-based authentication
- Protected routes
- Persistent auth state

### Credit Score
- Calculate credit score with ML predictions
- View credit history
- SHAP-based explainability
- Credit score trends

### Investments
- Portfolio management
- Investment tracking
- Performance analytics
- AI-powered recommendations

### Chatbot
- Context-aware financial assistant
- Chat history management
- Multi-conversation support
- Real-time responses

### Profile
- User profile management
- Account settings
- Personal information

## Styling

The app uses TailwindCSS for styling with a custom design system:

- **Colors**: Primary blue palette with semantic colors
- **Typography**: Inter font family
- **Components**: Pre-styled button, input, card components
- **Responsive**: Mobile-first responsive design

## State Management

- **Zustand**: Lightweight state management
- **React Query**: Server state and caching
- **Persist**: Local storage persistence for auth

## API Integration

All API calls go through the centralized `api` client in `utils/api.ts`:

- Automatic auth token injection
- Error handling and retry logic
- Request/response interceptors
- Type-safe responses

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Deployment

The frontend can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

Make sure to set the `VITE_API_URL` environment variable to your production API URL.

## Development Guidelines

1. **Component Structure**: Use functional components with hooks
2. **TypeScript**: Define proper types for all data structures
3. **Styling**: Use Tailwind utility classes
4. **State**: Use Zustand for global state, React Query for server state
5. **Code Quality**: Run lint and format before committing

## License

MIT
