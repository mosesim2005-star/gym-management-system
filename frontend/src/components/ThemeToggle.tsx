import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={styles.btn}
    >
      <div style={{ ...styles.track, background: isDark ? '#e00000' : '#e0e0e0' }}>
        <div
          style={{
            ...styles.thumb,
            transform: isDark ? 'translateX(22px)' : 'translateX(2px)',
            background: '#fff',
          }}
        >
          <span style={styles.icon}>{isDark ? '🌙' : '☀️'}</span>
        </div>
      </div>
      <span style={{ ...styles.label, color: isDark ? 'rgba(255,255,255,0.6)' : '#555' }}>
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};

const styles: Record<string, React.CSSProperties> = {
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 10px',
    borderRadius: 8,
    transition: 'background 0.2s',
  },
  track: {
    width: 46,
    height: 24,
    borderRadius: 12,
    position: 'relative',
    transition: 'background 0.3s',
    flexShrink: 0,
  },
  thumb: {
    position: 'absolute',
    top: 2,
    width: 20,
    height: 20,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
  },
  icon: { fontSize: 10, lineHeight: 1 },
  label: { fontSize: 13, fontWeight: 500, fontFamily: "'Inter', sans-serif" },
};

export default ThemeToggle;