export default function RootLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center text-white">
      {/* Logo / Brand */}
      <div className="mb-8 animate-pulse">
        <div className="text-6xl mb-4">🍞</div>
        <h1 className="text-3xl font-bold text-amber-400">Bakery CCA</h1>
        <p className="text-slate-400 text-sm mt-1">Child Care Africa Uganda</p>
      </div>

      {/* Loading indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>

      {/* Tagline */}
      <p className="text-slate-500 text-xs mt-8">Empowering bakeries across Uganda</p>
    </div>
  );
}
