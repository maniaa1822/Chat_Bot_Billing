'use server';

import {
  extractQuoteInfoFromChat,
  type QuoteInfoOutput,
} from '@/ai/flows/extract-quote-info-from-chat';

export async function getAiResponse(
  userInput: string,
  history: QuoteInfoOutput['parsed'] | null
): Promise<QuoteInfoOutput> {
  try {
    const response = await extractQuoteInfoFromChat({ userInput, history: history ?? undefined });
    return response;
  } catch (error) {
    console.error('Error in getAiResponse:', error);
    return {
      parsed: history || {
        cap: null,
        dwelling: null,
        monthly_kwh: null,
        bill_eur: null,
        storage_pref: null,
        incentives: null,
      },
      user_intent: 'OUT_OF_SCOPE',
      reply:
        'Mi dispiace, si è verificato un errore. Per favore, riprova più tardi.',
      next_missing_field: null,
      ask: null,
      suggest_actions: [],
      confidence: 'bassa',
      notes: ['An error occurred on the server.'],
    };
  }
}
