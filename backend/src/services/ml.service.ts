import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';
import { Logger } from '../utils/logger';
import { AppError } from '../middleware/error.middleware';
import { z } from 'zod';

const logger = new Logger('MLService');

// Zod validation schema for ML service input
const MLCreditScoreInputSchema = z.object({
  age: z.number(),
  income: z.number(),
  employmentLength: z.number(),
  loanAmount: z.number(),
  loanTerm: z.number(),
  homeOwnership: z.string(),
  loanPurpose: z.string(),
  debtToIncome: z.number(),
  creditHistory: z.number(),
  numCreditLines: z.number(),
  numOpenAccounts: z.number(),
  totalDebt: z.number(),
});

export type CreditScoreInput = z.infer<typeof MLCreditScoreInputSchema>;

export interface CreditScorePrediction {
  score: number;
  scoreCategory: string;
  confidence: number;
  shapValues: Record<string, number>;
  topFactors: Array<{
    factor: string;
    impact: string;
    value: number;
  }>;
  modelVersion: string;
}

export class MLService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.ML_SERVICE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`ML Service Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('ML Service Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`ML Service Response: ${response.status}`);
        return response;
      },
      (error) => {
        logger.error('ML Service Response Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
          throw new AppError(503, 'ML Service is unavailable. Please try again later.');
        }
        
        if (error.response) {
          const message = error.response.data?.detail || 'ML Service error occurred';
          throw new AppError(error.response.status, message);
        }
        
        throw new AppError(500, 'Failed to connect to ML Service');
      }
    );
  }

  async predictCreditScore(input: CreditScoreInput): Promise<CreditScorePrediction> {
    logger.info('Requesting credit score prediction from ML service');

    // Validate input with Zod
    const validatedInput = MLCreditScoreInputSchema.parse(input);

    try {
      const response = await this.client.post<CreditScorePrediction>(
        '/api/v1/credit/predict',
        validatedInput
      );

      logger.info(`Credit score prediction received: ${response.data.score}`);
      return response.data;
    } catch (error) {
      logger.error('Credit score prediction failed:', error);
      throw error;
    }
  }

  async getCreditInsights(creditScoreId: string): Promise<any> {
    logger.info(`Requesting credit insights for score: ${creditScoreId}`);

    try {
      const response = await this.client.get(`/api/v1/credit/insights/${creditScoreId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get credit insights:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      logger.warn('ML Service health check failed');
      return false;
    }
  }
}
