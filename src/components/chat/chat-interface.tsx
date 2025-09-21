'use client';

import { useState } from 'react';
import type { QuoteInfoOutput } from '@/ai/flows/extract-quote-info-from-chat';
import { getAiResponse } from '@/app/actions';
import { CardContent } from '@/components/ui/card';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { InfoSummary } from './info-summary';
import { merge } from 'lodash';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: string[];
}

const initialMessage: Message = {
  id: 'init',
  role: 'assistant',
  content:
    'Ciao! Sono il tuo assistente AI per il fotovoltaico. Come posso aiutarti oggi? Puoi chiedermi un preventivo, farmi domande sugli impianti o sui bonus fiscali.',
  actions: [
    'Vorrei un preventivo',
    'Come funzionano gli incentivi?',
    'Quali sono i vantaggi?',
  ],
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [parsedData, setParsedData] =
    useState<QuoteInfoOutput['parsed'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiResult = await getAiResponse(text, parsedData);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResult.reply,
        actions: aiResult.suggest_actions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      const newParsedData = merge({}, parsedData, aiResult.parsed);
      setParsedData(newParsedData);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'Mi dispiace, si è verificato un errore. Per favore, riprova più tardi.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl flex flex-col h-full bg-card rounded-xl shadow-lg border">
      <div className="p-4 border-b">
        <InfoSummary data={parsedData} />
      </div>
      <CardContent className="flex-grow p-0 flex flex-col">
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          onActionClick={handleSendMessage}
        />
      </CardContent>
      <div className="p-4 border-t bg-background/50 rounded-b-xl">
        <ChatInput onSubmit={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
