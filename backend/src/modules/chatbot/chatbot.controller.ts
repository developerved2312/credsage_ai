import { Request, Response } from 'express';
import { ChatbotService } from './chatbot.service';
import { ResponseUtil } from '../../utils/response';
import { asyncHandler } from '../../middleware/error.middleware';
import { Logger } from '../../utils/logger';

const logger = new Logger('ChatbotController');
const chatbotService = new ChatbotService();

export class ChatbotController {
  sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { conversationId, message, context } = req.body;
    
    logger.info(`Send message endpoint called for user: ${userId}`);

    const response = await chatbotService.sendMessage(userId, {
      conversationId,
      message,
      context,
    });

    return ResponseUtil.success(res, response, 'Message sent successfully');
  });

  getConversations = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    
    logger.info(`Get conversations endpoint called for user: ${userId}`);

    const conversations = await chatbotService.getConversations(userId);

    return ResponseUtil.success(res, conversations, 'Conversations fetched successfully');
  });

  getConversationById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    
    logger.info(`Get conversation by ID endpoint called: ${id}`);

    const conversation = await chatbotService.getConversationById(userId, id);

    return ResponseUtil.success(res, conversation, 'Conversation fetched successfully');
  });

  getMessages = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { conversationId } = req.params;
    const { limit, offset } = req.query as { limit?: number; offset?: number };
    
    logger.info(`Get messages endpoint called for conversation: ${conversationId}`);

    const messages = await chatbotService.getMessages(
      userId,
      conversationId,
      limit ? Number(limit) : 50,
      offset ? Number(offset) : 0
    );

    return ResponseUtil.success(res, messages, 'Messages fetched successfully');
  });

  updateConversation = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { title } = req.body;
    
    logger.info(`Update conversation endpoint called: ${id}`);

    const conversation = await chatbotService.updateConversation(userId, id, { title });

    return ResponseUtil.success(res, conversation, 'Conversation updated successfully');
  });

  deleteConversation = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    
    logger.info(`Delete conversation endpoint called: ${id}`);

    const result = await chatbotService.deleteConversation(userId, id);

    return ResponseUtil.success(res, result, 'Conversation deleted successfully');
  });

  clearHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    
    logger.info(`Clear history endpoint called for user: ${userId}`);

    const result = await chatbotService.clearHistory(userId);

    return ResponseUtil.success(res, result, 'Chat history cleared successfully');
  });
}
