import { Loader2 } from 'lucide-react';

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center text-white">
      <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-4" />
      <p className="text-slate-400">Loading...</p>
    </div>
  );
}
