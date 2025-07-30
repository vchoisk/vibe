import React from 'react';
import { button, sizes, variants, fullWidth } from './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  fullWidth?: boolean;
  loading?: boolean;
  as?: 'button' | 'a';
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      fullWidth: isFullWidth = false,
      loading = false,
      disabled,
      className = '',
      as = 'button',
      href,
      ...props
    },
    ref
  ) => {
    const classes = [
      button,
      variants[variant],
      sizes[size],
      isFullWidth && fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    if (as === 'a' && href) {
      return (
        <a
          href={href}
          className={classes}
          aria-disabled={disabled || loading}
          {...(props as any)}
        >
          {loading ? 'Loading...' : children}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';