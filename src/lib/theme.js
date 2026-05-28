// ─── CSS VARIABLES THEME SYSTEM ────────────────────────────────────────────
// Enables dark mode, system preference detection, and runtime theme switching

// Initialize CSS variables in DOM on page load
if (typeof document !== 'undefined') {
  const initTheme = () => {
    const root = document.documentElement;
    
    // Check for saved preference or system preference
    const saved = localStorage.getItem('app-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'dark' || (!saved && prefersDark);
    
    // Apply theme class to root
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };
  
  // Initialize immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', initTheme);
}

// ─── LIGHT THEME (Default) ────────────────────────────────────────
const LIGHT = {
  bg: 'hsl(var(--background))',
  bg2: 'hsl(var(--accent) / 0.08)',
  bg3: 'hsl(var(--accent) / 0.05)',
  bg4: 'hsl(var(--accent) / 0.03)',
  border: 'hsl(var(--border))',
  border2: 'hsl(var(--border) / 0.8)',
  text: 'hsl(var(--foreground))',
  text2: 'hsl(var(--foreground) / 0.65)',
  text3: 'hsl(var(--foreground) / 0.45)',
  accent: '#FF4D6D',
  accent2: '#FF8C42',
  green: '#06D6A0',
  blue: '#4361EE',
  purple: '#7C3AED',
  grad: 'linear-gradient(135deg, #FF8C42 0%, #FF4D6D 100%)',
  rose: '#FF4D6D',
  amber: '#FF8C42',
};

// ─── DARK THEME (Media Query Fallback) ────────────────────────────
const DARK = {
  bg: 'hsl(var(--background))',
  bg2: 'hsl(var(--accent) / 0.15)',
  bg3: 'hsl(var(--accent) / 0.10)',
  bg4: 'hsl(var(--accent) / 0.08)',
  border: 'hsl(var(--border))',
  border2: 'hsl(var(--border) / 0.8)',
  text: 'hsl(var(--foreground))',
  text2: 'hsl(var(--foreground) / 0.70)',
  text3: 'hsl(var(--foreground) / 0.50)',
  accent: '#FF6B8A',
  accent2: '#FFB366',
  green: '#06D6A0',
  blue: '#5B82FF',
  purple: '#9D5DFF',
  grad: 'linear-gradient(135deg, #FFB366 0%, #FF6B8A 100%)',
  rose: '#FF6B8A',
  amber: '#FFB366',
};

// ─── UNIFIED EXPORT ───────────────────────────────────────────────
// Use CSS variables directly from :root or .dark class
export const THEME = LIGHT; // Fallback to light theme (CSS handles actual theming)

export const INPUT_STYLE = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 12,
  background: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  color: 'hsl(var(--foreground))',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s, background-color 0.2s',
  boxSizing: 'border-box',
};

export const LABEL_STYLE = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'hsl(var(--foreground) / 0.65)',
  marginBottom: 6,
  letterSpacing: '0.02em',
};

// ─── THEME HELPERS ───────────────────────────────────────────────
export const setTheme = (mode) => {
  const root = document.documentElement;
  if (mode === 'dark') {
    root.classList.add('dark');
    localStorage.setItem('app-theme', 'dark');
  } else {
    root.classList.remove('dark');
    localStorage.setItem('app-theme', 'light');
  }
};

export const getTheme = () => {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

export const toggleTheme = () => {
  const current = getTheme();
  setTheme(current === 'dark' ? 'light' : 'dark');
};

export default THEME;