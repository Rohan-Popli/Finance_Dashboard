/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Fintech dark design system
        'ft-bg':      'var(--bg)',
        'ft-card':    'var(--card)',
        'ft-primary': '#6366F1',
        'ft-primary-hover': '#4F46E5',
        'ft-border':  'var(--border)',
        'ft-text':    'var(--text)',
        'ft-muted':   'var(--muted)',
        // Tonal layering series
        'ft-surface-lowest': 'var(--surface-lowest)',
        'ft-surface':        'var(--surface)',
        'ft-surface-container': 'var(--surface-container)',
        'ft-surface-container-low': 'var(--surface-container-low)',
        'ft-surface-container-high': 'var(--surface-container-high)',
        'ft-surface-container-highest': 'var(--surface-container-highest)',
        // keep legacy aliases
        primary:    '#1e293b',
        secondary:  '#64748b',
        accent:     '#6366F1',
        background: '#0A0F1E',
        card:       '#1F2937',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        card: '12px',
      },
      width: {
        sidebar: '240px',
        'sidebar-collapsed': '64px',
      },
    },
  },
  plugins: [],
}


