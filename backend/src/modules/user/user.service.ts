import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/error.middleware';
import { Logger } from '../../utils/logger';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const logger = new Logger('UserService');

// Zod validation schemas for service inputs
export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name cannot be empty').optional(),
  lastName: z.string().min(1, 'Last name cannot be empty').optional(),
  name: z.string().min(1, 'Name cannot be empty').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  dateOfBirth: z.date().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  employmentStatus: z.enum(['employed', 'self-employed', 'unemployed', 'student', 'retired']).optional(),
  annualIncome: z.number().positive('Annual income must be positive').optional(),
  occupation: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

/**
 * User Service - Business logic for user operations
 * Follows separation of concerns principle
 */
export class UserService {
  /**
   * Get user profile by ID
   */
  async getProfile(userId: string) {
    logger.info(`Fetching profile for user: ${userId}`);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        image: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        employmentStatus: true,
        annualIncome: true,
        occupation: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }

  /**
   * Update user profile with validation
   */
  async updateProfile(userId: string, input: UpdateProfileInput) {
    logger.info(`Updating profile for user: ${userId}`);

    // Validate input with Zod
    const validatedInput = UpdateProfileSchema.parse(input);

    // Update name field if firstName or lastName is provided
    const name = validatedInput.firstName && validatedInput.lastName 
      ? `${validatedInput.firstName} ${validatedInput.lastName}`
      : validatedInput.name;

    const data: Prisma.UserUpdateInput = {
      name,
      firstName: validatedInput.firstName,
      lastName: validatedInput.lastName,
      phone: validatedInput.phone,
      dateOfBirth: validatedInput.dateOfBirth,
      address: validatedInput.address,
      city: validatedInput.city,
      state: validatedInput.state,
      zipCode: validatedInput.zipCode,
      country: validatedInput.country,
      employmentStatus: validatedInput.employmentStatus,
      annualIncome: validatedInput.annualIncome 
        ? new Prisma.Decimal(validatedInput.annualIncome) 
        : undefined,
      occupation: validatedInput.occupation,
    };

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        employmentStatus: true,
        annualIncome: true,
        occupation: true,
        updatedAt: true,
      },
    });

    logger.info(`Profile updated successfully for user: ${userId}`);

    return user;
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string) {
    logger.info(`Deleting account for user: ${userId}`);

    await prisma.user.delete({
      where: { id: userId },
    });

    logger.info(`Account deleted successfully for user: ${userId}`);

    return { message: 'Account deleted successfully' };
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    logger.info(`Fetching stats for user: ${userId}`);

    const [creditScoreCount, investmentCount, portfolioCount, messageCount] = await Promise.all([
      prisma.creditScore.count({ where: { userId } }),
      prisma.investment.count({ where: { userId } }),
      prisma.portfolio.count({ where: { userId } }),
      prisma.chatMessage.count({ where: { userId } }),
    ]);

    return {
      creditScores: creditScoreCount,
      investments: investmentCount,
      portfolios: portfolioCount,
      chatMessages: messageCount,
    };
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    logger.info(`Fetching user by email: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    logger.info(`Fetching user by ID: ${userId}`);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }
}
