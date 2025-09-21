'use client';

import { useEffect, useRef } from 'react';
import type { Message } from './chat-interface';
import { ChatMessage } from './chat-message';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onActionClick: (action: string) => void;
}

export function ChatMessages({
  messages,
  isLoading,
  onActionClick,
}: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <ScrollArea className="h-full w-full flex-grow">
      <div className="p-4 space-y-6" ref={scrollAreaRef}>
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            message={message}
            onActionClick={onActionClick}
            actionsDisabled={isLoading || index !== messages.length - 1}
          />
        ))}
        {isLoading && (
          <ChatMessage
            message={{ id: 'loading', role: 'assistant', content: '' }}
            isLoading
          />
        )}
      </div>
    </ScrollArea>
  );
}
