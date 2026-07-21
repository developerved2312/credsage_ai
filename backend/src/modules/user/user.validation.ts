import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name cannot be empty').optional(),
    lastName: z.string().min(1, 'Last name cannot be empty').optional(),
    name: z.string().min(1, 'Name cannot be empty').optional(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
    dateOfBirth: z.string().datetime().or(z.date()).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
    employmentStatus: z
      .enum(['employed', 'self-employed', 'unemployed', 'student', 'retired'])
      .optional(),
    annualIncome: z.number().positive('Annual income must be positive').optional(),
    occupation: z.string().optional(),
  }),
});
