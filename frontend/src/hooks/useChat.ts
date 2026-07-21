import { useMutation, useQuery, useQueryClient } from 'react-query';
import { chatService } from '@services/chatService';
import type { SendMessageRequest } from '@appTypes/index';

export const useChat = (conversationId?: string) => {
  const queryClient = useQueryClient();

  // Get all conversations
  const {
    data: conversations,
    isLoading: isConversationsLoading,
    refetch: refetchConversations,
  } = useQuery(['conversations'], chatService.getConversations);

  // Get conversation by ID
  const {
    data: conversation,
    isLoading: isConversationLoading,
    refetch: refetchConversation,
  } = useQuery(
    ['conversations', conversationId],
    () => chatService.getConversationById(conversationId!),
    {
      enabled: !!conversationId,
    }
  );

  // Get messages for conversation
  const {
    data: messages,
    isLoading: isMessagesLoading,
    refetch: refetchMessages,
  } = useQuery(
    ['conversations', conversationId, 'messages'],
    () => chatService.getMessages(conversationId!, { limit: 50, offset: 0 }),
    {
      enabled: !!conversationId,
    }
  );

  // Send message mutation
  const sendMessageMutation = useMutation(chatService.sendMessage, {
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
      if (conversationId) {
        queryClient.invalidateQueries(['conversations', conversationId]);
        queryClient.invalidateQueries(['conversations', conversationId, 'messages']);
      }
    },
  });

  // Update conversation mutation
  const updateConversationMutation = useMutation(
    ({ id, data }: { id: string; data: { title?: string } }) =>
      chatService.updateConversation(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['conversations']);
      },
    }
  );

  // Delete conversation mutation
  const deleteConversationMutation = useMutation(chatService.deleteConversation, {
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
    },
  });

  // Clear history mutation
  const clearHistoryMutation = useMutation(chatService.clearHistory, {
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
    },
  });

  // Send message helper
  const sendMessage = async (data: SendMessageRequest) => {
    return sendMessageMutation.mutateAsync(data);
  };

  return {
    // Data
    conversations,
    conversation,
    messages,

    // Loading states
    isConversationsLoading,
    isConversationLoading,
    isMessagesLoading,
    isSendingMessage: sendMessageMutation.isLoading,

    // Methods
    sendMessage,
    updateConversation: updateConversationMutation.mutate,
    deleteConversation: deleteConversationMutation.mutate,
    clearHistory: clearHistoryMutation.mutate,

    // Refetch methods
    refetchConversations,
    refetchConversation,
    refetchMessages,

    // Error states
    sendMessageError: sendMessageMutation.error,
  };
};
