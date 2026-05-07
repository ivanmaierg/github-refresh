import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-8 w-full rounded-md border border-border bg-canvas px-3 text-[13px] text-fg shadow-sm transition-colors placeholder:text-fg-subtle focus-visible:border-accent-emphasis focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-emphasis disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
