import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import api from '../api/axios';

interface Member {
  _id: string;
  memberId: string;
  fullName: string;
  email: string;
  phone: string;
  membershipName: string;
  membershipDuration: string;
  membershipAmount: number;
  joinDate: string;
  expiryDate: string;
  paymentMethod: string;
  paymentStatus: string;
  membershipStatus: string;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const daysLeft = (expiry: string) => {
  const diff = new Date(expiry).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// ── Only show test button in development ──
const IS_DEV = process.env.NODE_ENV === 'development';

const ActiveMembers: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expiringId, setExpiringId] = useState<string | null>(null);
  const [confirmExpireId, setConfirmExpireId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/members/active')
      .then(r => setMembers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = members.filter(m =>
    m.fullName.toLowerCase().includes(search.toLowerCase()) ||
    m.phone.includes(search) ||
    m.memberId.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this member?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/members/${id}`);
      setMembers(prev => prev.filter(m => m._id !== id));
    } catch {}
    finally { setDeletingId(null); }
  };

  // ── Force expire (dev/testing only) ──
  const handleForceExpire = async (id: string) => {
    setExpiringId(id);
    setConfirmExpireId(null);
    try {
      await api.patch(`/members/${id}/force-expire`);
      setMembers(prev => prev.filter(m => m._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to force expire');
    } finally {
      setExpiringId(null);
    }
  };

  const totalRevenue = members.reduce((sum, m) => sum + m.membershipAmount, 0);

  const confirmMember = members.find(m => m._id === confirmExpireId);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />

      {/* ── Confirm popup ── */}
      {confirmExpireId && confirmMember && (
        <div style={s.confirmOverlay} onClick={() => setConfirmExpireId(null)}>
          <div style={s.confirmBox} onClick={e => e.stopPropagation()}>
            <div style={s.confirmIcon}>🧪</div>
            <h3 style={s.confirmTitle}>Force Expire — Testing Only</h3>
            <p style={s.confirmSub}>
              This will immediately move <strong style={{ color: '#f5a623' }}>{confirmMember.fullName}</strong> from
              Active → Expired so you can test renewal reminders and WhatsApp flows.
            </p>
            <div style={s.confirmBadge}>⚠️ Dev / Testing Feature — Hidden in Production</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button style={s.cancelBtn} onClick={() => setConfirmExpireId(null)}>Cancel</button>
              <button
                style={{ ...s.expireConfirmBtn, opacity: expiringId === confirmExpireId ? 0.7 : 1 }}
                disabled={expiringId === confirmExpireId}
                onClick={() => handleForceExpire(confirmExpireId)}
              >
                {expiringId === confirmExpireId ? 'Expiring...' : 'Yes, Force Expire'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <header style={s.header}>
          <div>
            <h1 style={s.headerTitle}>Active Members</h1>
            <p style={s.headerSub}>{members.length} active member{members.length !== 1 ? 's' : ''}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {IS_DEV && (
              <div style={s.devBadge}>🧪 Dev Mode — Force Expire visible</div>
            )}
            <ThemeToggle />
          </div>
        </header>

        <main style={s.main}>

          {/* Stats */}
          <div style={s.statRow}>
            {[
              { label: 'Total Active', value: members.length, color: '#00c9a7', icon: '✅' },
              { label: 'Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: '#f5a623', icon: '💰' },
              { label: 'Expiring ≤7 Days', value: members.filter(m => daysLeft(m.expiryDate) <= 7).length, color: '#e00000', icon: '⚠️' },
            ].map(st => (
              <div key={st.label} style={s.statCard}>
                <span style={{ fontSize: 24 }}>{st.icon}</span>
                <div>
                  <p style={{ ...s.statVal, color: st.color }}>{st.value}</p>
                  <p style={s.statLbl}>{st.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={s.searchWrap}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={s.searchIcon}>
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input style={s.searchInput} placeholder="Search by name, phone, or member ID..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Table */}
          {loading ? (
            <div style={s.centerMsg}><div style={s.spinner} /></div>
          ) : filtered.length === 0 ? (
            <div style={s.centerMsg}>
              <span style={{ fontSize: 48 }}>🏋️</span>
              <p style={s.emptyTxt}>{search ? 'No members match your search.' : 'No active members yet.'}</p>
            </div>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {[
                      'Member ID', 'Name', 'Phone', 'Plan', 'Duration',
                      'Amount', 'Join Date', 'Expiry', 'Payment', 'Status',
                      IS_DEV ? '🧪 Test' : '', ''
                    ].filter(Boolean).map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => {
                    const days = daysLeft(m.expiryDate);
                    const urgency = days <= 7;
                    return (
                      <tr key={m._id} style={s.tr}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

                        <td style={s.td}>
                          <span style={s.memberIdBadge}>{m.memberId}</span>
                        </td>

                        <td style={s.td}>
                          <div style={s.nameCell}>
                            <div style={s.avatar}>{m.fullName.charAt(0).toUpperCase()}</div>
                            <div>
                              <p style={s.nameTxt}>{m.fullName}</p>
                              <p style={s.emailTxt}>{m.email}</p>
                            </div>
                          </div>
                        </td>

                        <td style={s.td}><span style={s.phoneTxt}>{m.phone}</span></td>

                        <td style={s.td}><span style={s.planBadge}>{m.membershipName}</span></td>

                        <td style={s.td}><span style={s.durationTxt}>{m.membershipDuration}</span></td>

                        <td style={s.td}><span style={s.amtTxt}>₹{m.membershipAmount.toLocaleString('en-IN')}</span></td>

                        <td style={s.td}><span style={s.dateTxt}>{fmtDate(m.joinDate)}</span></td>

                        <td style={s.td}>
                          <div>
                            <span style={{ ...s.dateTxt, color: urgency ? '#f5a623' : 'var(--text-primary)' }}>
                              {fmtDate(m.expiryDate)}
                            </span>
                            <p style={{ ...s.daysLeft, color: urgency ? '#f5a623' : 'var(--text-muted)' }}>
                              {days === 0 ? 'Expires today' : `${days}d left`}
                            </p>
                          </div>
                        </td>

                        <td style={s.td}>
                          <span style={{
                            ...s.payBadge,
                            background: m.paymentStatus === 'Paid' ? 'rgba(0,201,167,0.12)' : 'rgba(245,166,35,0.12)',
                            color: m.paymentStatus === 'Paid' ? '#00c9a7' : '#f5a623',
                          }}>
                            {m.paymentMethod} · {m.paymentStatus}
                          </span>
                        </td>

                        <td style={s.td}>
                          <span style={s.activeBadge}>● Active</span>
                        </td>

                        {/* ── DEV ONLY: Force Expire button ── */}
                        {IS_DEV && (
                          <td style={s.td}>
                            <button
                              style={{
                                ...s.testBtn,
                                opacity: expiringId === m._id ? 0.6 : 1,
                              }}
                              disabled={expiringId === m._id}
                              title="Force expire this member for testing"
                              onClick={() => setConfirmExpireId(m._id)}
                            >
                              {expiringId === m._id ? (
                                <div style={s.btnSpinner} />
                              ) : (
                                <>⏱ Expire</>
                              )}
                            </button>
                          </td>
                        )}

                        <td style={s.td}>
                          <button style={s.delBtn} disabled={deletingId === m._id}
                            onClick={() => handleDelete(m._id)}>
                            {deletingId === m._id ? '...' : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            )}
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  header: {
    height: 72, borderBottom: '1px solid var(--border-color)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 36px', background: 'var(--bg-secondary)', flexShrink: 0,
  },
  headerTitle: { fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
  headerSub: { fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' },
  main: { flex: 1, padding: '28px 32px', overflowY: 'auto' },
  devBadge: {
    fontSize: 11, fontWeight: 700, padding: '5px 12px',
    background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)',
    borderRadius: 20, color: '#f5a623',
  },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 },
  statCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 14, padding: '18px 20px',
    display: 'flex', alignItems: 'center', gap: 14,
  },
  statVal: { fontSize: 22, fontWeight: 800, margin: 0 },
  statLbl: { fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' },
  searchWrap: { position: 'relative', marginBottom: 20 },
  searchIcon: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' },
  searchInput: {
    width: '100%', padding: '12px 14px 12px 42px',
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 10, color: 'var(--text-primary)', fontSize: 13, outline: 'none',
  },
  tableWrap: { overflowX: 'auto', borderRadius: 14, border: '1px solid var(--border-color)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700,
    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5,
    background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)',
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

  // Test button
  testBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(245,166,35,0.4)',
    background: 'rgba(245,166,35,0.08)', color: '#f5a623',
    fontSize: 11, fontWeight: 700, cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  btnSpinner: {
    width: 12, height: 12,
    border: '2px solid rgba(245,166,35,0.3)',
    borderTop: '2px solid #f5a623',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },

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

  // Confirm popup
  confirmOverlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  confirmBox: {
    background: 'var(--bg-secondary)',
    border: '1px solid rgba(245,166,35,0.3)',
    borderRadius: 20, padding: '32px 36px',
    maxWidth: 440, width: '100%', margin: '0 20px',
    boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
    textAlign: 'center',
  },
  confirmIcon: { fontSize: 48, marginBottom: 12 },
  confirmTitle: { fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px' },
  confirmSub: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 14px' },
  confirmBadge: {
    display: 'inline-block', fontSize: 11, fontWeight: 700,
    padding: '6px 14px', borderRadius: 20,
    background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)',
    color: '#f5a623',
  },
  cancelBtn: {
    flex: 1, padding: '12px',
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 12, color: 'var(--text-secondary)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  expireConfirmBtn: {
    flex: 1, padding: '12px',
    background: 'linear-gradient(135deg, #f5a623, #e08c00)',
    border: 'none', borderRadius: 12,
    color: '#000', fontSize: 13, fontWeight: 700,
    cursor: 'pointer',
  },
};

export default ActiveMembers;