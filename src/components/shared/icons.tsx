import type { SVGProps } from 'react';

export function BakeryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 20V8a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v12" />
      <path d="M6 20h12" />
      <path d="M12 14a2 2 0 1 1-4 0" />
      <path d="M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="M16 6h2" />
    </svg>
  );
}
