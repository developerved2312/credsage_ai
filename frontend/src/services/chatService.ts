import api from '@utils/api';
import type {
  ApiResponse,
  ChatConversation,
  ChatMessage,
  SendMessageRequest,
  PaginatedResponse,
} from '@appTypes/index';

export const chatService = {
  // Send message
  sendMessage: async (
    data: SendMessageRequest
  ): Promise<{
    conversationId: string;
    userMessage: { id: string; content: string; createdAt: string };
    assistantMessage: { id: string; content: string; createdAt: string };
  }> => {
    const response = await api.post<ApiResponse>('/chatbot/message', data);
    return response.data.data!;
  },

  // Get all conversations
  getConversations: async (): Promise<ChatConversation[]> => {
    const response = await api.get<ApiResponse<ChatConversation[]>>('/chatbot/conversations');
    return response.data.data!;
  },

  // Get conversation by ID
  getConversationById: async (id: string): Promise<ChatConversation> => {
    const response = await api.get<ApiResponse<ChatConversation>>(
      `/chatbot/conversations/${id}`
    );
    return response.data.data!;
  },

  // Get messages for a conversation
  getMessages: async (
    conversationId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<PaginatedResponse<ChatMessage>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<ChatMessage>>>(
      `/chatbot/conversations/${conversationId}/messages`,
      { params }
    );
    return response.data.data!;
  },

  // Update conversation
  updateConversation: async (
    id: string,
    data: { title?: string }
  ): Promise<ChatConversation> => {
    const response = await api.put<ApiResponse<ChatConversation>>(
      `/chatbot/conversations/${id}`,
      data
    );
    return response.data.data!;
  },

  // Delete conversation
  deleteConversation: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<ApiResponse>(`/chatbot/conversations/${id}`);
    return response.data.data!;
  },

  // Clear all chat history
  clearHistory: async (): Promise<{ message: string; deletedCount: number }> => {
    const response = await api.delete<ApiResponse>('/chatbot/history');
    return response.data.data!;
  },
};
