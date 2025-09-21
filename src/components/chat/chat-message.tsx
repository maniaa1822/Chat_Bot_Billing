'use client';

import { Bot, User } from 'lucide-react';
import type { Message } from './chat-interface';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatActions } from './chat-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { QuoteResult } from './quote-result';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
  onActionClick?: (action: string) => void;
  actionsDisabled?: boolean;
}

export function ChatMessage({
  message,
  isLoading,
  onActionClick,
  actionsDisabled,
}: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  if (isLoading) {
    return (
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 border-2 border-primary/20">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2 pt-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('flex items-start gap-3', !isAssistant && 'justify-end')}
    >
      {isAssistant && (
        <Avatar className="h-8 w-8 border-2 border-primary/20">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-md rounded-lg p-3 text-sm flex flex-col shadow-sm',
          isAssistant
            ? 'bg-secondary rounded-tl-none'
            : 'bg-primary text-primary-foreground rounded-br-none'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.quote && (
          <div className="mt-4 bg-background p-4 rounded-lg border">
            <QuoteResult quote={message.quote} customerData={message.customerData} />
          </div>
        )}
        {isAssistant && message.actions && onActionClick && (
          <ChatActions
            actions={message.actions}
            onActionClick={onActionClick}
            disabled={actionsDisabled}
          />
        )}
      </div>
      {!isAssistant && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
