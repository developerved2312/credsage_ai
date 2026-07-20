import { prisma } from '../../config/prisma';
import { LLMService } from '../../services/llm.service';
import { AppError } from '../../middleware/error.middleware';
import { Logger } from '../../utils/logger';

const logger = new Logger('ChatbotService');

export interface SendMessageInput {
  conversationId?: string;
  message: string;
  context?: string;
}

export interface UpdateConversationInput {
  title?: string;
}

export class ChatbotService {
  private llmService: LLMService;

  constructor() {
    this.llmService = new LLMService();
  }

  async sendMessage(userId: string, input: SendMessageInput) {
    logger.info(`Processing message for user: ${userId}`);

    let conversation;

    // Get or create conversation
    if (input.conversationId) {
      conversation = await prisma.chatConversation.findFirst({
        where: {
          id: input.conversationId,
          userId,
        },
      });

      if (!conversation) {
        throw new AppError(404, 'Conversation not found');
      }
    } else {
      // Create new conversation
      conversation = await prisma.chatConversation.create({
        data: {
          userId,
          title: input.message.substring(0, 50) + (input.message.length > 50 ? '...' : ''),
          context: input.context || 'general',
        },
      });

      logger.info(`New conversation created: ${conversation.id}`);
    }

    // Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        userId,
        role: 'user',
        content: input.message,
      },
    });

    // Get conversation history for context
    const messageHistory = await prisma.chatMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 10, // Last 10 messages for context
      select: {
        role: true,
        content: true,
      },
    });

    // Get user context (credit score, investments) for personalized responses
    const [latestCreditScore, portfolios] = await Promise.all([
      prisma.creditScore.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          score: true,
          scoreCategory: true,
          topFactors: true,
        },
      }),
      prisma.portfolio.findMany({
        where: { userId, isActive: true },
        include: {
          investments: {
            select: {
              symbol: true,
              name: true,
              type: true,
              profitLossPercent: true,
            },
          },
        },
      }),
    ]);

    // Generate AI response
    const aiResponse = await this.llmService.generateResponse({
      message: input.message,
      messageHistory,
      context: conversation.context || 'general',
      userContext: {
        creditScore: latestCreditScore,
        portfolios,
      },
    });

    // Save assistant message
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        userId,
        role: 'assistant',
        content: aiResponse.content,
        model: aiResponse.model,
        tokens: aiResponse.tokens,
      },
    });

    // Update conversation lastMessageAt
    await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    logger.info(`AI response generated for conversation: ${conversation.id}`);

    return {
      conversationId: conversation.id,
      userMessage: {
        id: userMessage.id,
        content: userMessage.content,
        createdAt: userMessage.createdAt,
      },
      assistantMessage: {
        id: assistantMessage.id,
        content: assistantMessage.content,
        createdAt: assistantMessage.createdAt,
      },
    };
  }

  async getConversations(userId: string) {
    logger.info(`Fetching conversations for user: ${userId}`);

    const conversations = await prisma.chatConversation.findMany({
      where: { userId },
      include: {
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    return conversations;
  }

  async getConversationById(userId: string, conversationId: string) {
    logger.info(`Fetching conversation: ${conversationId}`);

    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    return conversation;
  }

  async getMessages(userId: string, conversationId: string, limit: number = 50, offset: number = 0) {
    logger.info(`Fetching messages for conversation: ${conversationId}`);

    // Verify conversation ownership
    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.chatMessage.count({ where: { conversationId } }),
    ]);

    return {
      data: messages,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async updateConversation(userId: string, conversationId: string, input: UpdateConversationInput) {
    logger.info(`Updating conversation: ${conversationId}`);

    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    const updatedConversation = await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        title: input.title,
      },
    });

    logger.info(`Conversation updated: ${conversationId}`);
    return updatedConversation;
  }

  async deleteConversation(userId: string, conversationId: string) {
    logger.info(`Deleting conversation: ${conversationId}`);

    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    await prisma.chatConversation.delete({
      where: { id: conversationId },
    });

    logger.info(`Conversation deleted: ${conversationId}`);
    return { message: 'Conversation deleted successfully' };
  }

  async clearHistory(userId: string) {
    logger.info(`Clearing chat history for user: ${userId}`);

    const result = await prisma.chatConversation.deleteMany({
      where: { userId },
    });

    logger.info(`Deleted ${result.count} conversations for user: ${userId}`);
    return {
      message: 'Chat history cleared successfully',
      deletedCount: result.count,
    };
  }
}
