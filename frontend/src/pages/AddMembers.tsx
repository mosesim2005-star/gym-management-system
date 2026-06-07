import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import api from '../api/axios';
import UPIPaymentQR from '../components/UPIPaymentQR';
import { s, qr, cm } from '../styles/AddMembers.styles';

interface MembershipPlan {
  _id: string;
  name: string;
  duration: string;
  amount: number;
}

const PAYMENT_METHODS = ['Cash', 'Card', 'QR Code', 'Razorpay'] as const;
type PaymentMethod = typeof PAYMENT_METHODS[number];

const PAYMENT_ICONS: Record<PaymentMethod, string> = {
  Cash: '💵', Card: '💳', 'QR Code': '📱', Razorpay: '⚡',
};

const calculateExpiry = (duration: string): Date => {
  const d = new Date();
  if (duration === '1 Month')       d.setMonth(d.getMonth() + 1);
  else if (duration === '3 Months') d.setMonth(d.getMonth() + 3);
  else if (duration === '6 Months') d.setMonth(d.getMonth() + 6);
  else if (duration === '1 Year')   d.setFullYear(d.getFullYear() + 1);
  return d;
};

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

/* ─────────────────────────────────────────
   QR CODE PAYMENT MODAL
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

        {/* Header */}
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

        {/* Amount banner */}
        <div style={qr.amountBanner}>
          <span style={qr.amountLabel}>Amount to Pay</span>
          <span style={qr.amountValue}>₹{amount.toLocaleString('en-IN')}</span>
        </div>

        {/* Member details strip */}
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

        {/* QR Code area */}
        <div style={qr.qrSection}>
          <div style={qr.qrFrame}>
            <div style={{ ...qr.corner, ...qr.cornerTL }} />
            <div style={{ ...qr.corner, ...qr.cornerTR }} />
            <div style={{ ...qr.corner, ...qr.cornerBL }} />
            <div style={{ ...qr.corner, ...qr.cornerBR }} />
            <div style={qr.scanLine} />
<UPIPaymentQR amount={amount} />          </div>
<p style={qr.scanHint}>
  📷 Scan with GPay / PhonePe / Paytm — Amount auto-filled
</p>          <div style={qr.upiIcons}>
            {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
              <span key={app} style={qr.upiIcon}>{app}</span>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div style={qr.instructions}>
          <div style={qr.instrIcon}>ℹ️</div>
          <p style={qr.instrText}>
            Please scan the QR code and complete the payment of{' '}
            <strong style={{ color: '#e00000' }}>₹{amount.toLocaleString('en-IN')}</strong>.
            Once the payment is received, click{' '}
            <strong style={{ color: '#00c9a7' }}>Confirm Payment</strong> below.
          </p>
        </div>

        {/* Checkbox */}
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

        {/* Action buttons */}
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
              <><div style={qr.btnSpinner} /> Registering...</>
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
   CARD PAYMENT MODAL
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

        {/* 3D Card preview */}
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

        {/* Fields */}
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
   MAIN PAGE
───────────────────────────────────────── */
const AddMembers: React.FC = () => {
  const [plans, setPlans]               = useState<MembershipPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [fullName, setFullName]         = useState('');
  const [email, setEmail]               = useState('');
  const [phone, setPhone]               = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [paymentMethod, setPaymentMethod]   = useState<PaymentMethod>('Cash');

  const selectedPlan = plans.find(p => p._id === selectedPlanId) || null;
  const expiryDate   = selectedPlan ? calculateExpiry(selectedPlan.duration) : null;
  const joinDate     = new Date();

  const [step, setStep]               = useState<'form' | 'payment' | 'success'>('form');
  const [submitting, setSubmitting]   = useState(false);
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [successMember, setSuccessMember]       = useState<any>(null);
  const [razorpayProcessing, setRazorpayProcessing] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showQRModal, setShowQRModal]     = useState(false);

  useEffect(() => {
    api.get('/memberships')
      .then(r => {
        setPlans(r.data);
        if (r.data.length > 0) setSelectedPlanId(r.data[0]._id);
      })
      .catch(() => {})
      .finally(() => setLoadingPlans(false));
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = 'Valid email is required';
    if (!phone.trim() || phone.length < 10) e.phone = 'Valid phone number is required';
    if (!selectedPlanId) e.plan = 'Please select a membership plan';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProceedToPayment = () => { if (validate()) setStep('payment'); };

  const handleRazorpay = () => {
    if (!(window as any).Razorpay) { alert('Razorpay SDK not loaded.'); return; }
    setRazorpayProcessing(true);
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY || '',
      amount: selectedPlan!.amount * 100,
      currency: 'INR',
      name: 'Lifetime Fitness',
      description: `${selectedPlan!.name} - ${selectedPlan!.duration}`,
      handler: async (response: any) => {
        await registerMember('Razorpay', 'Paid', response.razorpay_payment_id);
        setRazorpayProcessing(false);
      },
      prefill: { name: fullName, email, contact: phone },
      theme: { color: '#e00000' },
      modal: { ondismiss: () => setRazorpayProcessing(false) },
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const registerMember = async (
    method: PaymentMethod,
    status: 'Paid' | 'Pending',
    txnId?: string
  ) => {
    setSubmitting(true);
    try {
      const res = await api.post('/members', {
        fullName, email, phone,
        membershipId: selectedPlanId,
        paymentMethod: method,
        paymentStatus: status,
        razorpayTransactionId: txnId || null,
      });
      setSuccessMember(res.data);
      setStep('success');
    } catch (err: any) {
      setErrors({ submit: err.response?.data?.message || 'Registration failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPayment = () => {
    if      (paymentMethod === 'Card')    setShowCardModal(true);
    else if (paymentMethod === 'QR Code') setShowQRModal(true);
    else registerMember(paymentMethod, 'Paid');
  };

  const handleCardSuccess = async () => {
    setShowCardModal(false);
    await registerMember('Card', 'Paid');
  };

  const handleQRConfirm = async () => {
    await registerMember('QR Code', 'Paid');
    setShowQRModal(false);
  };

  const resetForm = () => {
    setFullName(''); setEmail(''); setPhone('');
    setSelectedPlanId(plans[0]?._id || '');
    setPaymentMethod('Cash');
    setErrors({}); setSuccessMember(null); setStep('form');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <header style={s.header}>
          <div>
            <h1 style={s.headerTitle}>Add Member</h1>
            <p style={s.headerSub}>Register a new gym member</p>
          </div>
          <ThemeToggle />
        </header>

        <main style={s.main}>

          {/* Step indicator */}
          {step !== 'success' && (
            <div style={s.stepRow}>
              {(['form', 'payment'] as const).map((st, i) => (
                <React.Fragment key={st}>
                  <div style={s.stepItem}>
                    <div style={{
                      ...s.stepCircle,
                      background: step === st ? '#e00000' : (step === 'payment' && st === 'form') ? '#00c9a7' : 'var(--bg-card)',
                      border: step === st ? '2px solid #e00000' : '2px solid var(--border-color)',
                      color: step === st || (step === 'payment' && st === 'form') ? '#fff' : 'var(--text-muted)',
                    }}>
                      {step === 'payment' && st === 'form' ? '✓' : i + 1}
                    </div>
                    <span style={{ ...s.stepLabel, color: step === st ? '#e00000' : 'var(--text-muted)' }}>
                      {st === 'form' ? 'Member Details' : 'Payment'}
                    </span>
                  </div>
                  {i === 0 && (
                    <div style={{ ...s.stepLine, background: step === 'payment' ? '#00c9a7' : 'var(--border-color)' }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* ════ STEP 1: FORM ════ */}
          {step === 'form' && (
            <div style={s.card}>
              <div style={s.cardSection}>
                <div style={s.sectionHead}>
                  <div style={{ ...s.sectionIcon, background: 'rgba(220,0,0,0.12)', color: '#e00000' }}>👤</div>
                  <h2 style={s.sectionTitle}>Personal Information</h2>
                </div>
                <div style={s.fieldGrid}>
                  <div style={s.fieldWrap}>
                    <label style={s.label}>Full Name *</label>
                    <input
                      style={{ ...s.input, ...(errors.fullName ? { borderColor: '#ff4444' } : {}) }}
                      placeholder="e.g. Rahul Sharma" value={fullName}
                      onChange={e => setFullName(e.target.value)}
                    />
                    {errors.fullName && <span style={s.errTxt}>{errors.fullName}</span>}
                  </div>
                  <div style={s.fieldWrap}>
                    <label style={s.label}>Email Address *</label>
                    <input
                      style={{ ...s.input, ...(errors.email ? { borderColor: '#ff4444' } : {}) }}
                      type="email" placeholder="rahul@email.com" value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                    {errors.email && <span style={s.errTxt}>{errors.email}</span>}
                  </div>
                  <div style={s.fieldWrap}>
                    <label style={s.label}>Phone Number *</label>
                    <input
                      style={{ ...s.input, ...(errors.phone ? { borderColor: '#ff4444' } : {}) }}
                      type="tel" placeholder="9876543210" maxLength={10} value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/, ''))}
                    />
                    {errors.phone && <span style={s.errTxt}>{errors.phone}</span>}
                  </div>
                </div>
              </div>

              <div style={s.divider} />

              <div style={s.cardSection}>
                <div style={s.sectionHead}>
                  <div style={{ ...s.sectionIcon, background: 'rgba(132,94,247,0.12)', color: '#845ef7' }}>🏷️</div>
                  <h2 style={s.sectionTitle}>Membership Details</h2>
                </div>
                {loadingPlans ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading plans...</p>
                ) : plans.length === 0 ? (
                  <div style={s.noPlanBanner}>
                    ⚠️ No membership plans found. Please create plans in <strong>Membership Revenue</strong> first.
                  </div>
                ) : (
                  <div style={s.fieldGrid}>
                    <div style={{ ...s.fieldWrap, gridColumn: '1 / -1' }}>
                      <label style={s.label}>Membership Type *</label>
                      <div style={s.selectWrap}>
                        <select
                          style={{ ...s.select, ...(errors.plan ? { borderColor: '#ff4444' } : {}) }}
                          value={selectedPlanId}
                          onChange={e => setSelectedPlanId(e.target.value)}
                        >
                          {plans.map(p => (
                            <option key={p._id} value={p._id}>
                              {p.name} – {p.duration} (₹{p.amount.toLocaleString('en-IN')})
                            </option>
                          ))}
                        </select>
                        <svg style={s.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      {errors.plan && <span style={s.errTxt}>{errors.plan}</span>}
                    </div>
                    {selectedPlan && (
                      <>
                        <div style={s.fieldWrap}>
                          <label style={s.label}>Membership Amount</label>
                          <div style={s.readonlyField}>
                            <span style={s.readonlyAmt}>₹{selectedPlan.amount.toLocaleString('en-IN')}</span>
                            <span style={s.readonlyTag}>Auto-filled</span>
                          </div>
                        </div>
                        <div style={s.fieldWrap}>
                          <label style={s.label}>Join Date</label>
                          <div style={s.readonlyField}>
                            <span style={s.readonlyTxt}>{fmtDate(joinDate)}</span>
                            <span style={s.readonlyTag}>Today</span>
                          </div>
                        </div>
                        <div style={s.fieldWrap}>
                          <label style={s.label}>Expiry Date</label>
                          <div style={{ ...s.readonlyField, borderColor: 'rgba(220,0,0,0.3)' }}>
                            <span style={{ ...s.readonlyTxt, color: '#e00000' }}>
                              {expiryDate ? fmtDate(expiryDate) : '—'}
                            </span>
                            <span style={{ ...s.readonlyTag, background: 'rgba(220,0,0,0.1)', color: '#e00000' }}>
                              Auto-calculated
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {errors.submit && <p style={s.errTxt}>{errors.submit}</p>}
              <button
                style={s.primaryBtn}
                onClick={handleProceedToPayment}
                disabled={plans.length === 0}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Continue to Payment →
              </button>
            </div>
          )}

          {/* ════ STEP 2: PAYMENT ════ */}
          {step === 'payment' && selectedPlan && (
            <div style={s.card}>
              <div style={s.summaryStrip}>
                <div style={s.summaryItem}>
                  <span style={s.summaryLbl}>Member</span>
                  <span style={s.summaryVal}>{fullName}</span>
                </div>
                <div style={s.summaryDivider} />
                <div style={s.summaryItem}>
                  <span style={s.summaryLbl}>Plan</span>
                  <span style={s.summaryVal}>{selectedPlan.name} – {selectedPlan.duration}</span>
                </div>
                <div style={s.summaryDivider} />
                <div style={s.summaryItem}>
                  <span style={s.summaryLbl}>Amount</span>
                  <span style={{ ...s.summaryVal, color: '#e00000', fontWeight: 800 }}>
                    ₹{selectedPlan.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div style={s.summaryDivider} />
                <div style={s.summaryItem}>
                  <span style={s.summaryLbl}>Expires</span>
                  <span style={s.summaryVal}>{expiryDate ? fmtDate(expiryDate) : '—'}</span>
                </div>
              </div>

              <div style={s.cardSection}>
                <div style={s.sectionHead}>
                  <div style={{ ...s.sectionIcon, background: 'rgba(0,201,167,0.12)', color: '#00c9a7' }}>💳</div>
                  <h2 style={s.sectionTitle}>Select Payment Method</h2>
                </div>
                <div style={s.pmGrid}>
                  {PAYMENT_METHODS.map(pm => (
                    <button
                      key={pm}
                      style={{
                        ...s.pmCard,
                        borderColor: paymentMethod === pm ? '#e00000' : 'var(--border-color)',
                        background:  paymentMethod === pm ? 'rgba(220,0,0,0.08)' : 'var(--bg-card)',
                        boxShadow:   paymentMethod === pm ? '0 0 0 1px #e00000' : 'none',
                      }}
                      onClick={() => setPaymentMethod(pm)}
                    >
                      <span style={s.pmIcon}>{PAYMENT_ICONS[pm]}</span>
                      <span style={{ ...s.pmLabel, color: paymentMethod === pm ? '#e00000' : 'var(--text-primary)' }}>
                        {pm}
                      </span>
                      {pm === 'Razorpay' && <span style={s.pmBadge}>Online</span>}
                      {pm === 'QR Code' && (
                        <span style={{ ...s.pmBadge, background: 'rgba(0,201,167,0.15)', color: '#00c9a7' }}>
                          UPI
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'Razorpay' && <div style={s.razorpayNote}>⚡ You'll be redirected to Razorpay's secure payment gateway. Transaction ID stored automatically.</div>}
                {paymentMethod === 'Card'     && <div style={s.cardNote}>💳 A secure card payment form will open. No card data is stored.</div>}
                {paymentMethod === 'QR Code'  && (
                  <div style={s.qrNote}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00c9a7" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1"/>
                      <rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/>
                      <path d="M14 14h2v2h-2zM18 14h3v3h-3zM14 18h3v3h-3zM19 19h2v2h-2z"/>
                    </svg>
                    📱 A QR code will appear for the member to scan and pay via any UPI app.
                  </div>
                )}
                {paymentMethod === 'Cash' && <div style={s.cashNote}>💵 Collect cash from the member and click Confirm Payment to complete registration.</div>}
              </div>

              {errors.submit && (
                <p style={{ ...s.errTxt, textAlign: 'center', marginBottom: 12 }}>{errors.submit}</p>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button style={s.ghostBtn} onClick={() => { setStep('form'); setErrors({}); }}>
                  ← Back
                </button>
                <button
                  style={{ ...s.primaryBtn, flex: 1, marginTop: 0, opacity: submitting || razorpayProcessing ? 0.7 : 1 }}
                  disabled={submitting || razorpayProcessing}
                  onClick={paymentMethod === 'Razorpay' ? handleRazorpay : handleConfirmPayment}
                >
                  {submitting || razorpayProcessing
                    ? 'Processing...'
                    : paymentMethod === 'Razorpay' ? '⚡ Pay with Razorpay'
                    : paymentMethod === 'Card'     ? '💳 Pay by Card'
                    : paymentMethod === 'QR Code'  ? '📱 Show QR Code'
                    : '✓ Confirm Cash Payment & Register'}
                </button>
              </div>
            </div>
          )}

          {/* ════ STEP 3: SUCCESS ════ */}
          {step === 'success' && successMember && (
            <div style={{ ...s.card, textAlign: 'center' }}>
              <div style={s.successIcon}>🎉</div>
              <h2 style={s.successTitle}>Member Registered Successfully!</h2>
              <p style={s.successSub}>
                The member has been added to Active Members and a confirmation email has been sent.
              </p>
              <div style={s.successGrid}>
                {[
                  { label: 'Member ID',   value: successMember.memberId },
                  { label: 'Name',        value: successMember.fullName },
                  { label: 'Phone',       value: successMember.phone },
                  { label: 'Plan',        value: `${successMember.membershipName} – ${successMember.membershipDuration}` },
                  { label: 'Amount Paid', value: `₹${successMember.membershipAmount.toLocaleString('en-IN')}` },
                  { label: 'Payment',     value: successMember.paymentMethod },
                  { label: 'Join Date',   value: fmtDate(new Date(successMember.joinDate)) },
                  { label: 'Expiry Date', value: fmtDate(new Date(successMember.expiryDate)) },
                  ...(successMember.razorpayTransactionId
                    ? [{ label: 'Txn ID', value: successMember.razorpayTransactionId }]
                    : []),
                ].map(row => (
                  <div key={row.label} style={s.successRow}>
                    <span style={s.successLbl}>{row.label}</span>
                    <span style={s.successVal}>{row.value}</span>
                  </div>
                ))}
              </div>
              <button style={s.primaryBtn} onClick={resetForm}>+ Add Another Member</button>
            </div>
          )}
        </main>
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
          memberName={fullName}
          planName={selectedPlan.name}
          duration={selectedPlan.duration}
          amount={selectedPlan.amount}
          onConfirm={handleQRConfirm}
          onCancel={() => setShowQRModal(false)}
          confirming={submitting}
        />
      )}

      <style>{`
        select option { background: #16161f; color: #fff; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AddMembers;