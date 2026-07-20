import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';
import { Logger } from '../utils/logger';
import { AppError } from '../middleware/error.middleware';

const logger = new Logger('LLMService');

export interface MessageHistory {
  role: string;
  content: string;
}

export interface UserContext {
  creditScore?: {
    score: number;
    scoreCategory: string;
    topFactors: any;
  } | null;
  portfolios?: any[];
}

export interface GenerateResponseInput {
  message: string;
  messageHistory: MessageHistory[];
  context: string;
  userContext: UserContext;
}

export interface LLMResponse {
  content: string;
  model: string;
  tokens: number;
}

export class LLMService {
  private geminiApiKey?: string;
  private openaiApiKey?: string;
  private openaiClient?: AxiosInstance;

  constructor() {
    this.geminiApiKey = env.GEMINI_API_KEY;
    this.openaiApiKey = env.OPENAI_API_KEY;

    if (this.openaiApiKey) {
      this.openaiClient = axios.create({
        baseURL: 'https://api.openai.com/v1',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
    }
  }

  async generateResponse(input: GenerateResponseInput): Promise<LLMResponse> {
    logger.info('Generating AI response');

    // Build system prompt based on context
    const systemPrompt = this.buildSystemPrompt(input.context, input.userContext);

    // Try Gemini first, fallback to OpenAI, then to mock
    if (this.geminiApiKey) {
      try {
        return await this.generateWithGemini(systemPrompt, input.message, input.messageHistory);
      } catch (error) {
        logger.warn('Gemini API failed, trying fallback');
      }
    }

    if (this.openaiApiKey && this.openaiClient) {
      try {
        return await this.generateWithOpenAI(systemPrompt, input.message, input.messageHistory);
      } catch (error) {
        logger.warn('OpenAI API failed, using mock response');
      }
    }

    // Mock response when no API keys are configured
    return this.generateMockResponse(input.message, input.context, input.userContext);
  }

  private async generateWithGemini(
    systemPrompt: string,
    message: string,
    history: MessageHistory[]
  ): Promise<LLMResponse> {
    logger.info('Using Gemini API');

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`,
      {
        contents: [
          {
            parts: [
              { text: systemPrompt },
              ...history.map((msg) => ({ text: `${msg.role}: ${msg.content}` })),
              { text: `user: ${message}` },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }
    );

    const content = response.data.candidates[0].content.parts[0].text;
    const tokens = response.data.usageMetadata?.totalTokenCount || 0;

    return {
      content,
      model: 'gemini-pro',
      tokens,
    };
  }

  private async generateWithOpenAI(
    systemPrompt: string,
    message: string,
    history: MessageHistory[]
  ): Promise<LLMResponse> {
    logger.info('Using OpenAI API');

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const response = await this.openaiClient!.post('/chat/completions', {
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const content = response.data.choices[0].message.content;
    const tokens = response.data.usage.total_tokens;

    return {
      content,
      model: 'gpt-4',
      tokens,
    };
  }

  private generateMockResponse(
    message: string,
    context: string,
    userContext: UserContext
  ): LLMResponse {
    logger.info('Using mock AI response');

    let response = '';

    // Context-aware mock responses
    if (context === 'credit') {
      if (userContext.creditScore) {
        response = `Based on your credit score of ${userContext.creditScore.score} (${userContext.creditScore.scoreCategory}), I can help you understand your financial health. `;
        
        if (userContext.creditScore.score >= 750) {
          response += 'Your excellent credit score gives you access to the best interest rates and loan terms. Consider leveraging this for investments or major purchases.';
        } else if (userContext.creditScore.score >= 650) {
          response += 'Your good credit score provides solid opportunities. Focus on maintaining on-time payments and reducing debt-to-income ratio to improve further.';
        } else {
          response += 'There\'s room for improvement. Focus on paying bills on time, reducing credit utilization, and avoiding new credit inquiries.';
        }
      } else {
        response = 'I can help you understand credit scores and how to improve your financial health. Would you like to calculate your credit score?';
      }
    } else if (context === 'investment') {
      if (userContext.portfolios && userContext.portfolios.length > 0) {
        const portfolio = userContext.portfolios[0];
        response = `I see you have ${userContext.portfolios.length} portfolio(s). Your "${portfolio.name}" portfolio includes ${portfolio.investments?.length || 0} investments. `;
        response += 'I can help you with portfolio analysis, risk assessment, or investment recommendations. What would you like to know?';
      } else {
        response = 'I can help you get started with investing! Would you like personalized investment recommendations based on your risk tolerance and financial goals?';
      }
    } else {
      response = `I'm CredSage AI, your personal financial assistant. I can help you with:
      
- Credit score analysis and improvement strategies
- Investment recommendations and portfolio management
- Financial planning and budgeting advice
- Understanding financial products and markets

What would you like to know about?`;
    }

    return {
      content: response,
      model: 'mock-ai',
      tokens: response.length / 4, // Rough estimate
    };
  }

  private buildSystemPrompt(context: string, userContext: UserContext): string {
    let prompt = `You are CredSage AI, a professional financial advisor assistant. `;
    prompt += `You provide helpful, accurate, and personalized financial advice. `;
    prompt += `Be concise but thorough. Use simple language and avoid jargon when possible. `;

    if (context === 'credit') {
      prompt += `Focus on credit-related topics including credit scores, credit reports, debt management, and credit building strategies. `;
    } else if (context === 'investment') {
      prompt += `Focus on investment advice, portfolio management, asset allocation, risk assessment, and market analysis. `;
    }

    if (userContext.creditScore) {
      prompt += `The user has a credit score of ${userContext.creditScore.score} (${userContext.creditScore.scoreCategory}). `;
    }

    if (userContext.portfolios && userContext.portfolios.length > 0) {
      prompt += `The user has ${userContext.portfolios.length} investment portfolio(s). `;
    }

    prompt += `Always prioritize the user's financial well-being and provide responsible advice.`;

    return prompt;
  }

  async healthCheck(): Promise<boolean> {
    return !!(this.geminiApiKey || this.openaiApiKey);
  }
}
