import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import api from '../api/axios';
import { sk, st } from '../styles/Dashboard.styles';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

// ── Types ──────────────────────────────────────────────────
interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  renewalsDue: number;
  totalRevenue: number;
  monthlyRevenue: number;
  lastMonthRevenue: number;
  thisMonthMembers: number;
  lastMonthMembers: number;
}

interface GrowthPoint  { month: string; members: number; }
interface RevenuePoint { month: string; revenue: number; }
interface PlanItem     { name: string; subscribers: number; revenue: number; }
interface PaymentItem  { method: string; count: number; amount: number; }

interface RecentMember {
  _id: string;
  memberId: string;
  fullName: string;
  membershipName: string;
  joinDate: string;
  membershipStatus: 'Active' | 'Expired';
  membershipAmount: number;
  paymentMethod: string;
}

interface ExpiredMemberDash {
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
}

interface DashboardData {
  stats: DashboardStats;
  growthData: GrowthPoint[];
  revenueData: RevenuePoint[];
  paymentBreakdown: PaymentItem[];
  topPlans: PlanItem[];
  recentMembers: RecentMember[];
}

// ── Helpers ────────────────────────────────────────────────
const fmtINR = (n: number) =>
  '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const daysSinceExpiry = (expiry: string) => {
  const diff = Date.now() - new Date(expiry).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

const pctChange = (current: number, previous: number): string => {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const pct = ((current - previous) / previous) * 100;
  return (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
};

const PIE_COLORS = ['#00c9a7', '#f5a623', '#e00000', '#845ef7'];

const PLAN_COLORS: Record<string, string> = {
  'Gold Plan':        '#f5a623',
  'Diwali Offer':     '#ff6b35',
  'New Year Special': '#00c9a7',
  'Student Offer':    '#845ef7',
  'Festival Offer':   '#f03e3e',
  "Women's Special":  '#e64980',
  'Package Plan':     '#e00000',
};

// ── Custom tooltip ─────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, prefix = '' }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
      borderRadius: 10, padding: '10px 14px', fontSize: 12,
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    }}>
      <p style={{ color: 'var(--text-muted)', margin: '0 0 6px', fontWeight: 600 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, margin: '3px 0', fontWeight: 700 }}>
          {prefix}{typeof p.value === 'number' && prefix === '₹'
            ? p.value.toLocaleString('en-IN') : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Main component ─────────────────────────────────────────
const Dashboard: React.FC = () => {
  const [data, setData]               = useState<DashboardData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const [expiredMembers, setExpiredMembers] = useState<ExpiredMemberDash[]>([]);
  const [expiredLoading, setExpiredLoading] = useState(true);
  const [expiredSearch, setExpiredSearch]   = useState('');
  const [emailingId, setEmailingId]         = useState<string | null>(null);
  const [toasts, setToasts]                 = useState<{ id: number; msg: string; type: 'success' | 'error' }[]>([]);

  const addToast = (msg: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setData(res.data);
      setLastRefresh(new Date());
      setError('');
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchExpired = useCallback(async () => {
    try {
      setExpiredLoading(true);
      const res = await api.get('/members/expired');
      setExpiredMembers(res.data);
    } catch {
      // silent fail
    } finally {
      setExpiredLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchExpired();
    const interval = setInterval(() => { fetchData(); fetchExpired(); }, 60_000);
    return () => clearInterval(interval);
  }, [fetchData, fetchExpired]);

  const handleEmail = async (member: ExpiredMemberDash) => {
    setEmailingId(member._id);
    try {
      await api.post(`/members/${member._id}/send-renewal-email`);
      addToast(`Renewal reminder sent to ${member.fullName} ✅`);
    } catch {
      addToast(`Failed to send email to ${member.fullName}`, 'error');
    } finally {
      setEmailingId(null);
    }
  };

  const handleWhatsApp = (member: ExpiredMemberDash) => {
    const gymName = 'Lifetime Fitness';
    const msg = encodeURIComponent(
      `Hello ${member.fullName},\n\nYour *${member.membershipName}* membership expired on *${fmtDate(member.expiryDate)}*.\n\nWe would love to have you back at *${gymName}*. Renew today! 💪\n\nThank You,\n${gymName}`
    );
    const phone = member.phone.replace(/\D/g, '');
    const intlPhone = phone.startsWith('91') ? phone : `91${phone}`;
    window.open(`https://wa.me/${intlPhone}?text=${msg}`, '_blank');
    addToast(`WhatsApp prepared for ${member.fullName} 📱`);
  };

  const filteredExpired = expiredMembers.filter(m => {
    const q = expiredSearch.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      m.memberId.toLowerCase().includes(q) ||
      m.membershipName.toLowerCase().includes(q)
    );
  }).slice(0, 8);

  // ── Loading state ──
  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={sk.spinner} />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading dashboard...</p>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>⚠️</p>
            <p style={{ color: '#e00000', fontSize: 14, marginBottom: 16 }}>{error}</p>
            <button style={st.retryBtn} onClick={fetchData}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const {
    stats, growthData, revenueData,
    paymentBreakdown, topPlans, recentMembers,
  } = data;

  const maxPlanSubs   = Math.max(...topPlans.map(p => p.subscribers), 1);
  const revenueChange = pctChange(stats.monthlyRevenue, stats.lastMonthRevenue);
  const membersChange = pctChange(stats.thisMonthMembers, stats.lastMonthMembers);
  const isRevenueUp   = !revenueChange.startsWith('-');
  const isMembersUp   = !membersChange.startsWith('-');

  const statCards = [
    { label: 'Total Members',      value: stats.totalMembers.toLocaleString('en-IN'),  sub: `${membersChange} from last month`,  up: isMembersUp,             icon: '👥', color: '#845ef7', bg: 'rgba(132,94,247,0.12)', link: '/total-members'      },
    { label: 'Active Memberships', value: stats.activeMembers.toLocaleString('en-IN'), sub: `${stats.expiredMembers} expired`,   up: true,                    icon: '✅', color: '#00c9a7', bg: 'rgba(0,201,167,0.12)',  link: '/active-members'     },
    { label: 'Monthly Revenue',    value: fmtINR(stats.monthlyRevenue),               sub: `${revenueChange} from last month`,  up: isRevenueUp,             icon: '💰', color: '#f5a623', bg: 'rgba(245,166,35,0.12)', link: '/membership-revenue' },
    { label: 'Renewals Due',       value: stats.renewalsDue.toLocaleString('en-IN'),   sub: 'expiring within 7 days',            up: stats.renewalsDue === 0, icon: '🔄', color: '#e00000', bg: 'rgba(220,0,0,0.12)',   link: '/expired-members'    },
    { label: 'Total Revenue',      value: fmtINR(stats.totalRevenue),                 sub: 'all time',                          up: true,                    icon: '📈', color: '#4d94ff', bg: 'rgba(77,148,255,0.12)', link: '/membership-revenue' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />

      {/* ── Toast notifications ── */}
      <div style={st.toastContainer}>
        {toasts.map(t => (
          <div key={t.id} style={{
            ...st.toast,
            background: t.type === 'success' ? 'rgba(0,201,167,0.95)' : 'rgba(220,0,0,0.95)',
          }}>
            {t.type === 'success' ? '✅' : '❌'} {t.msg}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ════ HEADER ════ */}
        <header style={st.header}>
          <div>
            <h1 style={st.headerTitle}>Dashboard</h1>
            <p style={st.headerSub}>
              Welcome back, Admin &nbsp;·&nbsp;
              <span style={{ color: 'var(--text-muted)' }}>
                Last updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={st.refreshBtn} onClick={() => { fetchData(); fetchExpired(); }} title="Refresh">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
              Refresh
            </button>
            <ThemeToggle />
          </div>
        </header>

        <main style={st.main}>

          {/* ════ ROW 1: STAT CARDS ════ */}
          <div style={st.statRow}>
            {statCards.map(card => (
              <a key={card.label} href={card.link} style={{ textDecoration: 'none' }}>
                <div
                  style={st.statCard}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform   = 'translateY(-3px)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = card.color + '55';
                    (e.currentTarget as HTMLDivElement).style.boxShadow   = `0 12px 32px rgba(0,0,0,0.25), 0 0 0 1px ${card.color}33`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform   = 'translateY(0)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-color)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow   = '0 2px 12px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ ...st.statIcon, background: card.bg }}>
                      <span style={{ fontSize: 20 }}>{card.icon}</span>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                      background: card.up ? 'rgba(0,201,167,0.12)' : 'rgba(220,0,0,0.12)',
                      color: card.up ? '#00c9a7' : '#e00000',
                    }}>
                      {card.up ? '▲' : '▼'} {card.sub}
                    </span>
                  </div>
                  <p style={{ ...st.statValue, color: card.color }}>{card.value}</p>
                  <p style={st.statLabel}>{card.label}</p>
                </div>
              </a>
            ))}
          </div>

          {/* ════ ROW 2: GROWTH CHART + TOP PLANS ════ */}
          <div style={st.row2}>

            <div style={st.chartCard}>
              <div style={st.cardHeader}>
                <div>
                  <h2 style={st.cardTitle}>Membership Growth</h2>
                  <p style={st.cardSub}>New registrations per month</p>
                </div>
                <div style={{ ...st.pill, background: 'rgba(132,94,247,0.12)', color: '#845ef7' }}>
                  Last 7 Months
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={growthData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip prefix="" />} />
                  <Line type="monotone" dataKey="members" stroke="#845ef7" strokeWidth={2.5}
                    dot={{ fill: '#845ef7', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#845ef7', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={st.plansCard}>
              <div style={st.cardHeader}>
                <div>
                  <h2 style={st.cardTitle}>Top Plans</h2>
                  <p style={st.cardSub}>By subscribers</p>
                </div>
              </div>
              {topPlans.length === 0 ? (
                <div style={st.emptyInner}>
                  <span style={{ fontSize: 36 }}>🏷️</span>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>No plans yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {topPlans.map((plan, i) => {
                    const color = PLAN_COLORS[plan.name] || '#845ef7';
                    const pct   = Math.round((plan.subscribers / maxPlanSubs) * 100);
                    return (
                      <div key={plan.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', width: 16 }}>{i + 1}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{plan.name}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color }}>{plan.subscribers}</span>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>members</span>
                          </div>
                        </div>
                        <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 3, transition: 'width 0.6s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ════ ROW 3: PAYMENT DONUT + REVENUE BAR ════ */}
          <div style={st.row3}>

            <div style={st.donutCard}>
              <div style={st.cardHeader}>
                <div>
                  <h2 style={st.cardTitle}>Payment Methods</h2>
                  <p style={st.cardSub}>By transaction count</p>
                </div>
              </div>
              {paymentBreakdown.length === 0 ? (
                <div style={st.emptyInner}><span style={{ fontSize: 36 }}>💳</span></div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={paymentBreakdown} dataKey="count" nameKey="method"
                        cx="50%" cy="50%" innerRadius={52} outerRadius={76} paddingAngle={3} strokeWidth={0}>
                        {paymentBreakdown.map((_, idx) => (
                          <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [String(value) + ' txns']}
                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                    {paymentBreakdown.map((p, idx) => (
                      <div key={p.method} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[idx % PIE_COLORS.length], flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.method}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{p.count}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>({fmtINR(p.amount)})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div style={st.revenueCard}>
              <div style={st.cardHeader}>
                <div>
                  <h2 style={st.cardTitle}>Revenue Overview</h2>
                  <p style={st.cardSub}>Monthly collection (last 7 months)</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: '#f5a623', margin: 0 }}>{fmtINR(stats.monthlyRevenue)}</p>
                  <p style={{ fontSize: 11, margin: '2px 0 0', fontWeight: 600, color: isRevenueUp ? '#00c9a7' : '#e00000' }}>
                    {revenueChange} vs last month
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                  <Tooltip content={<ChartTooltip prefix="₹" />} />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {revenueData.map((_, idx) => (
                      <Cell key={idx} fill={idx === revenueData.length - 1 ? '#f5a623' : 'rgba(245,166,35,0.4)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ════ ROW 4: RECENT REGISTRATIONS (left) + EXPIRED MEMBERS (right) ════ */}
          <div style={st.row4}>

            {/* ── LEFT: Recent Registrations ── */}
            <div style={st.recentCard}>
              <div style={st.cardHeader}>
                <div>
                  <h2 style={st.cardTitle}>Recent Registrations</h2>
                  <p style={st.cardSub}>Latest 6 members</p>
                </div>
                <a href="/total-members" style={st.viewAllLink}>View All →</a>
              </div>
              {recentMembers.length === 0 ? (
                <div style={st.emptyInner}>
                  <span style={{ fontSize: 36 }}>👥</span>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>No members yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {recentMembers.map((m, idx) => {
                    const isActive = m.membershipStatus === 'Active';
                    return (
                      <div
                        key={m._id}
                        style={{
                          ...st.memberRow,
                          borderBottom: idx < recentMembers.length - 1 ? '1px solid var(--border-color)' : 'none',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: isActive
                            ? 'linear-gradient(135deg, #ff2b2b, #d40000)'
                            : 'linear-gradient(135deg, #555, #333)',
                          color: '#fff', fontSize: 13, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {m.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {m.fullName}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                            {m.membershipName} · {fmtDate(m.joinDate)}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: '#00c9a7', margin: 0 }}>
                            {fmtINR(m.membershipAmount)}
                          </p>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                            background: isActive ? 'rgba(0,201,167,0.12)' : 'rgba(220,0,0,0.12)',
                            color: isActive ? '#00c9a7' : '#e00000',
                          }}>
                            {m.membershipStatus}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── RIGHT: Expired Members (replaces Expiring Soon) ── */}
            <div style={st.expiredFullCard}>

              {/* Card header */}
              <div style={{ ...st.cardHeader, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: 'rgba(220,0,0,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  }}>
                    ⏰
                  </div>
                  <div>
                    <h2 style={st.cardTitle}>Expired Members</h2>
                    <p style={st.cardSub}>
                      {expiredLoading
                        ? 'Loading...'
                        : `${expiredMembers.length} expired membership${expiredMembers.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ position: 'relative' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <input
                      style={st.expiredSearchInput}
                      placeholder="Search..."
                      value={expiredSearch}
                      onChange={e => setExpiredSearch(e.target.value)}
                    />
                  </div>
                  <a href="/expired-members" style={st.viewAllBtnRed}>View All →</a>
                </div>
              </div>

              {/* Mini stats strip */}
              <div style={st.expiredStatsStrip}>
                {[
                  { label: 'Total',   value: expiredMembers.length,                                                  color: '#e00000' },
                  { label: 'Today',   value: expiredMembers.filter(m => daysSinceExpiry(m.expiryDate) === 0).length, color: '#f5a623' },
                  { label: '7 Days',  value: expiredMembers.filter(m => daysSinceExpiry(m.expiryDate) <= 7).length,  color: '#f5a623' },
                  { label: '30 Days', value: expiredMembers.filter(m => daysSinceExpiry(m.expiryDate) <= 30).length, color: '#845ef7' },
                ].map((s, i, arr) => (
                  <div key={s.label} style={{
                    ...st.expiredStatItem,
                    borderRight: i < arr.length - 1 ? '1px solid var(--border-color)' : 'none',
                  }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Table / Empty / Loading */}
              {expiredLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                  <div style={sk.spinner} />
                </div>
              ) : filteredExpired.length === 0 ? (
                <div style={st.emptyInner}>
                  <span style={{ fontSize: 36 }}>🎉</span>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                    {expiredSearch ? 'No results found.' : 'No expired members — great retention!'}
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--border-color)', flex: 1 }}>
                  <table style={st.expiredTable}>
                    <thead>
                      <tr>
                        {['ID', 'Name', 'Plan', 'Amount', 'Expired', 'Since', 'Actions'].map(h => (
                          <th key={h} style={st.expiredTh}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpired.map((m, idx) => {
                        const days    = daysSinceExpiry(m.expiryDate);
                        const urgColor = days === 0 ? '#f5a623' : days <= 30 ? '#f5a623' : '#e00000';
                        return (
                          <tr
                            key={m._id}
                            style={{
                              borderBottom: idx < filteredExpired.length - 1
                                ? '1px solid var(--border-color)' : 'none',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            {/* ID */}
                            <td style={st.expiredTd}>
                              <span style={st.memberIdBadge}>{m.memberId}</span>
                            </td>

                            {/* Name + phone */}
                            <td style={st.expiredTd}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                  width: 28, height: 28, borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #555, #333)',
                                  color: '#fff', fontSize: 11, fontWeight: 700,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                  {m.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap' }}>
                                    {m.fullName}
                                  </p>
                                  <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>
                                    {m.phone}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Plan */}
                            <td style={st.expiredTd}>
                              <span style={{
                                fontSize: 10, fontWeight: 600, padding: '2px 7px',
                                background: 'rgba(220,0,0,0.08)', color: '#e00000', borderRadius: 5,
                              }}>
                                {m.membershipName}
                              </span>
                            </td>

                            {/* Amount */}
                            <td style={st.expiredTd}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                                {fmtINR(m.membershipAmount)}
                              </span>
                            </td>

                            {/* Expiry date */}
                            <td style={st.expiredTd}>
                              <span style={{ fontSize: 11, color: urgColor, fontWeight: 600 }}>
                                {fmtDate(m.expiryDate)}
                              </span>
                            </td>

                            {/* Days since */}
                            <td style={st.expiredTd}>
                              <span style={{
                                fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                                background: days === 0
                                  ? 'rgba(245,166,35,0.12)'
                                  : days <= 30
                                  ? 'rgba(245,166,35,0.1)'
                                  : 'rgba(220,0,0,0.12)',
                                color: urgColor,
                              }}>
                                {days === 0 ? 'Today' : `${days}d ago`}
                              </span>
                            </td>

                            {/* Actions */}
                            <td style={st.expiredTd}>
                              <div style={{ display: 'flex', gap: 5 }}>
                                {/* Email */}
                                <button
                                  style={st.emailBtn}
                                  title="Send Renewal Email"
                                  disabled={emailingId === m._id}
                                  onClick={() => handleEmail(m)}
                                >
                                  {emailingId === m._id ? (
                                    <div style={{
                                      width: 10, height: 10,
                                      border: '2px solid rgba(77,148,255,0.3)',
                                      borderTop: '2px solid #4d94ff',
                                      borderRadius: '50%',
                                      animation: 'spin 0.7s linear infinite',
                                    }} />
                                  ) : (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                                      <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                  )}
                                </button>

                                {/* WhatsApp */}
                                <button
                                  style={st.waBtn}
                                  title="Send WhatsApp Reminder"
                                  onClick={() => handleWhatsApp(m)}
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
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

                  {/* Show more footer */}
                  {expiredMembers.length > 8 && !expiredSearch && (
                    <div style={{
                      textAlign: 'center', padding: '12px',
                      borderTop: '1px solid var(--border-color)',
                      background: 'var(--bg-card)', borderRadius: '0 0 10px 10px',
                    }}>
                      <a href="/expired-members" style={{ fontSize: 12, fontWeight: 600, color: '#e00000', textDecoration: 'none' }}>
                        + {expiredMembers.length - 8} more → View All
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* ── END: Expired Members ── */}

          </div>
          {/* ════ END ROW 4 ════ */}

        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        a:hover { text-decoration: none; }
      `}</style>
    </div>
  );
};

export default Dashboard;