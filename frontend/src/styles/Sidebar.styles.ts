// ─────────────────────────────────────────────────────────────
// Sidebar.styles.ts
// Place: frontend/src/styles/Sidebar.styles.ts
// ─────────────────────────────────────────────────────────────

import React from 'react';

export const sidebarCSS = `
  .sidebar-root {
    width: 240px;
    min-height: 100vh;
    background: #0d0d12;
    display: flex;
    flex-direction: column;
    padding: 24px 12px;
    font-family: 'Inter', sans-serif;
    border-right: 1px solid rgba(220,0,0,0.12);
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }

  /* subtle red glow top */
  .sidebar-root::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(220,0,0,0.6), transparent);
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px 8px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 16px;
  }

  .sidebar-logo-icon {
    width: 34px;
    height: 34px;
    background: linear-gradient(135deg, #ff2b2b, #d40000);
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 0 16px rgba(220,0,0,0.4);
  }

  .sidebar-logo-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 15px;
    color: #ffffff;
    letter-spacing: 2.5px;
  }

  .sidebar-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 14px;
    border-radius: 10px;
    color: rgba(255,255,255,0.45);
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .sidebar-item::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(220,0,0,0.08), transparent);
    opacity: 0;
    transition: opacity 0.2s;
    border-radius: inherit;
  }

  .sidebar-item:hover {
    color: rgba(255,255,255,0.85);
    background: rgba(255,255,255,0.04);
  }

  .sidebar-item:hover::before { opacity: 1; }

  .sidebar-item.active {
    background: rgba(220,0,0,0.12);
    color: #ff4444;
    border: 1px solid rgba(220,0,0,0.2);
    box-shadow: inset 0 0 20px rgba(220,0,0,0.05);
  }

  .sidebar-item.active::before { opacity: 1; }

  /* Left accent bar for active */
  .sidebar-item.active::after {
    content: '';
    position: absolute;
    left: 0; top: 20%; bottom: 20%;
    width: 2px;
    background: #ff2b2b;
    border-radius: 0 2px 2px 0;
    box-shadow: 0 0 8px rgba(220,0,0,0.6);
  }

  .sidebar-icon {
    width: 20px;
    text-align: center;
    font-size: 15px;
    flex-shrink: 0;
  }

  .sidebar-logout-btn {
    padding: 11px 14px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    color: rgba(255,255,255,0.3);
    cursor: pointer;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    margin-top: 12px;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.2s;
    width: 100%;
  }

  .sidebar-logout-btn:hover {
    border-color: rgba(220,0,0,0.3);
    color: rgba(220,0,0,0.7);
    background: rgba(220,0,0,0.05);
  }
`;

export const sidebarStyles: Record<string, React.CSSProperties> = {
  root: {
    width: 240,
    minHeight: '100vh',
    background: '#0d0d12',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 12px',
    fontFamily: "'Inter', sans-serif",
    borderRight: '1px solid rgba(220,0,0,0.12)',
    flexShrink: 0,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '4px 8px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    marginBottom: 16,
  },
  logoIcon: {
    width: 34,
    height: 34,
    background: 'linear-gradient(135deg, #ff2b2b, #d40000)',
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 0 16px rgba(220,0,0,0.4)',
  },
  logoText: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 15,
    color: '#ffffff',
    letterSpacing: '2.5px',
  },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: 3 },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 11,
    padding: '11px 14px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
  },
  navActive: {
    background: 'rgba(220,0,0,0.12)',
    color: '#ff4444',
    border: '1px solid rgba(220,0,0,0.2)',
    boxShadow: 'inset 0 0 20px rgba(220,0,0,0.05)',
  },
  icon: { width: 20, textAlign: 'center' as const, fontSize: 15, flexShrink: 0 },
  logoutBtn: {
    padding: '11px 14px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    color: 'rgba(255,255,255,0.3)',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    marginTop: 12,
    textAlign: 'left' as const,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    transition: 'all 0.2s',
    width: '100%',
  },
};