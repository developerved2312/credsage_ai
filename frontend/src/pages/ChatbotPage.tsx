import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@hooks/useChat';
import { useSession } from '@lib/auth.client';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import EmptyState from '@components/ui/EmptyState';
import type { ChatConversation } from '@appTypes/index';
import { formatRelativeTime } from '@utils/formatters';
import {
  Send,
  Plus,
  MessageSquare,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';

const CONTEXT_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'credit', label: 'Credit' },
  { value: 'investment', label: 'Investment' },
];

const getInitials = (name?: string | null, email?: string | null): string => {
  if (name) return name.charAt(0).toUpperCase();
  if (email) return email.charAt(0).toUpperCase();
  return 'U';
};

/* ——— Message bubble ——— */
const MessageBubble: React.FC<{
  role: string;
  content: string;
  time: string;
  userInitials: string;
}> = ({ role, content, time, userInitials }) => {
  const isUser = role === 'user';
  return (
    <div className={clsx('flex gap-3 items-end', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={clsx(
          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
          isUser ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary'
        )}
      >
        {isUser ? userInitials : 'AI'}
      </div>

      <div className={clsx('max-w-[75%] space-y-1', isUser && 'items-end flex flex-col')}>
        <div
          className={clsx(
            'px-4 py-2.5 rounded-lg text-sm leading-relaxed',
            isUser
              ? 'bg-primary text-white rounded-br-sm'
              : 'bg-surface border border-border-color text-text-primary rounded-bl-sm'
          )}
        >
          {/* Render line breaks */}
          {content.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < content.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
        <span className="text-xs text-text-secondary">{formatRelativeTime(time)}</span>
      </div>
    </div>
  );
};

/* ——— Conversation sidebar item ——— */
const ConversationItem: React.FC<{
  conversation: ChatConversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}> = ({ conversation, isActive, onClick, onDelete }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
    className={clsx(
      'w-full text-left px-3 py-2.5 rounded transition-colors group relative cursor-pointer',
      isActive
        ? 'bg-green-50 text-primary'
        : 'hover:bg-gray-100 text-text-secondary hover:text-text-primary'
    )}
  >
    <p className="text-sm font-medium truncate pr-7">{conversation.title || 'Untitled'}</p>
    {conversation.lastMessageAt && (
      <p className="text-xs mt-0.5 text-text-secondary">
        {formatRelativeTime(conversation.lastMessageAt)}
      </p>
    )}
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:text-risk-high transition-opacity"
      aria-label="Delete conversation"
    >
      <Trash2 size={13} strokeWidth={1.75} />
    </button>
  </div>
);

/* ——— Main chatbot page ——— */
const ChatbotPage: React.FC = () => {
  const { data: session } = useSession();
  const [activeConvId, setActiveConvId] = useState<string | undefined>(undefined);
  const [input, setInput] = useState('');
  const [context, setContext] = useState('general');
  const [optimisticMessages, setOptimisticMessages] = useState<
    Array<{ id: string; role: string; content: string; createdAt: string }>
  >([]);

  const {
    conversations,
    messages,
    isConversationsLoading,
    isMessagesLoading,
    isSendingMessage,
    sendMessage,
    deleteConversation,
    sendMessageError,
  } = useChat(activeConvId);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userInitials = getInitials(session?.user?.name, session?.user?.email);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, optimisticMessages]);

  // Clear optimistic messages when real messages arrive
  useEffect(() => {
    if (messages?.data?.length) {
      setOptimisticMessages([]);
    }
  }, [messages]);

  const allMessages = [
    ...(messages?.data ?? []),
    ...optimisticMessages,
  ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSendingMessage) return;

    const msgContent = input.trim();
    setInput('');

    // Optimistic UI
    const tempId = `temp-${Date.now()}`;
    setOptimisticMessages((prev) => [
      ...prev,
      { id: tempId, role: 'user', content: msgContent, createdAt: new Date().toISOString() },
    ]);

    try {
      const res = await sendMessage({
        conversationId: activeConvId,
        message: msgContent,
        context,
      });

      // If new conversation was created, activate it
      if (!activeConvId && res.conversationId) {
        setActiveConvId(res.conversationId);
      }
    } catch {
      // Error shown in UI
    }
  };

  const handleNewChat = () => {
    setActiveConvId(undefined);
    setOptimisticMessages([]);
    setInput('');
  };

  const handleDeleteConversation = (id: string) => {
    if (confirm('Delete this conversation?')) {
      deleteConversation(id);
      if (activeConvId === id) {
        setActiveConvId(undefined);
        setOptimisticMessages([]);
      }
    }
  };

  return (
    <div className="-mx-6 -my-6 flex h-[calc(100vh-1rem)] min-h-[500px]">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 flex flex-col border-r border-border-color bg-surface">
        <div className="p-3 border-b border-border-color">
          <button
            id="new-chat-btn"
            onClick={handleNewChat}
            className="btn btn-secondary w-full text-sm justify-start gap-2"
          >
            <Plus size={15} />
            New conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {isConversationsLoading ? (
            <LoadingSpinner fullPage size={18} />
          ) : !conversations?.length ? (
            <p className="text-xs text-text-secondary text-center py-6">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeConvId}
                onClick={() => {
                  setActiveConvId(conv.id);
                  setOptimisticMessages([]);
                }}
                onDelete={() => handleDeleteConversation(conv.id)}
              />
            ))
          )}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border-color bg-surface flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-primary" strokeWidth={1.75} />
            <span className="text-sm font-semibold text-text-primary">
              {activeConvId
                ? conversations?.find((c) => c.id === activeConvId)?.title || 'Conversation'
                : 'New conversation'}
            </span>
          </div>
          {/* Context selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">Context:</span>
            <div className="flex gap-1">
              {CONTEXT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  id={`context-${opt.value}`}
                  onClick={() => setContext(opt.value)}
                  className={clsx(
                    'px-2.5 py-1 text-xs rounded border transition-colors',
                    context === opt.value
                      ? 'border-primary bg-green-50 text-primary font-medium'
                      : 'border-border-color text-text-secondary hover:border-primary'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 bg-background">
          {isMessagesLoading && activeConvId ? (
            <LoadingSpinner fullPage />
          ) : allMessages.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Start a conversation"
              description="Ask anything about your credit score, investments, or financial goals."
            />
          ) : (
            <>{allMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
                time={msg.createdAt}
                userInitials={userInitials}
              />
            ))}</>
          )}

          {/* Typing indicator */}
          {isSendingMessage && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-text-secondary">
                AI
              </div>
              <div className="px-4 py-2.5 rounded-lg bg-surface border border-border-color text-sm text-text-secondary">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-75">.</span>
                  <span className="animate-bounce delay-150">.</span>
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {!!sendMessageError && (
          <div className="mx-5 mb-2 flex items-center gap-2 text-sm text-risk-high">
            <AlertCircle size={14} strokeWidth={1.75} />
            Failed to send. Please try again.
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="px-5 py-4 border-t border-border-color bg-surface shrink-0"
        >
          <div className="flex gap-2 items-end">
            <textarea
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e as unknown as React.FormEvent);
                }
              }}
              placeholder="Ask about your credit score, investments… (Enter to send)"
              rows={2}
              className="input resize-none flex-1 text-sm leading-relaxed"
              disabled={isSendingMessage}
            />
            <button
              id="send-message-btn"
              type="submit"
              disabled={!input.trim() || isSendingMessage}
              className="btn btn-primary px-3 py-2.5 shrink-0 self-end"
            >
              {isSendingMessage ? (
                <LoadingSpinner size={15} />
              ) : (
                <Send size={15} strokeWidth={1.75} />
              )}
            </button>
          </div>
          <p className="text-xs text-text-secondary mt-1.5">
            Shift+Enter for new line · This is an educational AI, not financial advice.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ChatbotPage;
