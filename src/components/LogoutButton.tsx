
'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

interface LogoutButtonProps {
  action: () => Promise<any>;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
}

export function LogoutButton({ action, className, variant="outline", size }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      action();
    });
  };

  return (
    <Button 
        onClick={handleClick} 
        disabled={isPending} 
        className={className} 
        variant={variant}
        size={size}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      {isPending ? 'Logging out...' : 'Logout'}
    </Button>
  );
}
