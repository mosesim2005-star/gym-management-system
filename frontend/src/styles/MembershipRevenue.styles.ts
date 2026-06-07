import type { CSSProperties } from 'react';

export const hdr: Record<string, CSSProperties> = {
  bar: {
    height: 72, borderBottom: '1px solid var(--border-color)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 36px', background: 'var(--bg-secondary)', flexShrink: 0,
  },
  title: { fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
  sub: { fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #ff2b2b, #d40000)',
    border: 'none', borderRadius: 12, color: '#fff',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(220,0,0,0.35)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
};

export const stat: Record<string, CSSProperties> = {
  row: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16, marginBottom: 32,
  },
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 14, padding: '18px 20px',
    display: 'flex', alignItems: 'center', gap: 16,
  },
  icon: {
    width: 46, height: 46, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, flexShrink: 0,
  },
  val: { fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
  lbl: { fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' },
};

export const empty: Record<string, CSSProperties> = {
  wrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', paddingTop: 80, gap: 12,
  },
  spinner: {
    width: 36, height: 36, border: '3px solid var(--border-color)',
    borderTop: '3px solid #e00000', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  emptyIcon: { fontSize: 56, marginBottom: 8 },
  heading: { fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 },
  txt: { fontSize: 14, color: 'var(--text-muted)', margin: 0 },
};

export const grid: Record<string, CSSProperties> = {
  wrap: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20,
  },
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 16, overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2), 0 0 0 1px var(--border-color)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    cursor: 'default',
  },
  accentBar: { height: 4, width: '100%' },
  cardHead: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 18px 8px',
  },
  badge: { fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, letterSpacing: 0.3 },
  actions: { display: 'flex', gap: 6 },
  editBtn: {
    width: 30, height: 30, borderRadius: 8, border: 'none',
    background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'background 0.2s',
  },
  delBtn: {
    width: 30, height: 30, borderRadius: 8, border: 'none',
    background: 'rgba(255,255,255,0.06)', color: '#ff4444',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'background 0.2s',
  },
  amtRow: { display: 'flex', alignItems: 'baseline', gap: 4, padding: '6px 18px 12px' },
  rupee: { fontSize: 18, fontWeight: 600, color: 'var(--text-secondary)' },
  amt: { fontSize: 36, fontWeight: 800, letterSpacing: -1, lineHeight: 1 },
  metaRow: {
    display: 'flex', flexDirection: 'column', gap: 6,
    padding: '12px 18px 18px', borderTop: '1px solid var(--border-color)',
  },
  metaItem: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' },
};

export const modal: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000, transition: 'opacity 0.35s ease',
  },
  box: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
    borderRadius: 20, width: '100%', maxWidth: 460, margin: '0 20px',
    boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
    transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease',
    overflow: 'hidden',
  },
  head: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: '24px 28px 0',
  },
  title: { fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
  sub: { fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' },
  closeBtn: {
    background: 'rgba(255,255,255,0.07)', border: 'none',
    color: 'var(--text-muted)', borderRadius: 8,
    width: 30, height: 30, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, flexShrink: 0,
  },
  body: { padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: 0.5, marginTop: 10 },
  selectWrap: { position: 'relative' },
  select: {
    width: '100%', padding: '12px 40px 12px 14px',
    background: 'var(--input-bg)', border: '1px solid var(--input-border)',
    borderRadius: 10, color: 'var(--text-primary)',
    fontSize: 13, outline: 'none', appearance: 'none', cursor: 'pointer',
  },
  chevron: {
    position: 'absolute', right: 14, top: '50%',
    transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)',
  },
  inputWrap: { position: 'relative' },
  rupeePrefix: {
    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
    fontSize: 14, color: 'var(--text-muted)', pointerEvents: 'none',
  },
  input: {
    width: '100%', padding: '12px 14px 12px 30px',
    background: 'var(--input-bg)', border: '1px solid var(--input-border)',
    borderRadius: 10, color: 'var(--text-primary)', fontSize: 13, outline: 'none',
  },
  error: { fontSize: 12, color: '#ff4444', margin: '4px 0 0' },
  submitBtn: {
    marginTop: 16, padding: '14px',
    background: 'linear-gradient(135deg, #ff2b2b, #d40000)',
    border: 'none', borderRadius: 12, color: '#fff',
    fontSize: 14, fontWeight: 700, letterSpacing: 0.5, cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(220,0,0,0.3)', transition: 'transform 0.2s, opacity 0.2s',
  },
};