import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border text-[12px] font-semibold transition-[background,border-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-emphasis focus-visible:ring-offset-1 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default:
          'border-[rgba(31,35,40,0.15)] bg-canvas-subtle text-fg hover:bg-[var(--gh-neutral-muted)]',
        primary:
          'border-[rgba(31,35,40,0.15)] bg-success-emphasis text-white hover:brightness-110',
        accent:
          'border-[rgba(31,35,40,0.15)] bg-accent-emphasis text-white hover:brightness-110',
        outline:
          'border-border bg-transparent text-fg hover:bg-canvas-subtle',
        ghost: 'border-transparent bg-transparent text-fg-muted hover:bg-canvas-subtle',
        danger:
          'border-[rgba(31,35,40,0.15)] bg-canvas-subtle text-danger-fg hover:bg-danger-emphasis hover:text-white',
      },
      size: {
        sm: 'h-7 px-2',
        md: 'h-8 px-3',
        lg: 'h-9 px-4',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
