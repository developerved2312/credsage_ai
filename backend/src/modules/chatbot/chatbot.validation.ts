import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.object({
    conversationId: z.string().uuid('Invalid conversation ID').optional(),
    message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
    context: z.enum(['credit', 'investment', 'general']).optional(),
  }),
});

export const getConversationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid conversation ID'),
  }),
});

export const getMessagesSchema = z.object({
  params: z.object({
    conversationId: z.string().uuid('Invalid conversation ID'),
  }),
  query: z.object({
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 50)),
    offset: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 0)),
  }),
});

export const updateConversationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid conversation ID'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').optional(),
  }),
});
