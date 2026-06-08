const nodemailer = require('nodemailer');

// ─────────────────────────────────────────
// SHARED TRANSPORTER
// ─────────────────────────────────────────
const createTransporter = () =>
nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});
// ─────────────────────────────────────────
// 1. OTP EMAIL (unchanged)
// ─────────────────────────────────────────
const sendOTPEmail = async (to, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Gym Manager" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: 'Your OTP Code - Gym Management',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;">
        <h2 style="color:#1a1a2e;">Gym Management System</h2>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing:8px;color:#e94560;font-size:36px;">${otp}</h1>
        <p>This code expires in <strong>3 minutes</strong>.</p>
        <p style="color:#888;font-size:12px;">Do not share this code with anyone.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ─────────────────────────────────────────
// 2. MEMBERSHIP CONFIRMATION EMAIL
// ─────────────────────────────────────────
const sendMembershipConfirmationEmail = async (member) => {
  const transporter = createTransporter();

  const GYM_NAME    = process.env.GYM_NAME    || 'Lifetime Fitness';
  const GYM_PHONE   = process.env.GYM_PHONE   || '+91 98765 43210';
  const GYM_EMAIL   = process.env.GYM_EMAIL   || process.env.SMTP_EMAIL;
  const GYM_ADDRESS = process.env.GYM_ADDRESS || '123, Fitness Street, Chennai, Tamil Nadu - 600001';
  const GYM_WEBSITE = process.env.GYM_WEBSITE || '#';

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

  const fmtDateTime = (d) => {
    const dt = new Date(d);
    return (
      dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) +
      ', ' +
      dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    );
  };

  const fmtAmount = (n) =>
    'Rs.' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const txnDisplay =
    member.paymentMethod === 'Razorpay' && member.razorpayTransactionId
      ? member.razorpayTransactionId
      : member.paymentMethod === 'Cash'    ? 'Cash Payment'
      : member.paymentMethod === 'Card'    ? 'Card Payment'
      : member.paymentMethod === 'QR Code' ? 'QR Code Payment'
      : '-';

  const gymWords = GYM_NAME.trim().split(' ');
  const gymFirst = gymWords.length > 1 ? gymWords.slice(0, -1).join(' ') : gymWords[0];
  const gymLast  = gymWords.length > 1 ? gymWords[gymWords.length - 1] : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>Membership Activated - ${GYM_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#111111;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#111111">
<tr><td align="center" style="padding:20px 12px;">

<table width="600" cellpadding="0" cellspacing="0" border="0"
  style="max-width:600px;width:100%;background-color:#1a1a1a;border-radius:16px;
         overflow:hidden;border:2px solid #d4af37;">

  <!-- ═══════════ HEADER ═══════════ -->
  <tr>
    <td align="center" bgcolor="#1a1a1a"
      style="padding:36px 32px 28px;border-bottom:2px solid #d4af37;">

      <!-- Logo box -->
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px;">
        <tr>
          <td align="center" valign="middle" bgcolor="#d4af37"
            style="width:68px;height:68px;border-radius:16px;
                   border:3px solid #f5c842;">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
              stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4v16M18 4v16M3 8h4M17 8h4M3 16h4M17 16h4"/>
            </svg>
          </td>
        </tr>
      </table>

      <!-- Gym Name -->
      <div style="font-size:30px;font-weight:900;letter-spacing:4px;
                  text-transform:uppercase;margin-bottom:8px;line-height:1;">
        <span style="color:#ffffff;">${gymFirst}&nbsp;</span><span style="color:#d4af37;">${gymLast}</span>
      </div>

      <!-- Tagline -->
      <div style="font-size:13px;font-weight:700;letter-spacing:2px;
                  text-transform:uppercase;color:#d4af37;margin-top:4px;">
        TRANSFORM YOUR BODY &nbsp;&#8226;&nbsp; TRANSFORM YOUR LIFE
      </div>
    </td>
  </tr>

  <!-- ═══════════ HERO ═══════════ -->
  <tr>
    <td align="center" bgcolor="#222222"
      style="padding:36px 32px 32px;border-bottom:2px solid #d4af37;">

      <!-- Success icon circle -->
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
        <tr>
          <td align="center" valign="middle"
            style="width:72px;height:72px;border-radius:50%;
                   background-color:#2a2200;
                   border:3px solid #d4af37;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17l-5-5" stroke="#d4af37" stroke-width="3"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </td>
        </tr>
      </table>

      <!-- Main heading -->
      <div style="font-size:36px;font-weight:900;letter-spacing:2px;
                  text-transform:uppercase;margin-bottom:16px;line-height:1.1;">
        <span style="color:#ffffff;">MEMBERSHIP&nbsp;</span><span style="color:#d4af37;">ACTIVATED!</span>
      </div>

      <!-- Gold divider -->
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;width:280px;">
        <tr>
          <td style="height:3px;background-color:#d4af37;border-radius:2px;"></td>
          <td style="width:14px;" align="center" valign="middle">
            <div style="width:10px;height:10px;border-radius:50%;
                        background-color:#d4af37;margin:0 4px;"></div>
          </td>
          <td style="height:3px;background-color:#d4af37;border-radius:2px;"></td>
        </tr>
      </table>

      <!-- Greeting -->
      <div style="font-size:20px;font-weight:700;color:#ffffff;margin-bottom:12px;">
        Hi ${member.fullName},
      </div>

      <!-- Sub text -->
      <div style="font-size:15px;color:#cccccc;line-height:1.8;max-width:440px;margin:0 auto;">
        Your membership has been successfully activated.<br/>
        Thank you for choosing <strong style="color:#d4af37;">${GYM_NAME}</strong>.<br/>
        We are excited to be part of your fitness journey.
      </div>
    </td>
  </tr>

  <!-- ═══════════ MEMBERSHIP DETAILS ═══════════ -->
  <tr>
    <td bgcolor="#1a1a1a" style="padding:24px 24px 0;">

      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:#242424;border:1px solid #d4af37;border-radius:12px;overflow:hidden;">

        <!-- Card header -->
        <tr>
          <td colspan="2" bgcolor="#2a2200"
            style="padding:14px 20px;border-bottom:1px solid #d4af37;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" valign="middle" bgcolor="#d4af37"
                  style="width:28px;height:28px;border-radius:6px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#1a1a1a" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
                  </svg>
                </td>
                <td style="padding-left:10px;font-size:13px;font-weight:700;
                           letter-spacing:2px;color:#d4af37;text-transform:uppercase;">
                  Membership Details
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Two columns -->
        <tr>
          <!-- LEFT -->
          <td width="50%" valign="top"
            style="padding:20px 20px 20px;border-right:1px solid #333333;">

            <table cellpadding="0" cellspacing="0" border="0" width="100%">

              <tr><td style="padding-bottom:18px;">
                <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                    color:#999999;text-transform:uppercase;margin-bottom:5px;">
                  Membership Plan
                </div>
                <div style="font-size:15px;font-weight:700;color:#d4af37;">
                  ${member.membershipName}
                </div>
              </td></tr>

              <tr><td style="padding-bottom:18px;">
                <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                    color:#999999;text-transform:uppercase;margin-bottom:5px;">
                  Membership ID
                </div>
                <div style="font-size:15px;font-weight:700;color:#d4af37;">
                  ${member.memberId}
                </div>
              </td></tr>

              <tr><td style="padding-bottom:18px;">
                <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                    color:#999999;text-transform:uppercase;margin-bottom:5px;">
                  Start Date
                </div>
                <div style="font-size:15px;font-weight:600;color:#ffffff;">
                  ${fmtDate(member.joinDate)}
                </div>
              </td></tr>

              <tr><td style="padding-bottom:18px;">
                <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                    color:#999999;text-transform:uppercase;margin-bottom:5px;">
                  End Date
                </div>
                <div style="font-size:15px;font-weight:600;color:#ffffff;">
                  ${fmtDate(member.expiryDate)}
                </div>
              </td></tr>

              <tr><td>
                <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                    color:#999999;text-transform:uppercase;margin-bottom:5px;">
                  Duration
                </div>
                <div style="font-size:15px;font-weight:600;color:#ffffff;">
                  ${member.membershipDuration}
                </div>
              </td></tr>

            </table>
          </td>

          <!-- RIGHT -->
          <td width="50%" valign="top" style="padding:20px 20px 20px;">

            <table cellpadding="0" cellspacing="0" border="0" width="100%">

              <tr><td style="padding-bottom:18px;">
                <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                    color:#999999;text-transform:uppercase;margin-bottom:8px;">
                  Payment Status
                </div>
                <!-- PLAIN TEXT badge — no pill shape, works in all email clients -->
                <div style="font-size:14px;font-weight:800;color:#28a745;
                            letter-spacing:1px;text-transform:uppercase;">
                  &#10003; PAID
                </div>
              </td></tr>

              <tr><td style="padding-bottom:18px;">
                <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                    color:#999999;text-transform:uppercase;margin-bottom:5px;">
                  Payment Date
                </div>
                <div style="font-size:14px;font-weight:600;color:#ffffff;">
                  ${fmtDateTime(member.joinDate)}
                </div>
              </td></tr>

              <tr><td style="padding-bottom:18px;">
                <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                    color:#999999;text-transform:uppercase;margin-bottom:5px;">
                  Payment Method
                </div>
                <div style="font-size:15px;font-weight:600;color:#ffffff;">
                  ${member.paymentMethod}
                </div>
              </td></tr>

              <tr><td style="padding-bottom:18px;">
                <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                    color:#999999;text-transform:uppercase;margin-bottom:5px;">
                  Transaction ID
                </div>
                <div style="font-size:14px;font-weight:700;color:#d4af37;
                            word-break:break-all;">
                  ${txnDisplay}
                </div>
              </td></tr>

              <tr><td>
                <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                    color:#999999;text-transform:uppercase;margin-bottom:5px;">
                  Membership Status
                </div>
                <!-- PLAIN TEXT active status — works in all clients -->
                <div style="font-size:14px;font-weight:800;color:#d4af37;
                            letter-spacing:1px;text-transform:uppercase;">
                  &#9679; ACTIVE
                </div>
              </td></tr>

            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ═══════════ BILLING + MEMBER INFO ═══════════ -->
  <tr>
    <td bgcolor="#1a1a1a" style="padding:20px 24px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr valign="top">

          <!-- BILLING SUMMARY -->
          <td width="48%" style="padding-right:8px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
              style="background-color:#242424;border:1px solid #d4af37;
                     border-radius:12px;overflow:hidden;">

              <tr>
                <td bgcolor="#2a2200"
                  style="padding:13px 18px;border-bottom:1px solid #d4af37;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" valign="middle" bgcolor="#d4af37"
                        style="width:26px;height:26px;border-radius:6px;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="#1a1a1a" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                      </td>
                      <td style="padding-left:8px;font-size:11px;font-weight:700;
                                 letter-spacing:2px;color:#d4af37;text-transform:uppercase;">
                        Billing Summary
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:16px 18px;">

                  <!-- Row: Membership Fee -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"
                    style="margin-bottom:10px;padding-bottom:10px;
                           border-bottom:1px solid #333333;">
                    <tr>
                      <td>
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="padding-right:7px;">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="#d4af37" stroke-width="2"
                                xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 6v2M12 16v2M8.5 9.5a3.5 3.5 0 0 1 7 0c0 2-3.5 3-3.5 5M12 17h.01"/>
                              </svg>
                            </td>
                            <td style="font-size:13px;color:#cccccc;">Membership Fee</td>
                          </tr>
                        </table>
                      </td>
                      <td align="right" style="font-size:13px;font-weight:600;color:#ffffff;">
                        ${fmtAmount(member.membershipAmount)}
                      </td>
                    </tr>
                  </table>

                  <!-- Row: Registration Fee -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"
                    style="margin-bottom:10px;padding-bottom:10px;
                           border-bottom:1px solid #333333;">
                    <tr>
                      <td>
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="padding-right:7px;">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="#d4af37" stroke-width="2"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                              </svg>
                            </td>
                            <td style="font-size:13px;color:#cccccc;">Registration Fee</td>
                          </tr>
                        </table>
                      </td>
                      <td align="right" style="font-size:13px;font-weight:600;color:#ffffff;">
                        Rs.0.00
                      </td>
                    </tr>
                  </table>

                  <!-- Row: GST -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"
                    style="margin-bottom:12px;padding-bottom:12px;
                           border-bottom:1px solid #333333;">
                    <tr>
                      <td>
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="padding-right:7px;">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="#d4af37" stroke-width="2"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/>
                                <line x1="8" y1="9" x2="16" y2="9"/>
                                <line x1="8" y1="13" x2="16" y2="13"/>
                              </svg>
                            </td>
                            <td style="font-size:13px;color:#cccccc;">GST (Incl.)</td>
                          </tr>
                        </table>
                      </td>
                      <td align="right" style="font-size:13px;font-weight:600;color:#ffffff;">
                        Included
                      </td>
                    </tr>
                  </table>

                  <!-- Row: Total Paid -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"
                    style="padding-top:4px;border-top:1px solid #d4af37;">
                    <tr>
                      <td>
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="padding-right:7px;">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="#d4af37" stroke-width="2.5"
                                xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M9 12l2 2 4-4"
                                  stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>
                            </td>
                            <td style="font-size:14px;font-weight:800;color:#ffffff;">
                              Total Paid
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td align="right" style="font-size:17px;font-weight:900;color:#d4af37;">
                        ${fmtAmount(member.membershipAmount)}
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>
            </table>
          </td>

          <!-- MEMBER INFORMATION -->
          <td width="48%" style="padding-left:8px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
              style="background-color:#242424;border:1px solid #d4af37;
                     border-radius:12px;overflow:hidden;">

              <tr>
                <td bgcolor="#2a2200"
                  style="padding:13px 18px;border-bottom:1px solid #d4af37;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" valign="middle" bgcolor="#d4af37"
                        style="width:26px;height:26px;border-radius:6px;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="#1a1a1a" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="8" r="4"/>
                          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                        </svg>
                      </td>
                      <td style="padding-left:8px;font-size:11px;font-weight:700;
                                 letter-spacing:2px;color:#d4af37;text-transform:uppercase;">
                        Member Info
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:16px 18px;">

                  <!-- Name -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"
                    style="margin-bottom:12px;padding-bottom:12px;
                           border-bottom:1px solid #333333;">
                    <tr>
                      <td style="width:22px;vertical-align:top;padding-top:2px;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="#d4af37" stroke-width="2"
                          xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="8" r="4"/>
                          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                        </svg>
                      </td>
                      <td style="padding-left:6px;">
                        <div style="font-size:10px;font-weight:700;letter-spacing:1px;
                            color:#999999;text-transform:uppercase;margin-bottom:3px;">
                          Name
                        </div>
                        <div style="font-size:13px;font-weight:700;color:#d4af37;
                                    word-break:break-word;">
                          ${member.fullName}
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Phone -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"
                    style="margin-bottom:12px;padding-bottom:12px;
                           border-bottom:1px solid #333333;">
                    <tr>
                      <td style="width:22px;vertical-align:top;padding-top:2px;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="#d4af37" stroke-width="2"
                          xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.07 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 5.09 5.09l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                      </td>
                      <td style="padding-left:6px;">
                        <div style="font-size:10px;font-weight:700;letter-spacing:1px;
                            color:#999999;text-transform:uppercase;margin-bottom:3px;">
                          Phone
                        </div>
                        <div style="font-size:13px;font-weight:700;color:#d4af37;">
                          +91 ${member.phone}
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Email -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"
                    style="margin-bottom:12px;padding-bottom:12px;
                           border-bottom:1px solid #333333;">
                    <tr>
                      <td style="width:22px;vertical-align:top;padding-top:2px;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="#d4af37" stroke-width="2"
                          xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </td>
                      <td style="padding-left:6px;">
                        <div style="font-size:10px;font-weight:700;letter-spacing:1px;
                            color:#999999;text-transform:uppercase;margin-bottom:3px;">
                          Email
                        </div>
                        <div style="font-size:12px;font-weight:600;color:#d4af37;
                                    word-break:break-all;">
                          ${member.email}
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Member ID -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="width:22px;vertical-align:top;padding-top:2px;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="#d4af37" stroke-width="2"
                          xmlns="http://www.w3.org/2000/svg">
                          <rect x="2" y="5" width="20" height="14" rx="2"/>
                          <circle cx="8" cy="12" r="2"/>
                          <path d="M13 11h5M13 14h3"/>
                        </svg>
                      </td>
                      <td style="padding-left:6px;">
                        <div style="font-size:10px;font-weight:700;letter-spacing:1px;
                            color:#999999;text-transform:uppercase;margin-bottom:3px;">
                          Member ID
                        </div>
                        <div style="font-size:13px;font-weight:700;color:#d4af37;">
                          ${member.memberId}
                        </div>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>
            </table>
          </td>

        </tr>
      </table>
    </td>
  </tr>

  <!-- ═══════════ IMPORTANT NOTE ═══════════ -->
  <tr>
    <td bgcolor="#1a1a1a" style="padding:20px 24px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:#2a2200;border:1px solid #d4af37;border-radius:12px;">
        <tr>
          <td style="padding:20px 22px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr valign="top">
                <td style="width:40px;">
                  <div style="font-size:28px;line-height:1;">&#128276;</div>
                </td>
                <td style="padding-left:14px;">
                  <div style="font-size:12px;font-weight:700;letter-spacing:2px;
                      color:#d4af37;text-transform:uppercase;margin-bottom:8px;">
                    Important Note
                  </div>
                  <div style="font-size:14px;color:#dddddd;line-height:1.8;">
                    Please carry a valid ID card during your gym visits.<br/>
                    Your membership is valid from
                    <strong style="color:#ffffff;">${fmtDate(member.joinDate)}</strong>
                    to
                    <strong style="color:#ffffff;">${fmtDate(member.expiryDate)}</strong>.<br/>
                    For any queries, please contact our support team.
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ═══════════ CTA BUTTON ═══════════ -->
  <tr>
    <td bgcolor="#1a1a1a" align="center" style="padding:28px 24px 20px;">
      <a href="${GYM_WEBSITE}"
        style="display:inline-block;padding:16px 52px;
               background-color:#d4af37;
               border-radius:50px;font-size:14px;font-weight:800;
               letter-spacing:3px;color:#000000;text-decoration:none;
               text-transform:uppercase;font-family:Arial,sans-serif;">
        VISIT THE GYM
      </a>
    </td>
  </tr>

  <!-- ═══════════ FOOTER ═══════════ -->
  <tr>
    <td bgcolor="#111111"
      style="padding:24px 32px 28px;border-top:2px solid #d4af37;">

      <!-- Contact row -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="margin-bottom:20px;">
        <tr>

          <!-- Phone -->
          <td width="33%" align="center"
            style="padding:0 6px;border-right:1px solid #333333;">
            <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
              <tr>
                <td align="center" style="padding-bottom:6px;">
                  <table cellpadding="0" cellspacing="0" border="0"
                    style="margin:0 auto;">
                    <tr>
                      <td align="center" valign="middle"
                        style="width:36px;height:36px;border-radius:50%;
                               background-color:#2a2200;
                               border:1px solid #d4af37;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="#d4af37" stroke-width="2"
                          xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.07 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 5.09 5.09l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td align="center"
                  style="font-size:12px;color:#cccccc;font-weight:500;
                         font-family:Arial,sans-serif;">
                  ${GYM_PHONE}
                </td>
              </tr>
            </table>
          </td>

          <!-- Email -->
          <td width="33%" align="center"
            style="padding:0 6px;border-right:1px solid #333333;">
            <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
              <tr>
                <td align="center" style="padding-bottom:6px;">
                  <table cellpadding="0" cellspacing="0" border="0"
                    style="margin:0 auto;">
                    <tr>
                      <td align="center" valign="middle"
                        style="width:36px;height:36px;border-radius:50%;
                               background-color:#2a2200;
                               border:1px solid #d4af37;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="#d4af37" stroke-width="2"
                          xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td align="center"
                  style="font-size:12px;color:#cccccc;font-weight:500;
                         word-break:break-all;font-family:Arial,sans-serif;">
                  ${GYM_EMAIL}
                </td>
              </tr>
            </table>
          </td>

          <!-- Address -->
          <td width="33%" align="center" style="padding:0 6px;">
            <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
              <tr>
                <td align="center" style="padding-bottom:6px;">
                  <table cellpadding="0" cellspacing="0" border="0"
                    style="margin:0 auto;">
                    <tr>
                      <td align="center" valign="middle"
                        style="width:36px;height:36px;border-radius:50%;
                               background-color:#2a2200;
                               border:1px solid #d4af37;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="#d4af37" stroke-width="2"
                          xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td align="center"
                  style="font-size:12px;color:#cccccc;font-weight:500;
                         font-family:Arial,sans-serif;">
                  ${GYM_ADDRESS}
                </td>
              </tr>
            </table>
          </td>

        </tr>
      </table>

      <!-- Social icons -->
      <table cellpadding="0" cellspacing="0" border="0"
        style="margin:0 auto 18px;">
        <tr>

          <!-- Facebook -->
          <td style="padding:0 7px;">
            <a href="#" style="text-decoration:none;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" valign="middle"
                    style="width:42px;height:42px;border-radius:10px;
                           background-color:#2a2200;
                           border:1px solid #d4af37;">
                    <svg width="18" height="18" viewBox="0 0 24 24"
                      fill="#d4af37" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  </td>
                </tr>
              </table>
            </a>
          </td>

          <!-- Instagram -->
          <td style="padding:0 7px;">
            <a href="#" style="text-decoration:none;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" valign="middle"
                    style="width:42px;height:42px;border-radius:10px;
                           background-color:#2a2200;
                           border:1px solid #d4af37;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="#d4af37" stroke-width="2"
                      xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </td>
                </tr>
              </table>
            </a>
          </td>

          <!-- X (Twitter) -->
          <td style="padding:0 7px;">
            <a href="#" style="text-decoration:none;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" valign="middle"
                    style="width:42px;height:42px;border-radius:10px;
                           background-color:#2a2200;
                           border:1px solid #d4af37;">
                    <svg width="18" height="18" viewBox="0 0 24 24"
                      fill="#d4af37" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </td>
                </tr>
              </table>
            </a>
          </td>

          <!-- YouTube -->
          <td style="padding:0 7px;">
            <a href="#" style="text-decoration:none;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" valign="middle"
                    style="width:42px;height:42px;border-radius:10px;
                           background-color:#2a2200;
                           border:1px solid #d4af37;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="#d4af37" stroke-width="2"
                      xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"
                        fill="#d4af37" stroke="none"/>
                    </svg>
                  </td>
                </tr>
              </table>
            </a>
          </td>

        </tr>
      </table>

      <!-- Copyright -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center"
            style="font-size:12px;color:#888888;letter-spacing:0.5px;
                   font-family:Arial,sans-serif;">
            &copy; ${new Date().getFullYear()} ${GYM_NAME}. All Rights Reserved.
          </td>
        </tr>
      </table>

    </td>
  </tr>

</table>
<!-- end main table -->

</td></tr>
</table>
<!-- end outer table -->

</body>
</html>`;

  const mailOptions = {
    from: `"${GYM_NAME}" <${process.env.SMTP_EMAIL}>`,
    to: member.email,
    subject: `Membership Activated - Welcome to ${GYM_NAME}!`,
    html,
  };

  await transporter.sendMail(mailOptions);
};

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
// Default export keeps authController.js working without any changes
// (it does: const sendEmail = require('../utils/sendEmail'); await sendEmail(to, otp))
const sendEmail = sendOTPEmail;

module.exports = sendEmail;
module.exports.sendOTPEmail = sendOTPEmail;
module.exports.sendMembershipConfirmationEmail = sendMembershipConfirmationEmail;