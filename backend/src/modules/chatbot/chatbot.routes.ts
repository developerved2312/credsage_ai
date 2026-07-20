import { Router } from 'express';
import { ChatbotController } from './chatbot.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  sendMessageSchema,
  getConversationSchema,
  getMessagesSchema,
  updateConversationSchema,
} from './chatbot.validation';

const router = Router();
const chatbotController = new ChatbotController();

// All routes require authentication
router.use(authenticate);

// Message routes
router.post('/message', validate(sendMessageSchema), chatbotController.sendMessage);

// Conversation routes
router.get('/conversations', chatbotController.getConversations);
router.get('/conversations/:id', validate(getConversationSchema), chatbotController.getConversationById);
router.put('/conversations/:id', validate(updateConversationSchema), chatbotController.updateConversation);
router.delete('/conversations/:id', validate(getConversationSchema), chatbotController.deleteConversation);

// Message history
router.get('/conversations/:conversationId/messages', validate(getMessagesSchema), chatbotController.getMessages);

// Clear history
router.delete('/history', chatbotController.clearHistory);

export default router;
