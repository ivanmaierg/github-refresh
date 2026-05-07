import type { Config } from 'tailwindcss';

// GitHub Primer color tokens (light + dark)
const primer = {
  canvas: { DEFAULT: 'var(--gh-canvas-default)', subtle: 'var(--gh-canvas-subtle)' },
  border: { DEFAULT: 'var(--gh-border-default)', muted: 'var(--gh-border-muted)' },
  fg: { DEFAULT: 'var(--gh-fg-default)', muted: 'var(--gh-fg-muted)', subtle: 'var(--gh-fg-subtle)' },
  accent: { fg: 'var(--gh-accent-fg)', emphasis: 'var(--gh-accent-emphasis)', subtle: 'var(--gh-accent-subtle)' },
  attention: { fg: 'var(--gh-attention-fg)', emphasis: 'var(--gh-attention-emphasis)' },
  success: { fg: 'var(--gh-success-fg)', emphasis: 'var(--gh-success-emphasis)' },
  danger: { fg: 'var(--gh-danger-fg)', emphasis: 'var(--gh-danger-emphasis)' },
  neutral: { emphasis: 'var(--gh-neutral-emphasis)', muted: 'var(--gh-neutral-muted)' },
};

export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        ...primer,
        background: 'var(--gh-canvas-default)',
        foreground: 'var(--gh-fg-default)',
        primary: {
          DEFAULT: 'var(--gh-accent-emphasis)',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: 'var(--gh-canvas-subtle)',
          foreground: 'var(--gh-fg-default)',
        },
        muted: {
          DEFAULT: 'var(--gh-canvas-subtle)',
          foreground: 'var(--gh-fg-muted)',
        },
        destructive: {
          DEFAULT: 'var(--gh-danger-emphasis)',
          foreground: '#ffffff',
        },
        ring: 'var(--gh-accent-emphasis)',
        input: 'var(--gh-border-default)',
      },
      borderRadius: {
        lg: '6px',
        md: '6px',
        sm: '4px',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Noto Sans"',
          'Helvetica',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'SF Mono', 'Menlo', 'Consolas', 'Liberation Mono', 'monospace'],
      },
      fontSize: {
        xs: ['12px', '18px'],
        sm: ['12px', '20px'],
        base: ['14px', '20px'],
        lg: ['16px', '24px'],
        xl: ['20px', '28px'],
      },
      boxShadow: {
        sm: '0 1px 0 rgba(31, 35, 40, 0.04)',
        DEFAULT: '0 3px 6px rgba(140,149,159,0.15)',
        md: '0 8px 24px rgba(140,149,159,0.2)',
      },
    },
  },
  plugins: [],
} satisfies Config;
