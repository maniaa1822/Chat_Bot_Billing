import { ChatInterface } from '@/components/chat/chat-interface';
import { Logo } from '@/components/icons/logo';

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-4 border-b shrink-0">
        <div className="container mx-auto flex items-center gap-4">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-headline font-bold text-foreground">
            AI Solar Advisor
          </h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 lg:p-8 flex flex-col items-center">
        <ChatInterface />
      </main>
    </div>
  );
}
