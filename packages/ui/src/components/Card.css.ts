import { style } from '@vanilla-extract/css';

export const card = style({
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  transition: 'box-shadow 0.2s ease',
  ':hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
  },
});

export const cardHeader = style({
  padding: '20px 24px',
  borderBottom: '1px solid #E5E5E5',
});

export const cardBody = style({
  padding: '24px',
});

export const cardFooter = style({
  padding: '16px 24px',
  borderTop: '1px solid #E5E5E5',
  backgroundColor: '#F9F9F9',
});

export const clickable = style({
  cursor: 'pointer',
  userSelect: 'none',
});