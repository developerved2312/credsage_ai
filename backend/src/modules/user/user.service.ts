import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../middleware/error.middleware';
import { Logger } from '../../utils/logger';
import { JwtPayload } from '../../middleware/auth.middleware';
import { Prisma } from '@prisma/client';

const logger = new Logger('UserService');

export interface RegisterUserInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  employmentStatus?: string;
  annualIncome?: number;
  occupation?: string;
}

export class UserService {
  async register(input: RegisterUserInput) {
    logger.info(`Registering user: ${input.email}`);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError(400, 'User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
    });

    logger.info(`User registered successfully: ${user.email}`);

    return {
      user,
      token,
    };
  }

  async login(input: LoginUserInput) {
    logger.info(`Login attempt for: ${input.email}`);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
    });

    logger.info(`User logged in successfully: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    logger.info(`Fetching profile for user: ${userId}`);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
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
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    logger.info(`Updating profile for user: ${userId}`);

    // Convert annualIncome to Prisma Decimal if provided
    const data: Prisma.UserUpdateInput = {
      ...input,
      annualIncome: input.annualIncome 
        ? new Prisma.Decimal(input.annualIncome) 
        : undefined,
    };

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
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

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    logger.info(`Changing password for user: ${userId}`);

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    logger.info(`Password changed successfully for user: ${userId}`);

    return { message: 'Password changed successfully' };
  }

  async deleteAccount(userId: string) {
    logger.info(`Deleting account for user: ${userId}`);

    await prisma.user.delete({
      where: { id: userId },
    });

    logger.info(`Account deleted successfully for user: ${userId}`);

    return { message: 'Account deleted successfully' };
  }

  private generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }

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
}
