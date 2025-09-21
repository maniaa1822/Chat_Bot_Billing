import { config } from 'dotenv';
config();

// Import genkit configuration first to ensure env vars are loaded
import '@/ai/genkit';

// Then import the flows
import '@/ai/flows/provide-personalized-recommendations.ts';
import '@/ai/flows/extract-quote-info-from-chat.ts';

    