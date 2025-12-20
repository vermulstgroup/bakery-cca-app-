"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Lock, Delete } from 'lucide-react';
import { cn } from '@/lib/utils';

type PinDialogProps = {
  open: boolean;
  onVerify: (pin: string) => boolean;
  title?: string;
  description?: string;
};

export function PinDialog({ open, onVerify, title = "Enter PIN", description = "Enter your 4-digit PIN to continue" }: PinDialogProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);

      // Auto-verify when 4 digits entered
      if (newPin.length === 4) {
        setTimeout(() => {
          const isValid = onVerify(newPin);
          if (!isValid) {
            setError(true);
            setPin('');
          }
        }, 200);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-center text-xl">
            <Lock className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 my-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all",
                pin.length > i
                  ? "bg-primary border-primary"
                  : error
                  ? "border-red-500"
                  : "border-muted-foreground/30"
              )}
            >
              {pin.length > i && (
                <div className="w-3 h-3 rounded-full bg-primary-foreground" />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-center text-red-500 text-sm mb-4">
            Incorrect PIN. Please try again.
          </p>
        )}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key) => (
            <Button
              key={key}
              variant={key === 'del' ? 'outline' : 'secondary'}
              className={cn(
                "h-16 text-2xl font-medium",
                key === '' && "invisible"
              )}
              onClick={() => {
                if (key === 'del') {
                  handleDelete();
                } else if (key !== '') {
                  handleDigit(key);
                }
              }}
              disabled={key === ''}
            >
              {key === 'del' ? <Delete className="h-6 w-6" /> : key}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
