import type { CSSProperties } from 'react';

export const sk: Record<string, CSSProperties> = {
  spinner: {
    width: 40, height: 40,
    border: '3px solid var(--border-color)',
    borderTop: '3px solid #e00000',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

export const st: Record<string, CSSProperties> = {
  header: {
    height: 72, borderBottom: '1px solid var(--border-color)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 36px', background: 'var(--bg-secondary)', flexShrink: 0,
  },
  headerTitle: { fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
  headerSub:   { fontSize: 12, color: 'var(--text-secondary)', margin: '3px 0 0' },

  refreshBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', background: 'var(--bg-card)',
    border: '1px solid var(--border-color)', borderRadius: 10,
    color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s',
  },
  retryBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #ff2b2b, #d40000)',
    border: 'none', borderRadius: 10, color: '#fff',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },

  main: {
    flex: 1, padding: '28px 32px', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 20,
  },

  statRow: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 },
  statCard: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
    borderRadius: 16, padding: '18px 20px',
    cursor: 'pointer', transition: 'all 0.25s ease',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
  },
  statIcon: {
    width: 42, height: 42, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  statValue: { fontSize: 24, fontWeight: 800, margin: '0 0 4px', lineHeight: 1 },
  statLabel: { fontSize: 12, color: 'var(--text-muted)', margin: 0, fontWeight: 500 },

  // Row 2: Growth chart + Top Plans
  row2: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 },
  // Row 3: Payment donut + Revenue bar
  row3: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 },
  // Row 4: Recent Registrations (left) + Expired Members table (right, replaces Expiring Soon)
  row4: { display: 'grid', gridTemplateColumns: '420px 1fr', gap: 16 },

  chartCard: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
    borderRadius: 16, padding: '20px 24px',
  },
  plansCard: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
    borderRadius: 16, padding: '20px 24px',
  },
  donutCard: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
    borderRadius: 16, padding: '20px 24px',
  },
  revenueCard: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
    borderRadius: 16, padding: '20px 24px',
  },
  recentCard: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
    borderRadius: 16, padding: '20px 24px',
  },

  // Expiring soon card — kept for Expiring Soon strip shown INSIDE expired card header
  expiringCard: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
    borderRadius: 16, padding: '20px 24px',
  },

  // The big expired card that now sits RIGHT of Recent Registrations
  expiredFullCard: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
    borderRadius: 16, padding: '20px 24px',
    display: 'flex', flexDirection: 'column', minHeight: 0,
  },

  expiredStatsStrip: {
    display: 'flex', gap: 0,
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 10, overflow: 'hidden', marginBottom: 14,
  },
  expiredStatItem: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '10px 8px', borderRight: '1px solid var(--border-color)',
  },

  expiredSearchInput: {
    padding: '7px 10px 7px 30px',
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 8, color: 'var(--text-primary)', fontSize: 12,
    outline: 'none', width: 180,
  },
  viewAllBtnRed: {
    display: 'inline-block', padding: '7px 14px',
    background: 'linear-gradient(135deg, rgba(220,0,0,0.15), rgba(220,0,0,0.08))',
    border: '1px solid rgba(220,0,0,0.3)', borderRadius: 8,
    color: '#e00000', fontSize: 12, fontWeight: 600,
    textDecoration: 'none', whiteSpace: 'nowrap',
  },

  expiredTable: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  expiredTh: {
    padding: '10px 12px', textAlign: 'left',
    fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: 0.5,
    background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)',
    whiteSpace: 'nowrap',
  },
  expiredTd: {
    padding: '11px 12px', color: 'var(--text-primary)',
    whiteSpace: 'nowrap', verticalAlign: 'middle',
  },

  memberIdBadge: {
    fontSize: 10, fontWeight: 700, padding: '2px 7px',
    background: 'rgba(220,0,0,0.1)', color: '#e00000',
    borderRadius: 6, letterSpacing: 0.5,
  },

  cardHeader: {
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: 18,
  },
  cardTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
  cardSub:   { fontSize: 11, color: 'var(--text-muted)', margin: '3px 0 0' },

  pill: {
    fontSize: 11, fontWeight: 600,
    padding: '4px 10px', borderRadius: 20, letterSpacing: 0.3,
  },
  viewAllLink: {
    fontSize: 12, fontWeight: 600, color: '#e00000',
    textDecoration: 'none', flexShrink: 0,
  },
  memberRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 8px', transition: 'background 0.15s',
    borderRadius: 8, cursor: 'default',
  },
  emptyInner: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', minHeight: 120,
  },

  emailBtn: {
    width: 28, height: 28, borderRadius: 7, border: 'none',
    background: 'rgba(0,100,255,0.1)', color: '#4d94ff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
  },
  waBtn: {
    width: 28, height: 28, borderRadius: 7, border: 'none',
    background: 'rgba(37,211,102,0.12)', color: '#25d366',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
  },

  toastContainer: {
    position: 'fixed', top: 20, right: 20,
    display: 'flex', flexDirection: 'column', gap: 10,
    zIndex: 9999,
  },
  toast: {
    padding: '12px 20px', borderRadius: 12,
    color: '#fff', fontSize: 13, fontWeight: 600,
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  },
};