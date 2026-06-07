import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import api from '../api/axios';
import { hdr, stat, empty, grid, modal } from '../styles/MembershipRevenue.styles';

interface Membership {
  _id: string;
  name: string;
  duration: string;
  amount: number;
  createdAt: string;
}

const MEMBERSHIP_NAMES = [
  'Gold Plan', 'Diwali Offer', 'New Year Special',
  'Student Offer', 'Festival Offer', "Women's Special", 'Package Plan',
];

const DURATIONS = ['1 Month', '3 Months', '6 Months', '1 Year'];

const PLAN_COLORS: Record<string, string> = {
  'Gold Plan': '#f5a623', 'Diwali Offer': '#ff6b35',
  'New Year Special': '#00c9a7', 'Student Offer': '#845ef7',
  'Festival Offer': '#f03e3e', "Women's Special": '#e64980', 'Package Plan': '#e00000',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const MembershipRevenue: React.FC = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading]         = useState(true);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editTarget, setEditTarget]   = useState<Membership | null>(null);
  const [form, setForm]               = useState({ name: MEMBERSHIP_NAMES[0], duration: DURATIONS[0], amount: '' });
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [animatingIn, setAnimatingIn] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const fetchMemberships = async () => {
    try {
      const res = await api.get('/memberships');
      setMemberships(res.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMemberships(); }, []);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ name: MEMBERSHIP_NAMES[0], duration: DURATIONS[0], amount: '' });
    setError(''); setModalOpen(true);
    requestAnimationFrame(() => setAnimatingIn(true));
  };

  const openEdit = (m: Membership) => {
    setEditTarget(m);
    setForm({ name: m.name, duration: m.duration, amount: String(m.amount) });
    setError(''); setModalOpen(true);
    requestAnimationFrame(() => setAnimatingIn(true));
  };

  const closeModal = () => {
    setAnimatingIn(false);
    setTimeout(() => { setModalOpen(false); setEditTarget(null); }, 350);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) closeModal();
  };

  const handleSubmit = async () => {
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) < 0)
      return setError('Please enter a valid amount');
    setSubmitting(true); setError('');
    try {
      if (editTarget) {
        const res = await api.put(`/memberships/${editTarget._id}`, { name: form.name, duration: form.duration, amount: Number(form.amount) });
        setMemberships(prev => prev.map(m => m._id === editTarget._id ? res.data : m));
      } else {
        const res = await api.post('/memberships', { name: form.name, duration: form.duration, amount: Number(form.amount) });
        setMemberships(prev => [res.data, ...prev]);
      }
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/memberships/${id}`);
      setMemberships(prev => prev.filter(m => m._id !== id));
    } catch { /* silent */ }
    finally { setDeletingId(null); }
  };

  const totalRevenue = memberships.reduce((sum, m) => sum + m.amount, 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <header style={hdr.bar}>
          <div>
            <h1 style={hdr.title}>Membership Revenue</h1>
            <p style={hdr.sub}>Manage all your gym membership plans</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ThemeToggle />
            <button style={hdr.addBtn} onClick={openAdd}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              Add Membership
            </button>
          </div>
        </header>

        <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
          <div style={stat.row}>
            {[
              { label: 'Total Plans',    value: memberships.length,                                     icon: '🏷️', color: '#e00000' },
              { label: 'Total Revenue',  value: `₹${totalRevenue.toLocaleString('en-IN')}`,             icon: '💰', color: '#00c9a7' },
              { label: 'Monthly Plans',  value: memberships.filter(m => m.duration === '1 Month').length, icon: '📅', color: '#845ef7' },
              { label: 'Annual Plans',   value: memberships.filter(m => m.duration === '1 Year').length,  icon: '🏆', color: '#f5a623' },
            ].map(s => (
              <div key={s.label} style={stat.card}>
                <div style={{ ...stat.icon, background: s.color + '22', color: s.color }}>{s.icon}</div>
                <div>
                  <p style={stat.val}>{s.value}</p>
                  <p style={stat.lbl}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {loading ? (
            <div style={empty.wrap}><div style={empty.spinner} /><p style={empty.txt}>Loading plans...</p></div>
          ) : memberships.length === 0 ? (
            <div style={empty.wrap}>
              <div style={empty.emptyIcon}>🏋️</div>
              <p style={empty.heading}>No membership plans yet</p>
              <p style={empty.txt}>Click "Add Membership" to create your first plan.</p>
            </div>
          ) : (
            <div style={grid.wrap}>
              {memberships.map(m => {
                const accent = PLAN_COLORS[m.name] || '#e00000';
                return (
                  <div key={m._id} style={grid.card}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 40px rgba(0,0,0,0.35), 0 0 0 1px ${accent}55`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.2), 0 0 0 1px var(--border-color)';
                    }}
                  >
                    <div style={{ ...grid.accentBar, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
                    <div style={grid.cardHead}>
                      <div style={{ ...grid.badge, background: accent + '22', color: accent }}>{m.name}</div>
                      <div style={grid.actions}>
                        <button style={grid.editBtn} title="Edit" onClick={() => openEdit(m)}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                        <button style={grid.delBtn} title="Delete" disabled={deletingId === m._id}
                          onClick={() => handleDelete(m._id)}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,0,0,0.18)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
                          {deletingId === m._id ? '...' : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div style={grid.amtRow}>
                      <span style={grid.rupee}>₹</span>
                      <span style={{ ...grid.amt, color: accent }}>{m.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={grid.metaRow}>
                      <div style={grid.metaItem}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span>{m.duration}</span>
                      </div>
                      <div style={grid.metaItem}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span>{formatDate(m.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {modalOpen && (
        <div ref={overlayRef} style={{ ...modal.overlay, opacity: animatingIn ? 1 : 0 }} onClick={handleOverlayClick}>
          <div style={{ ...modal.box, transform: animatingIn ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(20px)', opacity: animatingIn ? 1 : 0 }}>
            <div style={modal.head}>
              <div>
                <h2 style={modal.title}>{editTarget ? 'Edit Membership' : 'Add Membership'}</h2>
                <p style={modal.sub}>{editTarget ? 'Update the plan details below' : 'Fill in the details to create a new plan'}</p>
              </div>
              <button style={modal.closeBtn} onClick={closeModal}>✕</button>
            </div>
            <div style={modal.body}>
              <label style={modal.label}>Membership Name</label>
              <div style={modal.selectWrap}>
                <select style={modal.select} value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}>
                  {MEMBERSHIP_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <svg style={modal.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <label style={modal.label}>Duration</label>
              <div style={modal.selectWrap}>
                <select style={modal.select} value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}>
                  {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <svg style={modal.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <label style={modal.label}>Amount (₹)</label>
              <div style={modal.inputWrap}>
                <span style={modal.rupeePrefix}>₹</span>
                <input style={modal.input} type="number" min="0" placeholder="e.g. 1999"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              </div>
              {error && <p style={modal.error}>{error}</p>}
              <button style={{ ...modal.submitBtn, opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
                disabled={submitting} onClick={handleSubmit}
                onMouseEnter={e => !submitting && ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}>
                {submitting ? (editTarget ? 'Updating...' : 'Creating...') : (editTarget ? 'Update Membership' : 'Create Membership')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #16161f; color: #fff; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        * { transition: transform 0.25s ease, box-shadow 0.25s ease; }
      `}</style>
    </div>
  );
};

export default MembershipRevenue;