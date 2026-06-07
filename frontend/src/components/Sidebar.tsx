// ─────────────────────────────────────────────────────────────
// Sidebar.tsx
// Place: frontend/src/components/Sidebar.tsx
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../utils/auth';

// ── Nav items with proper SVG icon keys ──
const navItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    iconKey: 'dashboard',
  },
  {
    label: 'Total Members',
    path: '/total-members',
    iconKey: 'total',
  },
  {
    label: 'Active Members',
    path: '/active-members',
    iconKey: 'active',
  },
  {
    label: 'Expired Members',
    path: '/expired-members',
    iconKey: 'expired',
  },
  {
    label: 'Membership Revenue',
    path: '/membership-revenue',
    iconKey: 'revenue',
  },
  {
    label: 'Add Members',
    path: '/add-members',
    iconKey: 'add',
  },
  {
    label: 'Renewal Rate',
    path: '/membership-renewal-rate',
    iconKey: 'renewal',
  },
];

// ── SVG icon components ──
const Icon: React.FC<{ name: string; size?: number; color?: string }> = ({
  name, size = 18, color = 'currentColor',
}) => {
  const props = {
    width: size, height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'dashboard':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      );
    case 'total':
      return (
        <svg {...props}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      );
    case 'active':
      return (
        <svg {...props}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      );
    case 'expired':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      );
    case 'revenue':
      return (
        <svg {...props}>
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      );
    case 'add':
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="8.5" cy="7" r="4"/>
          <line x1="20" y1="8" x2="20" y2="14"/>
          <line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
      );
    case 'renewal':
      return (
        <svg {...props}>
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
      );
    case 'logout':
      return (
        <svg {...props}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      );
    case 'chevron-left':
      return (
        <svg {...props}>
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      );
    case 'chevron-right':
      return (
        <svg {...props}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      );
    default:
      return null;
  }
};

// ── Animated dumbbell logo ──
const DumbbellLogo: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => !p);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      width: collapsed ? 38 : 42,
      height: collapsed ? 38 : 42,
      borderRadius: collapsed ? 12 : 14,
      background: 'linear-gradient(135deg, #e00000 0%, #a00000 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: pulse
        ? '0 0 0 4px rgba(220,0,0,0.2), 0 0 20px rgba(220,0,0,0.4)'
        : '0 0 0 0px rgba(220,0,0,0), 0 4px 12px rgba(220,0,0,0.3)',
      transition: 'box-shadow 0.8s ease, width 0.3s, height 0.3s, border-radius 0.3s',
      cursor: 'default',
    }}>
      <svg
        width={collapsed ? 20 : 22}
        height={collapsed ? 20 : 22}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        style={{
          transition: 'transform 0.8s ease',
          transform: pulse ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <path d="M6 4v16M18 4v16M3 8h4M17 8h4M3 16h4M17 16h4"/>
      </svg>
    </div>
  );
};

// ── Main Sidebar ──
const Sidebar: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarWidth = collapsed ? 72 : 240;

  return (
    <>
      {/* Inject keyframes */}
      <style>{`
        @keyframes sidebar-slide-in {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes label-fade-in {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes active-bar-grow {
          from { height: 0; opacity: 0; }
          to   { height: 60%; opacity: 1; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .sidebar-nav-item {
          transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
        }
        .sidebar-nav-item:hover {
          background: rgba(220,0,0,0.08) !important;
          transform: translateX(3px);
        }
        .sidebar-nav-item.active-item {
          background: rgba(220,0,0,0.12) !important;
        }
        .sidebar-nav-item:hover .nav-icon-wrap {
          background: rgba(220,0,0,0.15);
        }
        .sidebar-nav-item.active-item .nav-icon-wrap {
          background: rgba(220,0,0,0.2);
        }
        .collapse-btn:hover {
          background: rgba(220,0,0,0.15) !important;
          border-color: rgba(220,0,0,0.4) !important;
        }
        .logout-btn:hover {
          background: rgba(220,0,0,0.1) !important;
          border-color: rgba(220,0,0,0.3) !important;
          color: #ff4444 !important;
        }
        .nav-icon-wrap {
          transition: background 0.2s ease;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <aside
        style={{
          width: sidebarWidth,
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0f 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          fontFamily: "'Inter', sans-serif",
          borderRight: '1px solid rgba(220,0,0,0.1)',
          flexShrink: 0,
          position: 'relative',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          animation: 'sidebar-slide-in 0.4s ease',
        }}
      >
        {/* Top red accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 2,
          background: 'linear-gradient(90deg, #e00000, rgba(220,0,0,0.3), transparent)',
        }} />

        {/* ── LOGO SECTION ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '20px 16px 16px' : '20px 16px 16px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          gap: 10,
          minHeight: 76,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : 12,
            overflow: 'hidden',
            flex: 1,
          }}>
            <DumbbellLogo collapsed={collapsed} />

            {!collapsed && (
              <div style={{ animation: 'label-fade-in 0.3s ease', overflow: 'hidden' }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '0.5px',
                  lineHeight: 1.2,
                  fontFamily: "'Inter', sans-serif",
                }}>
                  LIFETIME
                </div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#ff2b2b',
                  letterSpacing: '0.5px',
                  lineHeight: 1.2,
                  textShadow: '0 0 12px rgba(220,0,0,0.5)',
                }}>
                  FITNESS
                </div>
                <div style={{
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.3)',
                  letterSpacing: '2px',
                  marginTop: 2,
                  textTransform: 'uppercase',
                }}>
                  Admin Panel
                </div>
              </div>
            )}
          </div>

          {/* Collapse toggle button */}
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s',
              padding: 0,
            }}
          >
            <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} size={14} />
          </button>
        </div>

        {/* ── LABEL ── */}
        {!collapsed && (
          <div style={{
            padding: '14px 18px 8px',
            fontSize: 10,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}>
            Navigation
          </div>
        )}

        {/* ── NAV ITEMS ── */}
        <nav style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          padding: collapsed ? '8px 10px' : '0 10px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
          {navItems.map(item => {
            const isActive  = location.pathname === item.path;
            const isHovered = hoveredPath === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item${isActive ? ' active-item' : ''}`}
                onMouseEnter={() => setHoveredPath(item.path)}
                onMouseLeave={() => setHoveredPath(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: collapsed ? 0 : 12,
                  padding: collapsed ? '10px' : '10px 12px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  color: isActive ? '#ff4444' : 'rgba(255,255,255,0.55)',
                  position: 'relative',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  border: isActive
                    ? '1px solid rgba(220,0,0,0.2)'
                    : '1px solid transparent',
                  boxShadow: isActive
                    ? 'inset 0 0 20px rgba(220,0,0,0.05)'
                    : 'none',
                  minHeight: 44,
                  overflow: 'hidden',
                }}
                title={collapsed ? item.label : undefined}
              >
                {/* Active left bar */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: 0, top: '20%', bottom: '20%',
                    width: 3,
                    background: 'linear-gradient(180deg, #ff2b2b, #d40000)',
                    borderRadius: '0 3px 3px 0',
                    boxShadow: '0 0 8px rgba(220,0,0,0.7)',
                    animation: 'active-bar-grow 0.3s ease',
                  }} />
                )}

                {/* Hover shimmer */}
                {isHovered && !isActive && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(90deg, rgba(220,0,0,0.06) 0%, transparent 100%)',
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                  }} />
                )}

                {/* Icon wrapper */}
                <div
                  className="nav-icon-wrap"
                  style={{
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    background: isActive
                      ? 'rgba(220,0,0,0.18)'
                      : isHovered
                      ? 'rgba(220,0,0,0.1)'
                      : 'rgba(255,255,255,0.04)',
                  }}
                >
                  <Icon
                    name={item.iconKey}
                    size={17}
                    color={isActive ? '#ff4444' : isHovered ? '#ff6666' : 'rgba(255,255,255,0.5)'}
                  />
                </div>

                {/* Label */}
                {!collapsed && (
                  <span style={{
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: '0.1px',
                    whiteSpace: 'nowrap',
                    animation: 'label-fade-in 0.25s ease',
                    flex: 1,
                  }}>
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── DIVIDER ── */}
        <div style={{
          margin: '8px 14px',
          height: 1,
          background: 'rgba(255,255,255,0.05)',
        }} />

        {/* ── ADMIN PROFILE CARD ── */}
        {!collapsed && (
          <div style={{
            margin: '0 10px 10px',
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            animation: 'label-fade-in 0.3s ease',
          }}>
            {/* Avatar */}
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e00000, #900000)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
              boxShadow: '0 0 12px rgba(220,0,0,0.3)',
              border: '2px solid rgba(220,0,0,0.3)',
            }}>
              S
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#ffffff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                SuperAdmin
              </div>
              <div style={{
                fontSize: 10,
                color: '#ff4444',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}>
                Administrator
              </div>
            </div>
            {/* Online dot */}
            <div style={{
              width: 8, height: 8,
              borderRadius: '50%',
              background: '#00c9a7',
              boxShadow: '0 0 6px rgba(0,201,167,0.6)',
              flexShrink: 0,
            }} />
          </div>
        )}

        {/* Collapsed avatar */}
        {collapsed && (
          <div style={{
            display: 'flex', justifyContent: 'center',
            margin: '0 0 10px',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, #e00000, #900000)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#fff',
              boxShadow: '0 0 12px rgba(220,0,0,0.3)',
              border: '2px solid rgba(220,0,0,0.3)',
            }}>
              S
            </div>
          </div>
        )}

        {/* ── LOGOUT BUTTON ── */}
        <div style={{ padding: '0 10px 20px' }}>
          <button
            className="logout-btn"
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            style={{
              width: '100%',
              padding: collapsed ? '10px 0' : '11px 14px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10,
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 10,
              transition: 'all 0.2s',
            }}
          >
            <Icon name="logout" size={16} />
            {!collapsed && <span style={{ animation: 'label-fade-in 0.3s ease' }}>Logout</span>}
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;