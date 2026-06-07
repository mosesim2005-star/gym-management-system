import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import api from '../api/axios';
import { s, md } from '../styles/TotalMembers.styles';

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
  membershipStatus: 'Active' | 'Expired';
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type StatusFilter = 'all' | 'Active' | 'Expired';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const PAGE_SIZE_OPTIONS = [30, 50, 100];

interface MemberModalProps {
  member: Member;
  mode: 'view' | 'edit';
  onClose: () => void;
  onSaved: (updated: Member) => void;
}

const MemberModal: React.FC<MemberModalProps> = ({ member, mode, onClose, onSaved }) => {
  const [editing, setEditing]   = useState(mode === 'edit');
  const [fullName, setFullName] = useState(member.fullName);
  const [email, setEmail]       = useState(member.email);
  const [phone, setPhone]       = useState(member.phone);
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState('');

  const handleSave = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim()) { setErr('All fields are required'); return; }
    setSaving(true);
    try {
      const res = await api.patch(`/members/${member._id}/info`, { fullName, email, phone });
      onSaved(res.data); onClose();
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const isExpired = member.membershipStatus === 'Expired';

  return (
    <div style={md.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={md.box}>
        <div style={{ ...md.head, borderBottom: `3px solid ${isExpired ? '#e00000' : '#00c9a7'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ ...md.avatar, background: isExpired ? 'linear-gradient(135deg, #e00000, #900)' : 'linear-gradient(135deg, #00c9a7, #009977)' }}>
              {member.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={md.title}>{editing ? 'Edit Member' : 'Member Details'}</h2>
              <span style={{ ...md.statusBadge, background: isExpired ? 'rgba(220,0,0,0.12)' : 'rgba(0,201,167,0.12)', color: isExpired ? '#e00000' : '#00c9a7' }}>
                ● {member.membershipStatus}
              </span>
            </div>
          </div>
          <button style={md.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={md.body}>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={md.field}><label style={md.label}>Full Name</label><input style={md.input} value={fullName} onChange={e => setFullName(e.target.value)} /></div>
              <div style={md.field}><label style={md.label}>Email</label><input style={md.input} value={email} type="email" onChange={e => setEmail(e.target.value)} /></div>
              <div style={md.field}><label style={md.label}>Phone</label><input style={md.input} value={phone} maxLength={10} onChange={e => setPhone(e.target.value.replace(/\D/, ''))} /></div>
              {err && <p style={{ color: '#ff4444', fontSize: 12 }}>{err}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={md.cancelBtn} onClick={onClose}>Cancel</button>
                <button style={{ ...md.saveBtn, opacity: saving ? 0.7 : 1 }} disabled={saving} onClick={handleSave}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div style={md.grid}>
              {[
                { label: 'Member ID', value: member.memberId }, { label: 'Full Name', value: member.fullName },
                { label: 'Email', value: member.email },        { label: 'Phone', value: member.phone },
                { label: 'Plan', value: member.membershipName }, { label: 'Duration', value: member.membershipDuration },
                { label: 'Amount Paid', value: `₹${member.membershipAmount.toLocaleString('en-IN')}` },
                { label: 'Payment', value: `${member.paymentMethod} · ${member.paymentStatus}` },
                { label: 'Join Date', value: fmtDate(member.joinDate) }, { label: 'Expiry Date', value: fmtDate(member.expiryDate) },
                { label: 'Status', value: member.membershipStatus },
              ].map(row => (
                <div key={row.label} style={md.detailRow}>
                  <span style={md.detailLbl}>{row.label}</span>
                  <span style={{ ...md.detailVal, color: row.label === 'Status' ? (isExpired ? '#e00000' : '#00c9a7') : 'var(--text-primary)', fontWeight: row.label === 'Status' ? 700 : 600 }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {!editing && (
          <div style={md.footer}>
            <button style={md.editBtn} onClick={() => setEditing(true)}>✏️ Edit Member</button>
          </div>
        )}
      </div>
    </div>
  );
};

const TotalMembers: React.FC = () => {
  const [members, setMembers]         = useState<Member[]>([]);
  const [pagination, setPagination]   = useState<Pagination>({ total: 0, page: 1, limit: 30, totalPages: 1 });
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [status, setStatus]           = useState<StatusFilter>('all');
  const [pageSize, setPageSize]       = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalMember, setModalMember] = useState<Member | null>(null);
  const [modalMode, setModalMode]     = useState<'view' | 'edit'>('view');
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const searchTimer                   = useRef<NodeJS.Timeout | null>(null);

  const fetchMembers = useCallback(async (page: number, q: string, st: StatusFilter, limit: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit), status: st, search: q });
      const res = await api.get(`/members/paginated?${params}`);
      setMembers(res.data.members);
      setPagination(res.data.pagination);
    } catch { setMembers([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchMembers(currentPage, search, status, pageSize);
    }, 350);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [currentPage, search, status, pageSize, fetchMembers]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this member permanently?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/members/${id}`);
      setMembers(prev => prev.filter(m => m._id !== id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    } catch {}
    finally { setDeletingId(null); }
  };

  const handleMemberSaved = (updated: Member) => {
    setMembers(prev => prev.map(m => m._id === updated._id ? updated : m));
  };

  const pageNumbers = (): (number | '...')[] => {
    const { totalPages, page } = pagination;
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      {modalMember && (
        <MemberModal member={modalMember} mode={modalMode}
          onClose={() => setModalMember(null)} onSaved={handleMemberSaved} />
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <header style={s.header}>
          <div>
            <h1 style={s.headerTitle}>Total Members</h1>
            <p style={s.headerSub}>{pagination.total} member{pagination.total !== 1 ? 's' : ''} · Active + Expired</p>
          </div>
          <ThemeToggle />
        </header>

        <main style={s.main}>
          <div style={s.statRow}>
            {[
              { label: 'Total Members', value: pagination.total,                             color: '#845ef7', icon: '👥' },
              { label: 'Active',        value: status === 'Active'  ? pagination.total : '—', color: '#00c9a7', icon: '✅' },
              { label: 'Expired',       value: status === 'Expired' ? pagination.total : '—', color: '#e00000', icon: '⏰' },
              { label: 'This Page',     value: members.length,                               color: '#f5a623', icon: '📄' },
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

          <div style={s.toolbarRow}>
            <div style={s.searchWrap}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={s.searchIcon}>
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input style={s.searchInput} placeholder="Search name, phone, email, member ID, plan..."
                value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
              {search && <button style={s.clearBtn} onClick={() => { setSearch(''); setCurrentPage(1); }}>✕</button>}
            </div>
            <div style={s.filterGroup}>
              {(['all', 'Active', 'Expired'] as StatusFilter[]).map(f => (
                <button key={f} style={{
                  ...s.filterBtn,
                  ...(status === f ? s.filterBtnActive : {}),
                  ...(status === f && f === 'Active'  ? { borderColor: '#00c9a7', color: '#00c9a7', background: 'rgba(0,201,167,0.08)'  } : {}),
                  ...(status === f && f === 'Expired' ? { borderColor: '#e00000', color: '#e00000', background: 'rgba(220,0,0,0.08)'    } : {}),
                }} onClick={() => { setStatus(f); setCurrentPage(1); }}>
                  {f === 'all' ? 'All Members' : f}
                </button>
              ))}
            </div>
            <div style={s.pageSizeWrap}>
              <span style={s.pageSizeLbl}>Per page:</span>
              <select style={s.pageSizeSelect} value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
                {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={s.centerMsg}><div style={s.spinner} /><p style={s.loadTxt}>Loading members...</p></div>
          ) : members.length === 0 ? (
            <div style={s.centerMsg}><span style={{ fontSize: 52 }}>🔍</span><p style={s.emptyTxt}>No members found for your search or filter.</p></div>
          ) : (
            <>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['#', 'Member ID', 'Name', 'Phone', 'Email', 'Plan', 'Duration', 'Amount', 'Join Date', 'Expiry', 'Status', 'Actions'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m, idx) => {
                      const isExpired = m.membershipStatus === 'Expired';
                      const rowNum    = (pagination.page - 1) * pagination.limit + idx + 1;
                      return (
                        <tr key={m._id} style={{ ...s.tr, ...(isExpired ? s.trExpired : {}) }}
                          onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = isExpired ? 'rgba(220,0,0,0.05)' : 'var(--bg-hover)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = isExpired ? 'rgba(220,0,0,0.02)' : 'transparent'; }}>
                          <td style={{ ...s.td, color: 'var(--text-muted)', fontSize: 11 }}>{rowNum}</td>
                          <td style={s.td}>
                            <span style={{ ...s.memberIdBadge, background: isExpired ? 'rgba(220,0,0,0.1)' : 'rgba(132,94,247,0.1)', color: isExpired ? '#e00000' : '#845ef7' }}>
                              {m.memberId}
                            </span>
                          </td>
                          <td style={s.td}>
                            <div style={s.nameCell}>
                              <div style={{ ...s.avatar, background: isExpired ? 'linear-gradient(135deg, #c00, #800)' : 'linear-gradient(135deg, #ff2b2b, #d40000)' }}>
                                {m.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p style={{ ...s.nameTxt, color: isExpired ? '#e00000' : 'var(--text-primary)' }}>{m.fullName}</p>
                                <p style={s.subTxt}>{m.email}</p>
                              </div>
                            </div>
                          </td>
                          <td style={s.td}><span style={{ ...s.cellTxt, color: isExpired ? '#e00000' : 'var(--text-secondary)' }}>{m.phone}</span></td>
                          <td style={s.td}><span style={{ fontSize: 11, color: isExpired ? 'rgba(220,0,0,0.7)' : 'var(--text-secondary)' }}>{m.email}</span></td>
                          <td style={s.td}><span style={{ ...s.planBadge, background: isExpired ? 'rgba(220,0,0,0.08)' : 'rgba(132,94,247,0.1)', color: isExpired ? '#e00000' : '#845ef7' }}>{m.membershipName}</span></td>
                          <td style={s.td}><span style={{ fontSize: 11, color: isExpired ? 'rgba(220,0,0,0.7)' : 'var(--text-secondary)' }}>{m.membershipDuration}</span></td>
                          <td style={s.td}><span style={{ fontSize: 13, fontWeight: 700, color: isExpired ? '#e00000' : '#00c9a7' }}>₹{m.membershipAmount.toLocaleString('en-IN')}</span></td>
                          <td style={s.td}><span style={{ fontSize: 11, color: isExpired ? 'rgba(220,0,0,0.7)' : 'var(--text-secondary)' }}>{fmtDate(m.joinDate)}</span></td>
                          <td style={s.td}><span style={{ fontSize: 11, fontWeight: isExpired ? 700 : 400, color: isExpired ? '#e00000' : 'var(--text-primary)' }}>{fmtDate(m.expiryDate)}</span></td>
                          <td style={s.td}><span style={{ ...s.statusBadge, background: isExpired ? 'rgba(220,0,0,0.12)' : 'rgba(0,201,167,0.12)', color: isExpired ? '#e00000' : '#00c9a7' }}>● {m.membershipStatus}</span></td>
                          <td style={s.td}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button style={s.viewBtn} title="View Details" onClick={() => { setModalMember(m); setModalMode('view'); }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
                                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                </svg>
                              </button>
                              <button style={s.editBtn} title="Edit Member" onClick={() => { setModalMember(m); setModalMode('edit'); }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                              </button>
                              <button style={s.delBtn} title="Delete Member" disabled={deletingId === m._id} onClick={() => handleDelete(m._id)}>
                                {deletingId === m._id ? '...' : (
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={s.paginationRow}>
                <span style={s.paginationInfo}>
                  Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} members
                </span>
                <div style={s.pageButtons}>
                  <button style={{ ...s.pageBtn, opacity: currentPage === 1 ? 0.4 : 1 }} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>← Prev</button>
                  {pageNumbers().map((pg, i) =>
                    pg === '...' ? (
                      <span key={`dots-${i}`} style={s.pageDots}>…</span>
                    ) : (
                      <button key={pg} style={{ ...s.pageBtn, ...(pg === currentPage ? s.pageBtnActive : {}) }} onClick={() => setCurrentPage(pg as number)}>{pg}</button>
                    )
                  )}
                  <button style={{ ...s.pageBtn, opacity: currentPage === pagination.totalPages ? 0.4 : 1 }} disabled={currentPage === pagination.totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next →</button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default TotalMembers;