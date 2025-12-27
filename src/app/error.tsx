'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/50 backdrop-blur rounded-2xl p-8 text-center border border-red-500/30">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-slate-400 mb-6">
          An unexpected error occurred. Your data is safe.
        </p>
        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dashboard'}
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Go to Dashboard
          </Button>
        </div>
        {error.digest && (
          <p className="text-xs text-slate-500 mt-4">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
