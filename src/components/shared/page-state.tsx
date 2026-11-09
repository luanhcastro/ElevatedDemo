import { AlertCircle, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LoadingState() {
  return (
    <div className="flex min-h-64 items-center justify-center" role="status">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 rounded-full bg-red-50 p-3 text-red-600">
        <AlertCircle className="h-6 w-6" />
      </span>
      <h3 className="font-semibold">We couldn&apos;t load this data</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        The mock repository returned an error. Try loading it again.
      </p>
      <Button variant="outline" className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 rounded-full bg-slate-100 p-3 text-slate-500">
        <Inbox className="h-6 w-6" />
      </span>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
