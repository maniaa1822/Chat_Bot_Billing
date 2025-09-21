// A Genkit flow to provide personalized recommendations based on user input.

'use server';

/**
 * @fileOverview A personalized recommendation AI agent.
 *
 * - providePersonalizedRecommendations - A function that provides personalized recommendations.
 * - PersonalizedRecommendationsInput - The input type for the providePersonalizedRecommendations function.
 * - PersonalizedRecommendationsOutput - The return type for the providePersonalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationsInputSchema = z.object({
  parsed: z.object({
    cap: z.string().nullable().describe('CAP code of the location.'),
    dwelling: z.string().nullable().describe('Type of dwelling (appartamento, casa_singola, azienda).'),
    monthly_kwh: z.number().nullable().describe('Monthly energy consumption in kWh.'),
    bill_eur: z.number().nullable().describe('Monthly electricity bill in EUR.'),
    storage_pref: z.string().nullable().describe('Preference for energy storage (si, no, non_so).'),
    incentives: z.string().nullable().describe('Interest in incentives (si, no, non_so).'),
  }).describe('Parsed user input data.'),
  user_intent: z.string().describe('The intent of the user (GET_QUOTE, ASK_QUESTION, BOOKING, SUPPORT, OUT_OF_SCOPE).'),
  reply: z.string().describe('The reply to the user.'),
  next_missing_field: z.string().nullable().describe('The next missing field to progress the quote.'),
  ask: z.string().nullable().describe('The follow-up question to get the next missing field.'),
  confidence: z.string().describe('Confidence level about the extracted data (bassa, media, alta).'),
  notes: z.array(z.string()).describe('Notes explaining normalizations/assumptions.'),
}).describe('Input for personalized recommendations.');

export type PersonalizedRecommendationsInput = z.infer<typeof PersonalizedRecommendationsInputSchema>;

const PersonalizedRecommendationsOutputSchema = z.array(z.string()).describe('Array of personalized action labels.');

export type PersonalizedRecommendationsOutput = z.infer<typeof PersonalizedRecommendationsOutputSchema>;

export async function providePersonalizedRecommendations(input: PersonalizedRecommendationsInput): Promise<PersonalizedRecommendationsOutput> {
  return providePersonalizedRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'providePersonalizedRecommendationsPrompt',
  input: {schema: z.object({
    parsedString: z.string(),
    user_intent: z.string(),
    reply: z.string(),
    next_missing_field: z.string().nullable(),
    ask: z.string().nullable(),
    confidence: z.string(),
    notes: z.array(z.string()),
  })},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `You are an AI assistant that provides personalized recommendations based on the user's input.

  Given the following user information, suggest 1-3 relevant actions that the user can take next. The actions should be short labels suitable for display as buttons in a UI.

  Parsed Data:
  {{{parsedString}}}

  User Intent: {{{user_intent}}}
  Reply: {{{reply}}}
  Next Missing Field: {{{next_missing_field}}}
  Ask: {{{ask}}}
  Confidence: {{{confidence}}}
  Notes: {{#each notes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Examples of possible actions:
  - Calcola preventivo rapido
  - Aggiungi accumulo
  - Domande frequenti
  - Ottieni un preventivo personalizzato
  - Parla con un esperto

  The actions must be in italian.
  Return an array of strings.  If no actions are relevant, return an empty array.
  `,
});

const providePersonalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'providePersonalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const parsedString = Object.entries(input.parsed)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join('\n');

    const {output} = await prompt({
      ...input,
      parsedString,
    });
    return output!;
  }
);
