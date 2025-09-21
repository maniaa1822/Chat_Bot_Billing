'use client';

import { useState } from 'react';
import type { QuoteInfoOutput } from '@/ai/flows/extract-quote-info-from-chat';
import { getAiResponse, getRecommendations } from '@/app/actions';
import { CardContent } from '@/components/ui/card';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { InfoSummary } from './info-summary';
import { merge } from 'lodash';
import { QuoteResult } from './quote-result';
import { calculateQuote, type QuoteDetails } from '@/lib/quote-calculator';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: string[];
  quote?: QuoteDetails;
  customerData?: QuoteInfoOutput['parsed'];
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
  const [lastAiResult, setLastAiResult] = useState<QuoteInfoOutput | null>(
    null
  );
  const [aiState, setAiState] = useState<{
    confidence: string | null;
    notes: string[] | null;
  }>({ confidence: null, notes: null });
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
      // If the user clicks "Genera preventivo" and we have enough data, show the quote.
      if (text === 'Genera preventivo' && lastAiResult?.parsed) {
        const quote = calculateQuote(lastAiResult.parsed);
        const quoteMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Ecco una stima del tuo impianto fotovoltaico personalizzato:',
          quote: quote,
          customerData: lastAiResult.parsed,
        };
        setMessages((prev) => [...prev, quoteMessage]);
        // Reset last AI result to allow for new conversations.
        setLastAiResult(null);
        
      // If we have collected all data, show recommendations.
      } else if (lastAiResult && lastAiResult.next_missing_field === null) {
        const recommendations = await getRecommendations(lastAiResult);
        const recommendationMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            'Ecco alcune azioni che puoi intraprendere:',
          actions: recommendations,
        };
        setMessages((prev) => [...prev, recommendationMessage]);
        // Keep lastAiResult so we can generate the quote next.

      // Otherwise, continue the conversation to gather more data.
      } else {
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
        setAiState({
          confidence: aiResult.confidence,
          notes: aiResult.notes,
        });
        setLastAiResult(aiResult);
      }
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'Mi dispiace, si è verificato un errore. Per favore, riprova più tardi.',
      };
      setMessages((prev) => [...prev, errorMessage]);
      setAiState({
        confidence: 'bassa',
        notes: ['An error occurred on the server.'],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl flex flex-col h-full bg-card rounded-xl shadow-lg border">
      <div className="p-4 border-b">
        <InfoSummary data={parsedData} aiState={aiState} />
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
