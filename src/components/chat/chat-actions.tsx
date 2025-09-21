'use client';

import { Button } from '@/components/ui/button';

interface ChatActionsProps {
  actions?: string[];
  onActionClick: (action: string) => void;
  disabled?: boolean;
}

export function ChatActions({
  actions,
  onActionClick,
  disabled,
}: ChatActionsProps) {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onActionClick(action)}
          disabled={disabled}
          className="bg-background hover:bg-accent/50"
        >
          {action}
        </Button>
      ))}
    </div>
  );
}
