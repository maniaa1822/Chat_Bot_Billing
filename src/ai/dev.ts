import { config } from 'dotenv';
config();

import '@/ai/flows/determine-user-intent.ts';
import '@/ai/flows/provide-personalized-recommendations.ts';
import '@/ai/flows/extract-quote-info-from-chat.ts';
import '@/ai/flows/ask-missing-quote-questions.ts';