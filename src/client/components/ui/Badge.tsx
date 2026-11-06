import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-main)]',
        accent:
          'border-transparent bg-[var(--accent-subtle)] text-[var(--accent-primary)]',
        verified:
          'border-[oklch(0.68_0.18_150_/_0.3)] bg-[var(--status-verified-bg)] text-[var(--status-verified)]',
        staged:
          'border-[oklch(0.76_0.16_75_/_0.3)] bg-[var(--status-staged-bg)] text-[var(--status-staged)]',
        unpaid:
          'border-[oklch(0.65_0.22_25_/_0.3)] bg-[var(--status-unpaid-bg)] text-[var(--status-unpaid)]',
        outline: 'border-[var(--border-subtle)] text-[var(--text-muted)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
