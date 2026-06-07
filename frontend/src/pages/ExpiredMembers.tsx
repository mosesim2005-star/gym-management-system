import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import api from '../api/axios';
import { st } from '../styles/ExpiredMembers.styles';

interface ExpiredMember {
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

type FilterType = 'all' | 'today' | '7days' | '30days' | 'older';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const daysSinceExpiry = (expiry: string): number => {
  const diff = Date.now() - new Date(expiry).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

const urgencyColor = (days: number): string => {
  if (days === 0) return '#f5a623';
  if (days <= 30) return '#f5a623';
  return '#e00000';
};

const urgencyLabel = (days: number): string => {
  if (days === 0) return 'Expired Today';
  if (days === 1) return 'Expired 1 Day Ago';
  return `Expired ${days} Days Ago`;
};

const WHATSAPP_MESSAGE = (name: string, plan: string, expiry: string, gymName = 'Lifetime Fitness') =>
  `Hello ${name},\n\nYour *${plan}* membership expired on *${fmtDate(expiry)}*.\n\nWe would love to have you back at *${gymName}*. Renew your membership today and continue your fitness journey! 💪\n\nContact us for renewal assistance.\n\nThank You,\n${gymName}`;

interface Toast { id: number; msg: string; type: 'success' | 'error'; }

const ExpiredMembers: React.FC = () => {
  const [members, setMembers]       = useState<ExpiredMember[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState<FilterType>('all');
  const [toasts, setToasts]         = useState<Toast[]>([]);
  const [emailingId, setEmailingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{
    total: number; emailsSent: number; whatsappPrepared: number; failed: number;
  } | null>(null);

  const addToast = (msg: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    api.get('/members/expired')
      .then(r => setMembers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = members.filter(m => daysSinceExpiry(m.expiryDate) === 0).length;
  const last7  = members.filter(m => daysSinceExpiry(m.expiryDate) <= 7).length;
  const last30 = members.filter(m => daysSinceExpiry(m.expiryDate) <= 30).length;

  const filtered = members.filter(m => {
    const days = daysSinceExpiry(m.expiryDate);
    const matchFilter =
      filter === 'all' ? true : filter === 'today' ? days === 0 : filter === '7days' ? days <= 7 :
      filter === '30days' ? days <= 30 : filter === 'older' ? days > 30 : true;
    const q = search.toLowerCase();
    const matchSearch =
      m.fullName.toLowerCase().includes(q) || m.phone.includes(q) ||
      m.email.toLowerCase().includes(q) || m.membershipName.toLowerCase().includes(q) ||
      m.memberId.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const handleEmail = async (member: ExpiredMember) => {
    setEmailingId(member._id);
    try {
      await api.post(`/members/${member._id}/send-renewal-email`);
      addToast(`Renewal reminder email sent to ${member.fullName} ✅`);
    } catch {
      addToast(`Failed to send email to ${member.fullName}`, 'error');
    } finally { setEmailingId(null); }
  };

  const handleWhatsApp = (member: ExpiredMember) => {
    const msg = encodeURIComponent(WHATSAPP_MESSAGE(member.fullName, member.membershipName, member.expiryDate));
    const phone = member.phone.replace(/\D/g, '');
    const intlPhone = phone.startsWith('91') ? phone : `91${phone}`;
    window.open(`https://wa.me/${intlPhone}?text=${msg}`, '_blank');
    addToast(`WhatsApp message prepared for ${member.fullName} 📱`);
  };

  const handleBulkReminder = async () => {
    if (!window.confirm(`Send renewal reminders to all ${filtered.length} expired members?`)) return;
    setBulkLoading(true); setBulkResult(null);
    let emailsSent = 0, failed = 0;
    for (const m of filtered) {
      try { await api.post(`/members/${m._id}/send-renewal-email`); emailsSent++; }
      catch { failed++; }
    }
    const whatsappPrepared = filtered.filter(m => m.phone).length;
    setBulkResult({ total: filtered.length, emailsSent, whatsappPrepared, failed });
    setBulkLoading(false);
    addToast(`Bulk reminders sent: ${emailsSent} emails, ${whatsappPrepared} WhatsApp prepared`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />

      <div style={st.toastContainer}>
        {toasts.map(t => (
          <div key={t.id} style={{ ...st.toast, background: t.type === 'success' ? 'rgba(0,201,167,0.95)' : 'rgba(220,0,0,0.95)' }}>
            {t.type === 'success' ? '✅' : '❌'} {t.msg}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <header style={st.header}>
          <div>
            <h1 style={st.headerTitle}>Expired Members</h1>
            <p style={st.headerSub}>{members.length} expired membership{members.length !== 1 ? 's' : ''}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{ ...st.bulkBtn, opacity: bulkLoading ? 0.7 : 1 }}
              disabled={bulkLoading || filtered.length === 0} onClick={handleBulkReminder}>
              {bulkLoading ? (<><div style={st.btnSpinner} /> Sending...</>) : (<>📣 Send Reminder to All ({filtered.length})</>)}
            </button>
            <ThemeToggle />
          </div>
        </header>

        <main style={st.main}>

          <div style={st.statRow}>
            {[
              { label: 'Total Expired', value: members.length, color: '#e00000', icon: '⏰' },
              { label: 'Expired Today', value: today,          color: '#f5a623', icon: '📅' },
              { label: 'Last 7 Days',  value: last7,           color: '#f5a623', icon: '📊' },
              { label: 'Last 30 Days', value: last30,          color: '#845ef7', icon: '📈' },
            ].map(s => (
              <div key={s.label} style={st.statCard}>
                <span style={{ fontSize: 24 }}>{s.icon}</span>
                <div>
                  <p style={{ ...st.statVal, color: s.color }}>{s.value}</p>
                  <p style={st.statLbl}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {bulkResult && (
            <div style={st.bulkResult}>
              <p style={st.bulkResultTitle}>📊 Bulk Reminder Report</p>
              <div style={st.bulkResultGrid}>
                <div style={st.bulkResultItem}><span style={st.bulkResultVal}>{bulkResult.total}</span><span style={st.bulkResultLbl}>Members Processed</span></div>
                <div style={st.bulkResultItem}><span style={{ ...st.bulkResultVal, color: '#00c9a7' }}>{bulkResult.emailsSent}</span><span style={st.bulkResultLbl}>Emails Sent</span></div>
                <div style={st.bulkResultItem}><span style={{ ...st.bulkResultVal, color: '#845ef7' }}>{bulkResult.whatsappPrepared}</span><span style={st.bulkResultLbl}>WhatsApp Ready</span></div>
                <div style={st.bulkResultItem}><span style={{ ...st.bulkResultVal, color: '#e00000' }}>{bulkResult.failed}</span><span style={st.bulkResultLbl}>Failed</span></div>
              </div>
              <button style={st.dismissBtn} onClick={() => setBulkResult(null)}>Dismiss</button>
            </div>
          )}

          <div style={st.searchFilterRow}>
            <div style={st.searchWrap}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={st.searchIcon}>
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input style={st.searchInput} placeholder="Search by name, phone, email, plan or member ID..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={st.filterRow}>
              {([
                { key: 'all', label: 'All' }, { key: 'today', label: 'Today' },
                { key: '7days', label: 'Last 7 Days' }, { key: '30days', label: 'Last 30 Days' },
                { key: 'older', label: '30+ Days' },
              ] as { key: FilterType; label: string }[]).map(f => (
                <button key={f.key} style={{ ...st.filterBtn, ...(filter === f.key ? st.filterBtnActive : {}) }}
                  onClick={() => setFilter(f.key)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={st.centerMsg}><div style={st.spinner} /></div>
          ) : filtered.length === 0 ? (
            <div style={st.centerMsg}>
              <span style={{ fontSize: 48 }}>🎉</span>
              <p style={st.emptyTxt}>{search || filter !== 'all' ? 'No members match your search or filter.' : 'No expired members — great retention!'}</p>
            </div>
          ) : (
            <div style={st.tableWrap}>
              <table style={st.table}>
                <thead>
                  <tr>
                    {['Member ID', 'Name', 'Phone', 'Plan', 'Duration', 'Amount', 'Join Date', 'Expiry Date', 'Days Since Expired', 'Status', 'Actions'].map(h => (
                      <th key={h} style={st.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(m => {
                    const days  = daysSinceExpiry(m.expiryDate);
                    const color = urgencyColor(days);
                    return (
                      <tr key={m._id} style={st.tr}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={st.td}><span style={st.memberIdBadge}>{m.memberId}</span></td>
                        <td style={st.td}>
                          <div style={st.nameCell}>
                            <div style={{ ...st.avatar, background: 'linear-gradient(135deg, #555, #333)' }}>
                              {m.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={st.nameTxt}>{m.fullName}</p>
                              <p style={st.emailTxt}>{m.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={st.td}><span style={st.phoneTxt}>{m.phone}</span></td>
                        <td style={st.td}><span style={st.planBadge}>{m.membershipName}</span></td>
                        <td style={st.td}><span style={st.durationTxt}>{m.membershipDuration}</span></td>
                        <td style={st.td}><span style={st.amtTxt}>₹{m.membershipAmount.toLocaleString('en-IN')}</span></td>
                        <td style={st.td}><span style={st.dateTxt}>{fmtDate(m.joinDate)}</span></td>
                        <td style={st.td}><span style={{ ...st.dateTxt, color }}>{fmtDate(m.expiryDate)}</span></td>
                        <td style={st.td}>
                          <span style={{ ...st.daysBadge, background: days === 0 ? 'rgba(245,166,35,0.12)' : days <= 30 ? 'rgba(245,166,35,0.10)' : 'rgba(220,0,0,0.12)', color }}>
                            {urgencyLabel(days)}
                          </span>
                        </td>
                        <td style={st.td}><span style={st.expiredBadge}>● Expired</span></td>
                        <td style={st.td}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button style={st.emailBtn} title="Send Renewal Reminder Email"
                              disabled={emailingId === m._id} onClick={() => handleEmail(m)}>
                              {emailingId === m._id ? <div style={st.btnSpinnerSm} /> : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                                  <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                              )}
                            </button>
                            <button style={st.waBtn} title="Send WhatsApp Reminder" onClick={() => handleWhatsApp(m)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                            </button>
                          </div>
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

export default ExpiredMembers;