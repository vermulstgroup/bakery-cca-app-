import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatUGX(amount: number) {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'UGX',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).replace('UGX', 'UGX ');
}
