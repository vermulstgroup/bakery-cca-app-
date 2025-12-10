export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-md animate-slide-in-from-right">
        {children}
      </div>
    </div>
  );
}
