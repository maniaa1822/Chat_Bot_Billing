'use server';
/**
 * @fileOverview This file defines a Genkit flow for extracting quote information from a chat interface.
 *
 * It includes:
 * - `extractQuoteInfoFromChat`: The main function to extract quote information.
 * - `QuoteInfoInput`: The input type for the `extractQuoteInfoFromChat` function.
 * - `QuoteInfoOutput`: The output type for the `extractQuoteInfoFromChat` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuoteInfoInputSchema = z.object({
  userInput: z.string().describe('The user input from the chat interface.'),
  history: z
    .object({
      cap: z.string().nullable(),
      dwelling: z.string().nullable(),
      monthly_kwh: z.number().nullable(),
      bill_eur: z.number().nullable(),
      storage_pref: z.string().nullable(),
      incentives: z.string().nullable(),
    })
    .optional()
    .describe('Previously collected information from the conversation.'),
});
export type QuoteInfoInput = z.infer<typeof QuoteInfoInputSchema>;

const QuoteInfoOutputSchema = z.object({
  parsed: z
    .object({
      cap: z.string().nullable().describe('Postal code, digits only, length 4-5.'),
      dwelling: z
        .enum(['appartamento', 'casa_singola', 'azienda'])
        .nullable()
        .describe('Type of dwelling.'),
      monthly_kwh: z.number().nullable().describe('Monthly energy consumption in kWh.'),
      bill_eur: z.number().nullable().describe('Monthly bill amount in EUR.'),
      storage_pref: z.enum(['si', 'no', 'non_so']).nullable().describe('Storage preference.'),
      incentives: z.enum(['si', 'no', 'non_so']).nullable().describe('Incentives preference.'),
    })
    .describe('Extracted and normalized data from user input.'),
  user_intent: z
    .enum(['GET_QUOTE', 'ASK_QUESTION', 'BOOKING', 'SUPPORT', 'OUT_OF_SCOPE'])
    .describe('The intent of the user.'),
  reply: z.string().describe('A reply to the user in Italian.'),
  next_missing_field: z
    .enum(['cap', 'dwelling', 'monthly_kwh', 'bill_eur', 'storage_pref', 'incentives'])
    .nullable()
    .describe('The next missing field to progress the quote.'),
  ask: z.string().nullable().describe('A follow-up question to get the next_missing_field.'),
  suggest_actions: z.string().array().describe('Array of short labels for UI buttons.'),
  confidence: z.enum(['bassa', 'media', 'alta']).describe('Confidence level of extracted data.'),
  notes: z.string().array().describe('Array of notes explaining normalizations/assumptions.'),
});
export type QuoteInfoOutput = z.infer<typeof QuoteInfoOutputSchema>;

export async function extractQuoteInfoFromChat(input: QuoteInfoInput): Promise<QuoteInfoOutput> {
  return extractQuoteInfoFromChatFlow(input);
}

const extractQuoteInfoFromChatPrompt = ai.definePrompt({
  name: 'extractQuoteInfoFromChatPrompt',
  input: {schema: QuoteInfoInputSchema},
  output: {schema: QuoteInfoOutputSchema},
  prompt: `You are Preventivatore AI, a conversational assistant helping users in Italy get photovoltaic quotes.
Your goal is to extract information, answer questions, and guide users to the next step.

**RULES:**
1.  **ONLY EVER reply with a single, valid JSON object** matching the output schema. NO PROSE.
2.  **NEVER INVENT or assume data.** If the user doesn't provide a piece of information, its value in the 'parsed' object MUST be \`null\`.
3.  Combine information from the current \`userInput\` with the existing \`history\`. The new 'parsed' object should be a merge of the two.
4.  Determine the most important missing field for a quote and ask for it.

**JSON FIELD DEFINITIONS:**
- \`parsed\`: Object containing all data extracted so far.
  - \`cap\`: string|null. 4-5 digits.
  - \`dwelling\`: "appartamento" | "casa_singola" | "azienda" | null.
  - \`monthly_kwh\`: number|null.
  - \`bill_eur\`: number|null.
  - \`storage_pref\`: "si" | "no" | "non_so" | null.
  - \`incentives\`: "si" | "no" | "non_so" | null.
- \`user_intent\`: "GET_QUOTE" | "ASK_QUESTION" | "BOOKING" | "SUPPORT" | "OUT_OF_SCOPE".
- \`reply\`: Italian reply (max 70-90 words). If asked a question, answer it concisely before asking for the next piece of information.
- \`next_missing_field\`: The *single most important* key you need next: "cap"|"dwelling"|"monthly_kwh"|"bill_eur"|"storage_pref"|"incentives"|null.
- \`ask\`: One simple question to get the \`next_missing_field\`.
- \`suggest_actions\`: 0-3 short button labels (e.g., "Calcola preventivo rapido").
- \`confidence\`: "bassa"|"media"|"alta". Your confidence in the extracted data.
- \`notes\`: Brief notes on normalizations (e.g., "‘villa’ -> ‘casa_singola’").

**NORMALIZATION:**
- Dwelling: “villa”, “villetta” -> "casa_singola"; “app” -> "appartamento"; “ufficio” -> "azienda".
- Preferences: “boh”, “forse” -> "non_so".
- Numbers: Extract numeric values, use dot for decimals (e.g., “95 euro” -> 95.0).

---
**CONVERSATION:**

**Existing Information (history):**
{{#if historyHasContent}}
\`\`\`json
{{{JSONstringify history}}}
\`\`\`
{{else}}
No information collected yet.
{{/if}}

**User's Latest Message (userInput):**
"{{{userInput}}}"

---
Based on the full context, provide the complete JSON response.
`,
  template: {
    helpers: {
      JSONstringify: (obj: any) => JSON.stringify(obj, null, 2),
    },
  },
});

const extractQuoteInfoFromChatFlow = ai.defineFlow(
  {
    name: 'extractQuoteInfoFromChatFlow',
    inputSchema: QuoteInfoInputSchema,
    outputSchema: QuoteInfoOutputSchema,
  },
  async (input) => {
    // Determine if history has meaningful content
    const historyHasContent = !!(
      input.history && Object.values(input.history).some((v) => v !== null)
    );

    const { output } = await extractQuoteInfoFromChatPrompt({
      ...input,
      historyHasContent,
    });
    return output!;
  }
);
