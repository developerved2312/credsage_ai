// User Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  employmentStatus?: string;
  annualIncome?: number;
  occupation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Credit Score Types
export interface CreditScore {
  id: string;
  score: number;
  scoreCategory: string;
  confidence: number;
  modelVersion: string;
  shapValues?: Record<string, number>;
  topFactors?: Array<{
    factor: string;
    impact: string;
    value: number;
  }>;
  createdAt: string;
}

export interface CreditScoreInput {
  age: number;
  income: number;
  employmentLength: number;
  loanAmount: number;
  loanTerm: number;
  homeOwnership: string;
  loanPurpose: string;
  debtToIncome: number;
  creditHistory: number;
  numCreditLines: number;
  numOpenAccounts: number;
  totalDebt: number;
}

// Investment Types
export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  totalValue: number;
  cashBalance: number;
  riskTolerance: string;
  investmentHorizon?: string;
  totalReturn?: number;
  totalReturnPercent?: number;
  isActive: boolean;
  investments?: Investment[];
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  id: string;
  symbol: string;
  name: string;
  type: string;
  quantity: number;
  purchasePrice: number;
  currentPrice?: number;
  totalValue?: number;
  profitLoss?: number;
  profitLossPercent?: number;
  recommendationScore?: number;
  riskLevel?: string;
  createdAt: string;
}

export interface InvestmentRecommendation {
  symbol: string;
  name: string;
  type: string;
  recommendedAllocation: number;
  recommendedAmount: number;
  riskLevel: string;
  expectedReturn: number;
  reasoningPoints: string[];
  score: number;
}

// Chatbot Types
export interface ChatConversation {
  id: string;
  title: string;
  context?: string;
  lastMessageAt?: string;
  createdAt: string;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: string;
  content: string;
  model?: string;
  tokens?: number;
  createdAt: string;
}

export interface SendMessageRequest {
  conversationId?: string;
  message: string;
  context?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
