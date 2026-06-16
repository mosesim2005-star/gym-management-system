import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import api from '../api/axios';
import UPIPaymentQR from '../components/UPIPaymentQR';
import { st } from '../styles/ExpiredMembers.styles';
import { qr, cm } from '../styles/AddMembers.styles';

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

interface MembershipPlan {
  _id: string;
  name: string;
  duration: string;
  amount: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type FilterType = 'all' | 'today' | '7days' | '30days' | 'older';
type PaymentMethod = 'Cash' | 'Card' | 'QR Code' | 'Razorpay';

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Card', 'QR Code', 'Razorpay'];

const PAYMENT_ICONS: Record<PaymentMethod, string> = {
  Cash: '💵', Card: '💳', 'QR Code': '📱', Razorpay: '⚡',
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const daysSinceExpiry = (expiry: string): number => {
  const diff = Date.now() - new Date(expiry).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

const urgencyColor = (days: number): string =>
  days === 0 || days <= 30 ? '#f5a623' : '#e00000';

const urgencyLabel = (days: number): string => {
  if (days === 0) return 'Expired Today';
  if (days === 1) return 'Expired 1 Day Ago';
  return `Expired ${days} Days Ago`;
};

const calculateExpiry = (duration: string): Date => {
  const d = new Date();
  if (duration === '1 Month')       d.setMonth(d.getMonth() + 1);
  else if (duration === '3 Months') d.setMonth(d.getMonth() + 3);
  else if (duration === '6 Months') d.setMonth(d.getMonth() + 6);
  else if (duration === '1 Year')   d.setFullYear(d.getFullYear() + 1);
  return d;
};

const WHATSAPP_MESSAGE = (name: string, plan: string, expiry: string, gymName = 'Lifetime Fitness') =>
  `Hello ${name},\n\nYour *${plan}* membership expired on *${fmtDate(expiry)}*.\n\nWe would love to have you back at *${gymName}*. Renew today and continue your fitness journey! 💪\n\nContact us for renewal assistance.\n\nThank You,\n${gymName}`;

interface Toast { id: number; msg: string; type: 'success' | 'error'; }

/* ─────────────────────────────────────────
   QR CODE PAYMENT MODAL (for reactivation)
───────────────────────────────────────── */
interface QRModalProps {
  memberName: string;
  planName:   string;
  duration:   string;
  amount:     number;
  onConfirm:  () => void;
  onCancel:   () => void;
  confirming: boolean;
}

const QRModal: React.FC<QRModalProps> = ({
  memberName, planName, duration, amount, onConfirm, onCancel, confirming,
}) => {
  const GYM_NAME = process.env.REACT_APP_GYM_NAME || 'Lifetime Fitness';
  const [scanDone, setScanDone] = useState(false);

  return (
    <div style={qr.overlay} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={qr.box}>

        <div style={qr.header}>
          <div style={qr.headerLeft}>
            <div style={qr.gymBadge}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 4v16M18 4v16M3 8h4M17 8h4M3 16h4M17 16h4"/>
              </svg>
            </div>
            <div>
              <h2 style={qr.gymName}>{GYM_NAME}</h2>
              <p style={qr.gymSub}>QR Code Payment</p>
            </div>
          </div>
          <button style={qr.closeBtn} onClick={onCancel}>✕</button>
        </div>

        <div style={qr.amountBanner}>
          <span style={qr.amountLabel}>Amount to Pay</span>
          <span style={qr.amountValue}>₹{amount.toLocaleString('en-IN')}</span>
        </div>

        <div style={qr.detailsStrip}>
          {[
            { label: 'Member',   value: memberName },
            { label: 'Plan',     value: planName   },
            { label: 'Duration', value: duration   },
          ].map(item => (
            <div key={item.label} style={qr.detailItem}>
              <span style={qr.detailLabel}>{item.label}</span>
              <span style={qr.detailValue}>{item.value}</span>
            </div>
          ))}
        </div>

        <div style={qr.qrSection}>
          <div style={qr.qrFrame}>
            <div style={{ ...qr.corner, ...qr.cornerTL }} />
            <div style={{ ...qr.corner, ...qr.cornerTR }} />
            <div style={{ ...qr.corner, ...qr.cornerBL }} />
            <div style={{ ...qr.corner, ...qr.cornerBR }} />
            <div style={qr.scanLine} />
            <UPIPaymentQR amount={amount} />
          </div>
          <p style={qr.scanHint}>
            📷 Scan with GPay / PhonePe / Paytm — Amount auto-filled
          </p>
          <div style={qr.upiIcons}>
            {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
              <span key={app} style={qr.upiIcon}>{app}</span>
            ))}
          </div>
        </div>

        <div style={qr.instructions}>
          <div style={qr.instrIcon}>ℹ️</div>
          <p style={qr.instrText}>
            Please scan the QR code and complete the payment of{' '}
            <strong style={{ color: '#e00000' }}>₹{amount.toLocaleString('en-IN')}</strong>.
            Once the payment is received, click{' '}
            <strong style={{ color: '#00c9a7' }}>Confirm Payment</strong> below.
          </p>
        </div>

        <label style={qr.checkRow}>
          <div
            style={{
              ...qr.checkbox,
              background: scanDone ? '#00c9a7' : 'transparent',
              borderColor: scanDone ? '#00c9a7' : 'rgba(255,255,255,0.2)',
            }}
            onClick={() => setScanDone(v => !v)}
          >
            {scanDone && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span style={qr.checkLabel}>
            I confirm that the payment of ₹{amount.toLocaleString('en-IN')} has been received
          </span>
        </label>

        <div style={qr.actions}>
          <button style={qr.cancelPayBtn} onClick={onCancel} disabled={confirming}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
            Cancel Payment
          </button>
          <button
            style={{
              ...qr.confirmPayBtn,
              opacity: (!scanDone || confirming) ? 0.5 : 1,
              cursor:  (!scanDone || confirming) ? 'not-allowed' : 'pointer',
            }}
            disabled={!scanDone || confirming}
            onClick={onConfirm}
          >
            {confirming ? (
              <><div style={qr.btnSpinner} /> Activating...</>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Confirm Payment
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scan-move {
          0%,100% { top: 8px; opacity: 0.9; }
          50%      { top: calc(100% - 8px); opacity: 0.4; }
        }
        @keyframes qr-fade-in {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes corner-pulse {
          0%,100% { opacity: 0.7; }
          50%      { opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

/* ─────────────────────────────────────────
   CARD PAYMENT MODAL (for reactivation)
───────────────────────────────────────── */
interface CardModalProps {
  amount:    number;
  onSuccess: () => void;
  onClose:   () => void;
}

const CardModal: React.FC<CardModalProps> = ({ amount, onSuccess, onClose }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName]     = useState('');
  const [expiry, setExpiry]         = useState('');
  const [cvv, setCvv]               = useState('');
  const [cvvVisible, setCvvVisible] = useState(false);
  const [flipped, setFlipped]       = useState(false);
  const [paying, setPaying]         = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const displayNumber = cardNumber || '•••• •••• •••• ••••';
  const displayName   = cardName   || 'CARDHOLDER NAME';
  const displayExpiry = expiry     || 'MM/YY';

  const validate = () => {
    const e: Record<string, string> = {};
    const raw = cardNumber.replace(/\s/g, '');
    if (raw.length < 16)   e.cardNumber = 'Enter a valid 16-digit card number';
    if (!cardName.trim())  e.cardName   = 'Cardholder name is required';
    if (expiry.length < 5) e.expiry     = 'Enter valid expiry MM/YY';
    if (cvv.length < 3)    e.cvv        = 'Enter valid CVV';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = () => {
    if (!validate()) return;
    setPaying(true);
    setTimeout(() => { setPaying(false); onSuccess(); }, 2000);
  };

  return (
    <div style={cm.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={cm.box}>
        <div style={cm.head}>
          <div>
            <h2 style={cm.title}>Card Payment</h2>
            <p style={cm.sub}>Secured · Encrypted · Instant</p>
          </div>
          <button style={cm.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={{ perspective: '1000px', marginBottom: 24 }}>
          <div style={{
            ...cm.cardOuter,
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}>
            <div style={cm.cardFront}>
              <div style={cm.cardChip}>
                <div style={cm.chipLine} />
                <div style={cm.chipLine} />
              </div>
              <p style={cm.cardNum}>{displayNumber}</p>
              <div style={cm.cardBottom}>
                <div>
                  <p style={cm.cardLabel}>CARD HOLDER</p>
                  <p style={cm.cardVal}>{displayName.toUpperCase().slice(0, 20)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={cm.cardLabel}>EXPIRES</p>
                  <p style={cm.cardVal}>{displayExpiry}</p>
                </div>
              </div>
            </div>
            <div style={cm.cardBack}>
              <div style={cm.magStripe} />
              <div style={cm.cvvRow}>
                <div style={cm.cvvStripe} />
                <span style={cm.cvvVal}>{cvv || '•••'}</span>
              </div>
              <p style={cm.cardLabel2}>CVV</p>
            </div>
          </div>
        </div>

        <div style={cm.fields}>
          <div style={cm.fieldWrap}>
            <label style={cm.label}>CARD NUMBER</label>
            <input
              style={{ ...cm.input, ...(errors.cardNumber ? cm.inputErr : {}) }}
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={e => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
            />
            {errors.cardNumber && <span style={cm.err}>{errors.cardNumber}</span>}
          </div>

          <div style={cm.fieldWrap}>
            <label style={cm.label}>CARDHOLDER NAME</label>
            <input
              style={{ ...cm.input, ...(errors.cardName ? cm.inputErr : {}) }}
              placeholder="As on card"
              value={cardName}
              onChange={e => setCardName(e.target.value.toUpperCase())}
              maxLength={26}
            />
            {errors.cardName && <span style={cm.err}>{errors.cardName}</span>}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ ...cm.fieldWrap, flex: 1 }}>
              <label style={cm.label}>EXPIRY</label>
              <input
                style={{ ...cm.input, ...(errors.expiry ? cm.inputErr : {}) }}
                placeholder="MM/YY" value={expiry}
                onChange={e => setExpiry(formatExpiry(e.target.value))}
                maxLength={5}
              />
              {errors.expiry && <span style={cm.err}>{errors.expiry}</span>}
            </div>
            <div style={{ ...cm.fieldWrap, flex: 1 }}>
              <label style={cm.label}>CVV</label>
              <div style={{ position: 'relative' }}>
                <input
                  style={{ ...cm.input, ...(errors.cvv ? cm.inputErr : {}), paddingRight: 40 }}
                  placeholder="•••"
                  type={cvvVisible ? 'text' : 'password'}
                  value={cvv} maxLength={4}
                  onFocus={() => setFlipped(true)}
                  onBlur={() => setFlipped(false)}
                  onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                />
                <button style={cm.eyeBtn} onClick={() => setCvvVisible(v => !v)} type="button">
                  {cvvVisible ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.cvv && <span style={cm.err}>{errors.cvv}</span>}
            </div>
          </div>

          <div style={cm.totalRow}>
            <span style={cm.totalLbl}>Total Amount</span>
            <span style={cm.totalAmt}>₹{amount.toLocaleString('en-IN')}</span>
          </div>

          <button
            style={{ ...cm.payBtn, opacity: paying ? 0.8 : 1 }}
            disabled={paying}
            onClick={handlePay}
          >
            {paying ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                <div style={cm.btnSpinner} /> Processing...
              </span>
            ) : `🔒 Pay ₹${amount.toLocaleString('en-IN')}`}
          </button>
          <p style={cm.simNote}>This is a simulated payment. No real charge will be made.</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

/* ─────────────────────────────────────────
   REACTIVATE MODAL — now with full payment flow
───────────────────────────────────────── */
interface ReactivateModalProps {
  member: ExpiredMember;
  plans: MembershipPlan[];
  onClose: () => void;
  onSuccess: (updatedMember: ExpiredMember) => void;
}

const ReactivateModal: React.FC<ReactivateModalProps> = ({ member, plans, onClose, onSuccess }) => {
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?._id || '');
  const [paymentMethod, setPaymentMethod]   = useState<PaymentMethod>('Cash');
  const [saving, setSaving]                 = useState(false);
  const [err, setErr]                       = useState('');
  const [razorpayProcessing, setRazorpayProcessing] = useState(false);
  const [showCardModal, setShowCardModal]   = useState(false);
  const [showQRModal, setShowQRModal]       = useState(false);

  const selectedPlan = plans.find(p => p._id === selectedPlanId);
  const expiryPreview = selectedPlan ? calculateExpiry(selectedPlan.duration) : null;

  // ── Final reactivation call after payment confirmed ──
  const doReactivate = async (method: PaymentMethod, txnId?: string) => {
    if (!selectedPlanId) { setErr('Please select a plan'); return; }
    setSaving(true); setErr('');
    try {
      const res = await api.patch(`/members/${member._id}/reactivate`, {
        membershipId: selectedPlanId,
        paymentMethod: method,
        paymentStatus: 'Paid',
        razorpayTransactionId: txnId || null,
      });
      onSuccess(res.data);
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Failed to reactivate');
    } finally {
      setSaving(false);
    }
  };

  // ── Razorpay flow ──
  const handleRazorpay = () => {
    if (!selectedPlan) { setErr('Please select a plan'); return; }
    if (!(window as any).Razorpay) { setErr('Razorpay SDK not loaded.'); return; }

    setRazorpayProcessing(true);
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY || '',
      amount: selectedPlan.amount * 100,
      currency: 'INR',
      name: 'Lifetime Fitness',
      description: `Renewal: ${selectedPlan.name} - ${selectedPlan.duration}`,
      handler: async (response: any) => {
        await doReactivate('Razorpay', response.razorpay_payment_id);
        setRazorpayProcessing(false);
      },
      prefill: { name: member.fullName, email: member.email, contact: member.phone },
      theme: { color: '#00c9a7' },
      modal: { ondismiss: () => setRazorpayProcessing(false) },
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  // ── Main "Pay / Activate" trigger based on selected payment method ──
  const handleProceed = () => {
    if (!selectedPlanId) { setErr('Please select a plan'); return; }
    setErr('');

    if (paymentMethod === 'Cash') {
      doReactivate('Cash');
    } else if (paymentMethod === 'Card') {
      setShowCardModal(true);
    } else if (paymentMethod === 'QR Code') {
      setShowQRModal(true);
    } else if (paymentMethod === 'Razorpay') {
      handleRazorpay();
    }
  };

  const handleCardSuccess = async () => {
    setShowCardModal(false);
    await doReactivate('Card');
  };

  const handleQRConfirm = async () => {
    await doReactivate('QR Code');
    setShowQRModal(false);
  };

  return (
    <>
      <div style={rm.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
        <div style={rm.box}>

          {/* Header */}
          <div style={rm.head}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={rm.avatar}>{member.fullName.charAt(0).toUpperCase()}</div>
              <div>
                <h2 style={rm.title}>Reactivate Membership</h2>
                <p style={rm.sub}>{member.fullName} · {member.memberId}</p>
              </div>
            </div>
            <button style={rm.closeBtn} onClick={onClose}>✕</button>
          </div>

          {/* Previous plan info */}
          <div style={rm.prevPlan}>
            <span style={rm.prevLabel}>Previous Plan</span>
            <span style={rm.prevVal}>{member.membershipName} – {member.membershipDuration}</span>
            <span style={rm.expiredBadge}>Expired {fmtDate(member.expiryDate)}</span>
          </div>

          <div style={rm.body}>
            {/* Plan select */}
            <div style={rm.field}>
              <label style={rm.label}>New Membership Plan *</label>
              <div style={rm.selectWrap}>
                <select style={rm.select} value={selectedPlanId}
                  onChange={e => setSelectedPlanId(e.target.value)}>
                  {plans.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} – {p.duration} (₹{p.amount.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
                <svg style={rm.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            {/* Auto-filled amount and expiry */}
            {selectedPlan && (
              <div style={rm.autoRow}>
                <div style={rm.autoItem}>
                  <span style={rm.autoLabel}>Amount</span>
                  <span style={rm.autoVal}>₹{selectedPlan.amount.toLocaleString('en-IN')}</span>
                </div>
                <div style={rm.autoItem}>
                  <span style={rm.autoLabel}>New Expiry</span>
                  <span style={{ ...rm.autoVal, color: '#00c9a7' }}>
                    {expiryPreview ? fmtDate(expiryPreview.toISOString()) : '—'}
                  </span>
                </div>
                <div style={rm.autoItem}>
                  <span style={rm.autoLabel}>Start Date</span>
                  <span style={rm.autoVal}>{fmtDate(new Date().toISOString())}</span>
                </div>
              </div>
            )}

            {/* Payment method */}
            <div style={rm.field}>
              <label style={rm.label}>Payment Method *</label>
              <div style={rm.pmGrid}>
                {PAYMENT_METHODS.map(pm => (
                  <button key={pm}
                    style={{
                      ...rm.pmCard,
                      borderColor: paymentMethod === pm ? '#00c9a7' : 'var(--border-color)',
                      background:  paymentMethod === pm ? 'rgba(0,201,167,0.08)' : 'var(--bg-card)',
                      boxShadow:   paymentMethod === pm ? '0 0 0 1px #00c9a7' : 'none',
                    }}
                    onClick={() => setPaymentMethod(pm)}>
                    <span style={rm.pmIcon}>{PAYMENT_ICONS[pm]}</span>
                    <span style={{ ...rm.pmLabel, color: paymentMethod === pm ? '#00c9a7' : 'var(--text-primary)' }}>
                      {pm}
                    </span>
                    {pm === 'Razorpay' && <span style={rm.pmBadge}>Online</span>}
                    {pm === 'QR Code' && (
                      <span style={{ ...rm.pmBadge, background: 'rgba(0,201,167,0.15)', color: '#00c9a7' }}>UPI</span>
                    )}
                  </button>
                ))}
              </div>

              {paymentMethod === 'Razorpay' && (
                <div style={rm.note}>⚡ You'll be redirected to Razorpay's secure payment gateway.</div>
              )}
              {paymentMethod === 'Card' && (
                <div style={rm.note}>💳 A secure card payment form will open. No card data is stored.</div>
              )}
              {paymentMethod === 'QR Code' && (
                <div style={rm.note}>📱 A QR code will appear for the member to scan and pay via any UPI app.</div>
              )}
              {paymentMethod === 'Cash' && (
                <div style={rm.note}>💵 Collect cash from the member and click Activate to complete renewal.</div>
              )}
            </div>

            {err && <p style={{ color: '#ff4444', fontSize: 12, marginTop: 4 }}>{err}</p>}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button style={rm.cancelBtn} onClick={onClose}>Cancel</button>
              <button
                style={{ ...rm.activateBtn, opacity: saving || razorpayProcessing || !selectedPlanId ? 0.7 : 1 }}
                disabled={saving || razorpayProcessing || !selectedPlanId}
                onClick={handleProceed}>
                {saving || razorpayProcessing
                  ? 'Processing...'
                  : paymentMethod === 'Razorpay' ? '⚡ Pay with Razorpay'
                  : paymentMethod === 'Card'     ? '💳 Pay by Card'
                  : paymentMethod === 'QR Code'  ? '📱 Show QR Code'
                  : '✅ Activate (Cash Received)'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card Payment Modal */}
      {showCardModal && selectedPlan && (
        <CardModal
          amount={selectedPlan.amount}
          onSuccess={handleCardSuccess}
          onClose={() => setShowCardModal(false)}
        />
      )}

      {/* QR Code Payment Modal */}
      {showQRModal && selectedPlan && (
        <QRModal
          memberName={member.fullName}
          planName={selectedPlan.name}
          duration={selectedPlan.duration}
          amount={selectedPlan.amount}
          onConfirm={handleQRConfirm}
          onCancel={() => setShowQRModal(false)}
          confirming={saving}
        />
      )}
    </>
  );
};

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
const ExpiredMembers: React.FC = () => {
  const [members, setMembers]         = useState<ExpiredMember[]>([]);
  const [pagination, setPagination]   = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState<FilterType>('all');
  const [toasts, setToasts]           = useState<Toast[]>([]);
  const [emailingId, setEmailingId]   = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [plans, setPlans]             = useState<MembershipPlan[]>([]);
  const [reactivateMember, setReactivateMember] = useState<ExpiredMember | null>(null);
  const [bulkResult, setBulkResult] = useState<{
    total: number; emailsSent: number; whatsappPrepared: number; failed: number;
  } | null>(null);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  const addToast = (msg: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    api.get('/memberships').then(r => setPlans(r.data)).catch(() => {});
  }, []);

  const fetchMembers = useCallback(async (page: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page:   String(page),
        limit:  '20',
        search: q,
      });
      const res = await api.get(`/members/expired-paginated?${params}`);
      setMembers(res.data.members);
      setPagination(res.data.pagination);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchMembers(currentPage, search);
    }, 350);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [currentPage, search, fetchMembers]);

  const filtered = members.filter(m => {
    const days = daysSinceExpiry(m.expiryDate);
    if (filter === 'all')    return true;
    if (filter === 'today')  return days === 0;
    if (filter === '7days')  return days <= 7;
    if (filter === '30days') return days <= 30;
    if (filter === 'older')  return days > 30;
    return true;
  });

  const today = members.filter(m => daysSinceExpiry(m.expiryDate) === 0).length;
  const last7  = members.filter(m => daysSinceExpiry(m.expiryDate) <= 7).length;
  const last30 = members.filter(m => daysSinceExpiry(m.expiryDate) <= 30).length;

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
    if (!window.confirm(`Send renewal reminders to ${filtered.length} expired members?`)) return;
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

  const handleReactivateSuccess = (updated: ExpiredMember) => {
    setMembers(prev => prev.filter(m => m._id !== updated._id));
    setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    setReactivateMember(null);
    addToast(`${updated.fullName} has been reactivated successfully! ✅`);
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

      {reactivateMember && plans.length > 0 && (
        <ReactivateModal
          member={reactivateMember}
          plans={plans}
          onClose={() => setReactivateMember(null)}
          onSuccess={handleReactivateSuccess}
        />
      )}

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

        <header style={st.header}>
          <div>
            <h1 style={st.headerTitle}>Expired Members</h1>
            <p style={st.headerSub}>
              {pagination.total} expired membership{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{ ...st.bulkBtn, opacity: bulkLoading ? 0.7 : 1 }}
              disabled={bulkLoading || filtered.length === 0} onClick={handleBulkReminder}>
              {bulkLoading
                ? (<><div style={st.btnSpinner} /> Sending...</>)
                : (<>📣 Send Reminder to All ({filtered.length})</>)}
            </button>
            <ThemeToggle />
          </div>
        </header>

        <main style={st.main}>

          <div style={st.statRow}>
            {[
              { label: 'Total Expired', value: pagination.total, color: '#e00000', icon: '⏰' },
              { label: 'Expired Today', value: today,            color: '#f5a623', icon: '📅' },
              { label: 'Last 7 Days',  value: last7,             color: '#f5a623', icon: '📊' },
              { label: 'Last 30 Days', value: last30,            color: '#845ef7', icon: '📈' },
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
                <div style={st.bulkResultItem}><span style={st.bulkResultVal}>{bulkResult.total}</span><span style={st.bulkResultLbl}>Processed</span></div>
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
              <input style={st.searchInput}
                placeholder="Search by name, phone, email, plan or member ID..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
            </div>
            <div style={st.filterRow}>
              {([
                { key: 'all',    label: 'All' },
                { key: 'today',  label: 'Today' },
                { key: '7days',  label: 'Last 7 Days' },
                { key: '30days', label: 'Last 30 Days' },
                { key: 'older',  label: '30+ Days' },
              ] as { key: FilterType; label: string }[]).map(f => (
                <button key={f.key}
                  style={{ ...st.filterBtn, ...(filter === f.key ? st.filterBtnActive : {}) }}
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
              <p style={st.emptyTxt}>
                {search || filter !== 'all'
                  ? 'No members match your search or filter.'
                  : 'No expired members — great retention!'}
              </p>
            </div>
          ) : (
            <>
              <div style={st.tableWrap}>
                <table style={st.table}>
                  <thead>
                    <tr>
                      {['Member ID', 'Name', 'Phone', 'Plan', 'Duration', 'Amount',
                        'Join Date', 'Expiry Date', 'Days Since Expired', 'Status', 'Actions'].map(h => (
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
                            <span style={{
                              ...st.daysBadge,
                              background: days === 0 ? 'rgba(245,166,35,0.12)' : days <= 30 ? 'rgba(245,166,35,0.10)' : 'rgba(220,0,0,0.12)',
                              color,
                            }}>
                              {urgencyLabel(days)}
                            </span>
                          </td>

                          <td style={st.td}><span style={st.expiredBadge}>● Expired</span></td>

                          <td style={st.td}>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>

                              <button
                                style={activateBtn}
                                title="Reactivate Membership"
                                onClick={() => setReactivateMember(m)}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5"
                                    strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span style={{ fontSize: 10, fontWeight: 700 }}>Activate</span>
                              </button>

                              <button style={st.emailBtn}
                                title="Send Renewal Reminder Email"
                                disabled={emailingId === m._id}
                                onClick={() => handleEmail(m)}>
                                {emailingId === m._id
                                  ? <div style={st.btnSpinnerSm} />
                                  : (
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                                      <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                  )}
                              </button>

                              <button style={st.waBtn}
                                title="Send WhatsApp Reminder"
                                onClick={() => handleWhatsApp(m)}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
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

              <div style={pgStyle.row}>
                <span style={pgStyle.info}>
                  Showing {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} members
                </span>
                <div style={pgStyle.btns}>
                  <button
                    style={{ ...pgStyle.btn, opacity: currentPage === 1 ? 0.4 : 1 }}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}>
                    ← Prev
                  </button>
                  {pageNumbers().map((pg, i) =>
                    pg === '...' ? (
                      <span key={`dots-${i}`} style={pgStyle.dots}>…</span>
                    ) : (
                      <button key={pg}
                        style={{ ...pgStyle.btn, ...(pg === currentPage ? pgStyle.active : {}) }}
                        onClick={() => setCurrentPage(pg as number)}>
                        {pg}
                      </button>
                    )
                  )}
                  <button
                    style={{ ...pgStyle.btn, opacity: currentPage === pagination.totalPages ? 0.4 : 1 }}
                    disabled={currentPage === pagination.totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}>
                    Next →
                  </button>
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

/* ─── Activate button style ─── */
const activateBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 4,
  padding: '4px 8px', borderRadius: 7, border: 'none',
  background: 'rgba(0,201,167,0.12)', color: '#00c9a7',
  cursor: 'pointer', flexShrink: 0, fontWeight: 700,
};

/* ─── Pagination styles ─── */
const pgStyle: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: 12, marginTop: 20,
  },
  info: { fontSize: 12, color: 'var(--text-muted)' },
  btns: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  btn: {
    padding: '7px 12px', borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'var(--bg-card)', color: 'var(--text-secondary)',
    fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
  },
  active: {
    background: '#e00000', borderColor: '#e00000',
    color: '#fff', boxShadow: '0 2px 8px rgba(220,0,0,0.3)',
  },
  dots: { fontSize: 13, color: 'var(--text-muted)', padding: '0 4px' },
};

/* ─── Reactivate Modal styles ─── */
const rm: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 2000,
  },
  box: {
    background: 'var(--bg-secondary)', border: '1px solid rgba(0,201,167,0.3)',
    borderRadius: 20, width: '100%', maxWidth: 540, margin: '0 20px',
    boxShadow: '0 40px 80px rgba(0,0,0,0.5)', overflow: 'hidden',
    maxHeight: '90vh', overflowY: 'auto',
  },
  head: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '22px 28px', borderBottom: '2px solid rgba(0,201,167,0.2)',
  },
  avatar: {
    width: 44, height: 44, borderRadius: '50%',
    background: 'linear-gradient(135deg, #00c9a7, #009977)',
    color: '#fff', fontSize: 18, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  title: { fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px' },
  sub:   { fontSize: 12, color: 'var(--text-muted)', margin: 0 },
  closeBtn: {
    background: 'rgba(255,255,255,0.07)', border: 'none',
    color: 'var(--text-muted)', borderRadius: 8,
    width: 30, height: 30, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
  },
  prevPlan: {
    display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
    padding: '12px 28px',
    background: 'rgba(220,0,0,0.04)', borderBottom: '1px solid var(--border-color)',
  },
  prevLabel: { fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  prevVal:   { fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' },
  expiredBadge: {
    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
    background: 'rgba(220,0,0,0.1)', color: '#e00000',
  },
  body: { padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 },
  selectWrap: { position: 'relative' },
  select: {
    width: '100%', padding: '11px 38px 11px 14px',
    background: 'var(--input-bg)', border: '1px solid var(--input-border)',
    borderRadius: 10, color: 'var(--text-primary)', fontSize: 13,
    outline: 'none', appearance: 'none', cursor: 'pointer',
  },
  chevron: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    pointerEvents: 'none', color: 'var(--text-muted)',
  },
  autoRow: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 10, padding: '14px 16px',
  },
  autoItem:  { display: 'flex', flexDirection: 'column', gap: 4 },
  autoLabel: { fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 },
  autoVal:   { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' },

  // Payment method grid (same style as AddMembers)
  pmGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
    gap: 10, marginBottom: 4,
  },
  pmCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    padding: '14px 10px', borderRadius: 12, border: '2px solid',
    cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
  },
  pmIcon: { fontSize: 20 },
  pmLabel: { fontSize: 12, fontWeight: 600 },
  pmBadge: {
    position: 'absolute', top: 6, right: 6, fontSize: 9, fontWeight: 700,
    padding: '2px 6px', background: 'rgba(220,0,0,0.15)', color: '#e00000',
    borderRadius: 20, letterSpacing: 0.5,
  },
  note: {
    marginTop: 10, padding: '10px 14px',
    background: 'rgba(0,201,167,0.06)', border: '1px solid rgba(0,201,167,0.2)',
    borderRadius: 10, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6,
  },

  cancelBtn: {
    flex: 1, padding: '12px', background: 'var(--bg-card)',
    border: '1px solid var(--border-color)', borderRadius: 12,
    color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  activateBtn: {
    flex: 2, padding: '12px',
    background: 'linear-gradient(135deg, #00c9a7, #009977)',
    border: 'none', borderRadius: 12,
    color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(0,201,167,0.3)',
  },
};

export default ExpiredMembers;