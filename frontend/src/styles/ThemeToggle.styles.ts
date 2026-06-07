// ─────────────────────────────────────────────────────────────
// ThemeToggle.styles.ts
// Place: frontend/src/styles/ThemeToggle.styles.ts
// ─────────────────────────────────────────────────────────────

import React from 'react';

export const themeToggleStyles: Record<string, React.CSSProperties> = {
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

// ─────────────────────────────────────────────────────────────
// Dashboard.styles.ts
// Place: frontend/src/styles/Dashboard.styles.ts
// ─────────────────────────────────────────────────────────────

export const dashboardStyles: Record<string, React.CSSProperties> = {
  root: { display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' },
  content: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: {
    height: 64,
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    background: 'var(--bg-secondary)',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
    fontFamily: "'Inter', sans-serif",
  },
  main: { flex: 1, padding: 40 },
  placeholder: { color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" },
};

// ─────────────────────────────────────────────────────────────
// ActiveMembers.styles.ts
// Place: frontend/src/styles/ActiveMembers.styles.ts
// ─────────────────────────────────────────────────────────────

export const activeMembersStyles: Record<string, React.CSSProperties> = {
  header: {
    height: 72,
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 36px',
    background: 'var(--bg-secondary)',
    flexShrink: 0,
  },
  headerTitle: { fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
  headerSub: { fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' },
  main: { flex: 1, padding: '28px 32px', overflowY: 'auto' },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 },
  statCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 14,
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  statVal: { fontSize: 22, fontWeight: 800, margin: 0 },
  statLbl: { fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' },
  searchWrap: { position: 'relative', marginBottom: 20 },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
  },
  searchInput: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 10,
    color: 'var(--text-primary)',
    fontSize: 13,
    outline: 'none',
  },
  tableWrap: { overflowX: 'auto', borderRadius: 14, border: '1px solid var(--border-color)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    background: 'var(--bg-card)',
    borderBottom: '1px solid var(--border-color)',
    whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' },
  td: { padding: '14px 16px', color: 'var(--text-primary)', whiteSpace: 'nowrap', verticalAlign: 'middle' },
  memberIdBadge: { fontSize: 11, fontWeight: 700, padding: '3px 8px', background: 'rgba(220,0,0,0.1)', color: '#e00000', borderRadius: 6, letterSpacing: 0.5 },
  nameCell: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff2b2b, #d40000)',
    color: '#fff', fontSize: 13, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  nameTxt: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 },
  emailTxt: { fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' },
  phoneTxt: { fontSize: 13, color: 'var(--text-secondary)' },
  planBadge: { fontSize: 11, fontWeight: 600, padding: '3px 8px', background: 'rgba(132,94,247,0.12)', color: '#845ef7', borderRadius: 6 },
  durationTxt: { fontSize: 12, color: 'var(--text-secondary)' },
  amtTxt: { fontSize: 13, fontWeight: 700, color: '#00c9a7' },
  dateTxt: { fontSize: 12, color: 'var(--text-primary)' },
  daysLeft: { fontSize: 10, margin: '2px 0 0' },
  payBadge: { fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6 },
  activeBadge: { fontSize: 11, fontWeight: 600, color: '#00c9a7' },
  delBtn: {
    width: 30, height: 30, borderRadius: 8, border: 'none',
    background: 'rgba(220,0,0,0.08)', color: '#ff4444',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  },
  centerMsg: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  spinner: {
    width: 36, height: 36, border: '3px solid var(--border-color)',
    borderTop: '3px solid #e00000', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  emptyTxt: { fontSize: 15, color: 'var(--text-muted)', margin: 0 },
};

// ─────────────────────────────────────────────────────────────
// AddMembers.styles.ts
// Place: frontend/src/styles/AddMembers.styles.ts
// ─────────────────────────────────────────────────────────────

export const addMembersStyles: Record<string, React.CSSProperties> = {
  header: {
    height: 72, borderBottom: '1px solid var(--border-color)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 36px', background: 'var(--bg-secondary)', flexShrink: 0,
  },
  headerTitle: { fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
  headerSub: { fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' },
  main: { flex: 1, padding: '32px 36px', overflowY: 'auto', maxWidth: 860, width: '100%', margin: '0 auto' },
  stepRow: { display: 'flex', alignItems: 'center', marginBottom: 28 },
  stepItem: { display: 'flex', alignItems: 'center', gap: 10 },
  stepCircle: {
    width: 32, height: 32, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, transition: 'all 0.3s',
  },
  stepLabel: { fontSize: 13, fontWeight: 600, transition: 'color 0.3s' },
  stepLine: { flex: 1, height: 2, margin: '0 16px', borderRadius: 2, transition: 'background 0.3s' },
  card: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
    borderRadius: 18, padding: '28px 32px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  },
  cardSection: { marginBottom: 8 },
  sectionHead: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  sectionIcon: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
  divider: { height: 1, background: 'var(--border-color)', margin: '24px 0' },
  fieldGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px 20px' },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: 0.5, textTransform: 'uppercase' },
  input: {
    padding: '11px 14px', background: 'var(--input-bg)',
    border: '1px solid var(--input-border)', borderRadius: 10,
    color: 'var(--text-primary)', fontSize: 13, outline: 'none',
  },
  selectWrap: { position: 'relative' },
  select: {
    width: '100%', padding: '11px 38px 11px 14px',
    background: 'var(--input-bg)', border: '1px solid var(--input-border)',
    borderRadius: 10, color: 'var(--text-primary)', fontSize: 13,
    outline: 'none', appearance: 'none', cursor: 'pointer',
  },
  chevron: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' },
  readonlyField: {
    padding: '11px 14px', background: 'var(--bg-card)',
    border: '1px solid var(--border-color)', borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  readonlyAmt: { fontSize: 18, fontWeight: 800, color: '#00c9a7' },
  readonlyTxt: { fontSize: 13, color: 'var(--text-primary)' },
  readonlyTag: { fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'rgba(0,201,167,0.12)', color: '#00c9a7', letterSpacing: 0.3 },
  errTxt: { fontSize: 11, color: '#ff4444', marginTop: 2 },
  noPlanBanner: { padding: '14px 18px', background: 'rgba(255,180,0,0.08)', border: '1px solid rgba(255,180,0,0.25)', borderRadius: 10, color: '#f5a623', fontSize: 13 },
  primaryBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #ff2b2b, #d40000)',
    border: 'none', borderRadius: 12,
    color: '#fff', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', marginTop: 24,
    boxShadow: '0 4px 20px rgba(220,0,0,0.3)',
    transition: 'transform 0.2s, opacity 0.2s',
  },
  ghostBtn: {
    padding: '14px 20px', background: 'var(--bg-card)',
    border: '1px solid var(--border-color)', borderRadius: 12,
    color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', marginTop: 24,
  },
  summaryStrip: {
    display: 'flex', alignItems: 'center', flexWrap: 'wrap',
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 12, padding: '16px 24px', marginBottom: 28,
  },
  summaryItem: { display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 100 },
  summaryLbl: { fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryVal: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },
  summaryDivider: { width: 1, height: 36, background: 'var(--border-color)', margin: '0 20px' },
  pmGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 16 },
  pmCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    padding: '18px 12px', borderRadius: 12, border: '2px solid',
    cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
  },
  pmIcon: { fontSize: 24 },
  pmLabel: { fontSize: 13, fontWeight: 600 },
  pmBadge: { position: 'absolute', top: 8, right: 8, fontSize: 9, fontWeight: 700, padding: '2px 6px', background: 'rgba(220,0,0,0.15)', color: '#e00000', borderRadius: 20, letterSpacing: 0.5 },
  razorpayNote: { padding: '12px 16px', background: 'rgba(220,0,0,0.06)', border: '1px solid rgba(220,0,0,0.2)', borderRadius: 10, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 },
  cardNote: { padding: '12px 16px', background: 'rgba(0,100,255,0.06)', border: '1px solid rgba(0,100,255,0.2)', borderRadius: 10, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 },
  successIcon: { fontSize: 64, marginBottom: 12 },
  successTitle: { fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' },
  successSub: { fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 },
  successGrid: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', textAlign: 'left' },
  successRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--border-color)' },
  successLbl: { fontSize: 12, color: 'var(--text-muted)' },
  successVal: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },
};