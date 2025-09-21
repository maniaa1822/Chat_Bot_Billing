# AI Solar Advisor

This is a Next.js application that provides a conversational AI assistant to help users in Italy get personalized quotes for photovoltaic (solar panel) systems. The application is built with Firebase Genkit for the AI backend and uses ShadCN UI components for the user interface.

## Technologies Used

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **AI Integration**: [Firebase Genkit](https://firebase.google.com/docs/genkit)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: TypeScript

## Project Structure

The project follows a standard Next.js App Router structure with some key directories:

-   `src/app/`: Contains the main application pages and layouts.
    -   `page.tsx`: The main entry point and home page of the application.
    -   `actions.ts`: Server Actions that connect the frontend to the Genkit AI flows.
-   `src/ai/`: Contains all the Genkit AI logic.
    -   `genkit.ts`: Initializes and configures the Genkit instance and the AI model (Gemini).
    -   `flows/`: Directory for all the Genkit flows.
        -   `extract-quote-info-from-chat.ts`: The core AI flow that processes user input, extracts information, and decides the next step.
        -   `provide-personalized-recommendations.ts`: The flow that generates the final quote recommendations.
-   `src/components/`: Contains all the React components.
    -   `chat/`: Components specific to the chat interface (`ChatInterface`, `ChatMessage`, `ChatInput`, etc.).
    -   `ui/`: Reusable UI components from ShadCN.
-   `src/lib/`: Contains utility functions and libraries.
    -   `quote-calculator.ts`: The business logic for calculating the solar panel quote based on the user's data.
    -   `utils.ts`: General utility functions.
-   `public/`: Static assets.

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Install Dependencies

Install the necessary Node.js packages using npm:

```bash
npm install
```

### 2. Set Up Environment Variables

The application requires an API key for the Google Gemini model. If this key is not configured correctly, the application will throw an error, and the chatbot will respond with a generic error message like `Mi dispiace, si è verificato un errore. Per favore, riprova più tardi.`.

1.  Obtain an API key from [Google AI Studio](https://makersuite.google.com/).
2.  Create a new file named `.env` in the root of the project.
3.  Add your API key to the `.env` file as follows:

    ```
    GEMINI_API_KEY=<YOUR_API_KEY>
    ```

    Replace `<YOUR_API_KEY>` with your actual Gemini API key.

### 3. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

## Key Features

### AI-Powered Conversational Interface

The core of the application is a chat interface where users can interact with an AI assistant. The assistant is designed to:
- Understand user intent (e.g., asking for a quote, asking a question).
- Extract key pieces of information from the conversation (e.g., postal code, energy consumption, dwelling type).
- Ask clarifying questions to gather all necessary data for a quote.

### Dynamic Quote Calculation

Once all the required information is collected, the application calculates a personalized solar panel quote. The `calculateQuote` function in `src/lib/quote-calculator.ts` uses the collected data to estimate:
- Recommended system size (in kWp).
- Estimated annual energy production (in kWh).
- Potential annual savings (in EUR).
- The user's new estimated monthly bill.

The results are displayed in a `QuoteResult` component that includes a bar chart for easy comparison of costs.
