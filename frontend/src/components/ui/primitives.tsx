import React from 'react';
import type { FacilityType } from '../../types';

// ─── Button ───────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-base-dark hover:bg-accent-light shadow-accent hover:shadow-hover active:scale-[0.98]',
  secondary: 'bg-transparent text-ink border border-border hover:bg-[rgba(242,239,233,0.04)] hover:border-[rgba(242,239,233,0.36)] active:scale-[0.98]',
  ghost: 'text-ink-muted hover:text-ink hover:bg-base-dark active:scale-[0.98]',
  danger: 'bg-alert text-white hover:bg-alert-dark active:scale-[0.98]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-lg gap-2',
  lg: 'px-8 py-4 text-[15px] rounded-xl gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  iconRight,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-body font-medium
        transition-all duration-150 cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : icon}
      {children}
      {iconRight}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  elevated?: boolean;
}

export function Card({ children, className = '', hover, onClick, elevated }: CardProps) {
  return (
    <div
      className={`
        bg-card/90 backdrop-blur-sm rounded-2xl border border-border
        ${elevated ? 'shadow-lg' : 'shadow-card'}
        ${hover || onClick ? 'hover:shadow-hover hover:-translate-y-0.5 hover:border-[rgba(242,239,233,0.14)] cursor-pointer' : ''}
        transition-all duration-250
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────

type BadgeVariant = 'default' | 'success' | 'alert' | 'warm' | 'accent' | 'ink';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-base-deep text-ink-muted',
  success: 'bg-success-light text-success-dark',
  alert: 'bg-alert-light text-alert-dark',
  warm: 'bg-warm-light text-warm-dark',
  accent: 'bg-accent-light text-accent-dark',
  ink: 'bg-ink text-base',
};

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center font-body font-medium rounded-full
      ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
      ${badgeVariants[variant]}
    `}>
      {children}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  circle?: boolean;
}

export function Skeleton({ width = '100%', height = '1rem', className = '', circle }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${circle ? 'rounded-full' : ''} ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <Card className="p-5">
      <Skeleton height="1.2rem" width="60%" className="mb-3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height="0.875rem" width={`${80 - i * 15}%`} className="mb-2" />
      ))}
    </Card>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────

export function Divider({ className = '' }: { className?: string }) {
  return <div className={`border-t border-base-deep ${className}`} />;
}

// ─── Section Label ────────────────────────────────────────────────────────

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-xs font-semibold tracking-widest uppercase text-ink-subtle mb-2">
      {children}
    </p>
  );
}

// ─── Capacity Bar ─────────────────────────────────────────────────────────

interface CapacityBarProps {
  used: number;
  total: number;
  label?: string;
}

export function CapacityBar({ used, total, label }: CapacityBarProps) {
  const pct = Math.min((used / total) * 100, 100);
  const color = pct > 85 ? 'bg-alert' : pct > 65 ? 'bg-warm' : 'bg-success';
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-ink-muted mb-1">
          <span>{label}</span>
          <span className="font-medium">{pct.toFixed(1)}%</span>
        </div>
      )}
      <div className="h-1.5 rounded-full bg-base-deep overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Facility Type Badge ──────────────────────────────────────────────────

const facilityConfig: Record<FacilityType, { label: string; variant: BadgeVariant; icon: string }> = {
  COLD_STORAGE: { label: 'Cold Storage', variant: 'accent', icon: '❄️' },
  WAREHOUSE: { label: 'Warehouse', variant: 'default', icon: '🏭' },
  HYBRID: { label: 'Hybrid', variant: 'warm', icon: '⚡' },
};

export function FacilityBadge({ type }: { type: FacilityType }) {
  const cfg = facilityConfig[type];
  return (
    <Badge variant={cfg.variant}>
      <span className="mr-1">{cfg.icon}</span>
      {cfg.label}
    </Badge>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = '📦', title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-4xl mb-4 opacity-60">{icon}</div>
      <h3 className="font-display text-xl font-bold text-ink mb-2">{title}</h3>
      {message && <p className="text-ink-muted text-sm max-w-sm text-balance">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ─── Error State ─────────────────────────────────────────────────────────

export function ErrorState({ message = 'Something went wrong', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="text-3xl mb-3">⚠️</div>
      <p className="text-ink-muted text-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
