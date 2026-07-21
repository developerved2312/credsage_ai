import { betterAuth } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { dash } from '@better-auth/infra';
import { prisma } from '../config/prisma';
import { env } from '../config/env';

export const auth = betterAuth({
  // Database
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  // Email and password configuration
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
    minPasswordLength: 8,
  },

  // Social providers
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID || '',
      clientSecret: env.GOOGLE_CLIENT_SECRET || '',
      enabled: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // Base URL configuration
  baseURL: env.BETTER_AUTH_URL,
  
  // Trust host (important for production)
  trustedOrigins: [env.CORS_ORIGIN],

  // Plugins
  plugins: [
    dash({
      apiKey: env.BETTER_AUTH_API_KEY,
    }),
  ],

  // Advanced options
  advanced: {
    useSecureCookies: env.NODE_ENV === 'production',
    cookieSameSite: 'lax',
    generateId: () => crypto.randomUUID(),
  },

  // User schema customization
  user: {
    additionalFields: {
      firstName: {
        type: 'string',
        required: false,
      },
      lastName: {
        type: 'string',
        required: false,
      },
      phone: {
        type: 'string',
        required: false,
      },
      dateOfBirth: {
        type: 'date',
        required: false,
      },
      address: {
        type: 'string',
        required: false,
      },
      city: {
        type: 'string',
        required: false,
      },
      state: {
        type: 'string',
        required: false,
      },
      zipCode: {
        type: 'string',
        required: false,
      },
      country: {
        type: 'string',
        required: false,
        defaultValue: 'USA',
      },
      employmentStatus: {
        type: 'string',
        required: false,
      },
      annualIncome: {
        type: 'number',
        required: false,
      },
      occupation: {
        type: 'string',
        required: false,
      },
    },
  },
});

export type Auth = typeof auth;
