import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  showBackButton?: boolean;
  className?: string;
}

export function PageHeader({ title, children, showBackButton = true, className }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className={cn("sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-card/80 px-4 backdrop-blur-lg", className)}>
      <div className="flex items-center gap-2">
        {showBackButton && (
          <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        )}
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
