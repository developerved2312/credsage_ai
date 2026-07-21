import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { Logger } from './utils/logger';
import { auth } from './lib/auth';

// Import routes
import creditRoutes from './modules/credit/credit.routes';
import investmentRoutes from './modules/investment/investment.routes';
import chatbotRoutes from './modules/chatbot/chatbot.routes';
import userRoutes from './modules/user/user.routes';

const logger = new Logger('App');

export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  
  // Cookie parser for Better Auth
  app.use(cookieParser());
  
  // CORS configuration
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
      exposedHeaders: ['Set-Cookie'],
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging middleware
  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: '1.0.0',
    });
  });

  // Better Auth routes - Must come before other API routes
  app.all('/api/auth/*', async (req, res) => {
    // Better Auth needs the full URL
    const url = new URL(req.originalUrl || req.url, `${req.protocol}://${req.get('host')}`);
    return auth.handler(url.toString(), {
      method: req.method,
      headers: req.headers,
      body: req.body,
    }, res);
  });

  // API routes
  app.use('/api/users', userRoutes);
  app.use('/api/credit', creditRoutes);
  app.use('/api/investment', investmentRoutes);
  app.use('/api/chatbot', chatbotRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  logger.info('Express application configured successfully');

  return app;
}
