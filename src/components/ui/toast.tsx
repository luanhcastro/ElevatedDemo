'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';
import { CheckCircle2, X } from 'lucide-react';
import { createContext, useCallback, useContext, useState } from 'react';

type ToastMessage = { id: number; title: string; description?: string };
type ToastContextValue = { toast: (message: Omit<ToastMessage, 'id'>) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const toast = useCallback(
    (message: Omit<ToastMessage, 'id'>) =>
      setMessages((current) => [...current, { ...message, id: Date.now() + Math.random() }]),
    [],
  );
  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {messages.map((message) => (
          <ToastPrimitive.Root
            key={message.id}
            duration={3500}
            onOpenChange={(open) => {
              if (!open) setMessages((current) => current.filter((item) => item.id !== message.id));
            }}
            className="grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-lg border bg-card p-4 shadow-lg"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div>
              <ToastPrimitive.Title className="text-sm font-semibold">
                {message.title}
              </ToastPrimitive.Title>
              {message.description && (
                <ToastPrimitive.Description className="mt-1 text-sm text-muted-foreground">
                  {message.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close aria-label="Dismiss notification">
              <X className="h-4 w-4 text-muted-foreground" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-4" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
