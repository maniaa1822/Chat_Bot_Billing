# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Core Development
- `npm run dev` - Start development server (runs on port 9002)
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### AI Development (Genkit)
- `source .env && npm run genkit:dev` - Start Genkit development server (requires environment loading)
- `npm run genkit:watch` - Start Genkit with file watching
- Genkit Developer UI: http://localhost:4000 or http://localhost:4001 (depending on port availability)

### Environment Setup
Requires `GEMINI_API_KEY` in `.env` file. Without this key, the AI flows will fail and the chatbot will show generic error messages.

## Architecture Overview

This is a Next.js application that provides an AI-powered conversational interface for solar panel quote calculations in Italy. The architecture follows a clean separation between frontend chat interface, AI processing flows, and business logic.

### Key Components

**AI Layer (`src/ai/`)**
- `genkit.ts` - Configures Genkit with Google AI (Gemini 2.5 Flash model)
- `dev.ts` - Genkit development server entry point with environment configuration
- `flows/extract-quote-info-from-chat.ts` - Core AI flow that parses user input, extracts quote information, determines user intent, and manages conversation flow
- `flows/provide-personalized-recommendations.ts` - Generates final quote recommendations

**Technical Implementation Details:**
- Only 2 actual Genkit flows are defined: `extractQuoteInfoFromChatFlow` and `providePersonalizedRecommendationsFlow`
- The main flow (`extract-quote-info-from-chat`) handles all conversation logic internally including intent detection and question generation
- Next.js server actions in `src/app/actions.ts` call the flows directly for chatbot functionality
- Genkit Developer UI runs separately on port 4000/4001 for flow testing and debugging

**Business Logic (`src/lib/`)**
- `quote-calculator.ts` - Contains the solar panel quote calculation engine with Italian market constants (1350 kWh/kWp annually, €0.25/kWh electricity cost, 60% self-consumption rate)

**Frontend (`src/components/chat/`)**
- Chat interface components with real-time conversation flow
- Quote result visualization with charts
- Dynamic action buttons based on AI suggestions

### Data Flow
1. User input → `extract-quote-info-from-chat` flow
2. AI extracts structured data (CAP, dwelling type, energy consumption, etc.)
3. When sufficient data collected → `quote-calculator.ts` processes calculations
4. Results displayed via `QuoteResult` component with visual charts

### AI Flow Schema
The main AI flow expects:
- Input: user message + conversation history
- Output: structured JSON with parsed data, user intent, reply text, next missing field, follow-up questions, and suggested actions

### Key Technologies
- Next.js 15 with App Router
- Firebase Genkit for AI flows
- ShadCN UI components
- Tailwind CSS
- TypeScript with Zod schemas
- Recharts for data visualization

## Codebase Navigation Guide

### Project Structure Overview
```
src/
├── app/                    # Next.js 15 App Router pages and API routes
│   ├── page.tsx           # Main page (/) - renders the chat interface
│   ├── actions.ts         # Server actions that connect UI to AI flows
│   └── layout.tsx         # Root layout with metadata and fonts
├── components/            # React UI components
│   ├── ui/               # ShadCN UI primitives (buttons, inputs, etc.)
│   └── chat/             # Chat-specific components
│       ├── chat-interface.tsx  # Main chat component
│       ├── quote-result.tsx    # Displays quote calculations with charts
│       └── info-summary.tsx    # Shows extracted user data
├── ai/                   # AI and Genkit flows
│   ├── genkit.ts         # Genkit configuration with Gemini
│   ├── dev.ts            # Development server entry point
│   └── flows/            # Individual AI flow definitions
├── lib/                  # Business logic and utilities
│   ├── quote-calculator.ts    # Solar panel calculation engine
│   └── utils.ts              # Utility functions (shadcn)
└── types/                # TypeScript type definitions
```

### Key File Types and Conventions

**`.tsx` files**: React components with TypeScript
- `page.tsx`: Next.js pages (App Router)
- Components use modern React patterns (hooks, functional components)

**`.ts` files**: Pure TypeScript logic
- `actions.ts`: Server-side functions that run on the backend
- Business logic, utilities, configurations

**`use server` directive**: Indicates server-side code in Next.js
- Found at top of `actions.ts` and AI flow files
- These functions run on the server, not in the browser

### Understanding the Data Flow

1. **User Input**: `chat-interface.tsx` captures user messages
2. **Server Action**: Calls `getAiResponse()` in `actions.ts`
3. **AI Processing**: Server action calls `extractQuoteInfoFromChat` flow
4. **Response**: AI returns structured data + Italian response text
5. **UI Update**: Components render response and extracted data
6. **Quote Calculation**: When data is complete, `quote-calculator.ts` runs
7. **Results Display**: `quote-result.tsx` shows charts and recommendations

### TypeScript Patterns Used

**Zod Schemas**: Input/output validation for AI flows
```typescript
const QuoteInfoInputSchema = z.object({
  userInput: z.string(),
  history: z.object({...}).optional()
});
```

**Type Inference**: Types derived from schemas
```typescript
export type QuoteInfoInput = z.infer<typeof QuoteInfoInputSchema>;
```

**Server Actions**: Async functions marked with `'use server'`
```typescript
export async function getAiResponse(userInput: string) {
  // This runs on the server
}
```

### Common Development Patterns

**Error Handling**: Try-catch blocks with user-friendly Italian messages
**State Management**: React useState for UI state, server actions for data
**Styling**: Tailwind CSS classes, ShadCN component system
**AI Integration**: Genkit flows with structured prompts and schema validation

### Debugging Tips

- **Console logs**: Check browser DevTools for frontend, terminal for server
- **Genkit UI**: Use localhost:4000/4001 to test AI flows directly
- **Network tab**: Monitor server action calls in browser DevTools
- **TypeScript errors**: Check terminal output for type checking issues

## Development Notes

The application is specifically designed for the Italian solar market with localized calculations, terminology, and business logic. All AI responses are in Italian.

The quote calculation assumes Italian solar conditions and regulatory environment (feed-in tariffs, self-consumption rates, etc.).