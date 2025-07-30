import { style, styleVariants } from '@vanilla-extract/css';

const buttonBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  borderRadius: '8px',
  fontFamily: 'inherit',
  fontSize: '16px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textDecoration: 'none',
  userSelect: 'none',
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  ':focus-visible': {
    outline: '2px solid #0066CC',
    outlineOffset: '2px',
  },
});

export const sizes = styleVariants({
  small: {
    padding: '8px 16px',
    fontSize: '14px',
  },
  medium: {
    padding: '12px 24px',
    fontSize: '16px',
  },
  large: {
    padding: '16px 32px',
    fontSize: '18px',
    minHeight: '60px',
  },
});

export const variants = styleVariants({
  primary: {
    backgroundColor: '#0066CC',
    color: 'white',
    ':hover': {
      backgroundColor: '#0052A3',
    },
    ':active': {
      backgroundColor: '#004085',
    },
  },
  secondary: {
    backgroundColor: '#E5E5E5',
    color: '#333333',
    ':hover': {
      backgroundColor: '#D4D4D4',
    },
    ':active': {
      backgroundColor: '#C3C3C3',
    },
  },
  danger: {
    backgroundColor: '#DC3545',
    color: 'white',
    ':hover': {
      backgroundColor: '#C82333',
    },
    ':active': {
      backgroundColor: '#BD2130',
    },
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#333333',
    border: '1px solid #D4D4D4',
    ':hover': {
      backgroundColor: '#F5F5F5',
    },
    ':active': {
      backgroundColor: '#E5E5E5',
    },
  },
});

export const fullWidth = style({
  width: '100%',
});

export const button = style([buttonBase]);