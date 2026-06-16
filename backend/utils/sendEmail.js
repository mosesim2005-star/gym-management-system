  'use strict';
  const nodemailer = require('nodemailer');
  const path = require('path');

  const ASSETS_DIR = path.join(__dirname, '..', 'assets');

  // ─────────────────────────────────────────
  // LOGGER
  // ─────────────────────────────────────────
  const log = (fn, level, msg, meta = {}) => {
    const ts = new Date().toISOString();
    const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
    console[level](`[${ts}] [sendEmail] [${fn}] ${msg}${metaStr}`);
  };

  // ─────────────────────────────────────────
  // SHARED TRANSPORTER
  // ─────────────────────────────────────────
  const createTransporter = () => {
    const user = process.env.SMTP_EMAIL;
    const pass = process.env.SMTP_PASSWORD;
    if (!user) throw new Error('SMTP_EMAIL is not set in .env');
    if (!pass) throw new Error('SMTP_PASSWORD is not set in .env');
    return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
  };

  // ─────────────────────────────────────────
  // 1. OTP EMAIL
  // ─────────────────────────────────────────
  const sendOTPEmail = async (to, otp) => {
    const FN = 'sendOTPEmail';
    if (!to)  throw new Error(`${FN}: recipient address ("to") is required`);
    if (!otp) throw new Error(`${FN}: OTP value is required`);

    log(FN, 'log', 'Initiating', { to, smtpEmail: process.env.SMTP_EMAIL || 'MISSING' });

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

    const info = await transporter.sendMail(mailOptions);
    log(FN, 'log', '✅ Email sent successfully', { to, messageId: info.messageId });
    return info;
  };

  // ─────────────────────────────────────────
  // 2. MEMBERSHIP CONFIRMATION EMAIL
  // ─────────────────────────────────────────
  const sendMembershipConfirmationEmail = async (member) => {
    const FN = 'sendMembershipConfirmationEmail';

    if (!member)       throw new Error(`${FN}: member object is required`);
    if (!member.email) throw new Error(`${FN}: member.email is required`);

    const requiredFields = [
      'fullName', 'memberId', 'membershipName',
      'membershipDuration', 'membershipAmount',
      'joinDate', 'expiryDate', 'paymentMethod',
    ];
    const missing = requiredFields.filter((f) => member[f] == null);
    if (missing.length) throw new Error(`${FN}: missing required fields: ${missing.join(', ')}`);

    log(FN, 'log', 'Initiating', { to: member.email, memberId: member.memberId });

    const transporter = createTransporter();

    const GYM_NAME    = process.env.GYM_NAME    || 'Lifetime Fitness';
    const GYM_PHONE   = process.env.GYM_PHONE   || '+91 98765 43210';
    const GYM_EMAIL   = process.env.GYM_EMAIL   || process.env.SMTP_EMAIL;
    const GYM_ADDRESS = process.env.GYM_ADDRESS || '123, Fitness Street, Chennai, Tamil Nadu - 600001';
    const GYM_WEBSITE = process.env.GYM_WEBSITE || '#';

    const fmtDate = (d) => {
      const date = new Date(d);
      if (isNaN(date)) return 'N/A';
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    };
    const fmtDateTime = (d) => {
      const dt = new Date(d);
      if (isNaN(dt)) return 'N/A';
      return (
        dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) +
        ', ' + dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    const fmtAmount = (n) => {
      const num = Number(n);
      if (isNaN(num)) return 'Rs.0.00';
      return 'Rs.' + num.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    };

    const txnDisplay =
      member.paymentMethod === 'Razorpay' && member.razorpayTransactionId
        ? member.razorpayTransactionId
        : member.paymentMethod === 'Cash'    ? 'Cash Payment'
        : member.paymentMethod === 'Card'    ? 'Card Payment'
        : member.paymentMethod === 'QR Code' ? 'QR Code Payment'
        : member.paymentMethod === 'UPI QR'  ? 'UPI QR Payment'
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
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px;">
          <tr>
            <td align="center" valign="middle" bgcolor="#d4af37"
              style="width:68px;height:68px;border-radius:16px;border:3px solid #f5c842;">
              <img src="cid:lifetimeFitnessLogo" width="50" height="50" style="display:block;border-radius:8px;" alt="Logo"/>
            </td>
          </tr>
        </table>
        <div style="font-size:30px;font-weight:900;letter-spacing:4px;
                    text-transform:uppercase;margin-bottom:8px;line-height:1;">
          <span style="color:#ffffff;">${gymFirst}&nbsp;</span><span style="color:#d4af37;">${gymLast}</span>
        </div>
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
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
          <tr>
            <td align="center" valign="middle"
              style="width:72px;height:72px;border-radius:50%;
                    background-color:#2a2200;border:3px solid #d4af37;">
              <img src="cid:membershipActivatedIcon" width="40" height="40" style="display:block;" alt="Activated"/>
            </td>
          </tr>
        </table>
        <div style="font-size:36px;font-weight:900;letter-spacing:2px;
                    text-transform:uppercase;margin-bottom:16px;line-height:1.1;">
          <span style="color:#ffffff;">MEMBERSHIP&nbsp;</span><span style="color:#d4af37;">ACTIVATED!</span>
        </div>
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
        <div style="font-size:20px;font-weight:700;color:#ffffff;margin-bottom:12px;">
          Hi ${member.fullName},
        </div>
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
          <tr>
            <td colspan="2" bgcolor="#2a2200"
              style="padding:14px 20px;border-bottom:1px solid #d4af37;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" valign="middle" bgcolor="#d4af37"
                    style="width:28px;height:28px;border-radius:6px;">
                    <img src="cid:membershipDetailsIcon" width="16" height="16" style="display:block;" alt="Details"/>
                  </td>
                  <td style="padding-left:10px;font-size:13px;font-weight:700;
                            letter-spacing:2px;color:#d4af37;text-transform:uppercase;">
                    Membership Details
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <!-- LEFT -->
            <td width="50%" valign="top"
              style="padding:20px 20px 20px;border-right:1px solid #333333;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td style="padding-bottom:18px;">
                  <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                      color:#999999;text-transform:uppercase;margin-bottom:5px;">Membership Plan</div>
                  <div style="font-size:15px;font-weight:700;color:#d4af37;">${member.membershipName}</div>
                </td></tr>
                <tr><td style="padding-bottom:18px;">
                  <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                      color:#999999;text-transform:uppercase;margin-bottom:5px;">Membership ID</div>
                  <div style="font-size:15px;font-weight:700;color:#d4af37;">${member.memberId}</div>
                </td></tr>
                <tr><td style="padding-bottom:18px;">
                  <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                      color:#999999;text-transform:uppercase;margin-bottom:5px;">Start Date</div>
                  <div style="font-size:15px;font-weight:600;color:#ffffff;">${fmtDate(member.joinDate)}</div>
                </td></tr>
                <tr><td style="padding-bottom:18px;">
                  <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                      color:#999999;text-transform:uppercase;margin-bottom:5px;">End Date</div>
                  <div style="font-size:15px;font-weight:600;color:#ffffff;">${fmtDate(member.expiryDate)}</div>
                </td></tr>
                <tr><td>
                  <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                      color:#999999;text-transform:uppercase;margin-bottom:5px;">Duration</div>
                  <div style="font-size:15px;font-weight:600;color:#ffffff;">${member.membershipDuration}</div>
                </td></tr>
              </table>
            </td>
            <!-- RIGHT -->
            <td width="50%" valign="top" style="padding:20px 20px 20px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td style="padding-bottom:18px;">
                  <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                      color:#999999;text-transform:uppercase;margin-bottom:8px;">Payment Status</div>
                  <div style="font-size:14px;font-weight:800;color:#28a745;
                              letter-spacing:1px;text-transform:uppercase;">&#10003; PAID</div>
                </td></tr>
                <tr><td style="padding-bottom:18px;">
                  <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                      color:#999999;text-transform:uppercase;margin-bottom:5px;">Payment Date</div>
                  <div style="font-size:14px;font-weight:600;color:#ffffff;">${fmtDateTime(member.joinDate)}</div>
                </td></tr>
                <tr><td style="padding-bottom:18px;">
                  <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                      color:#999999;text-transform:uppercase;margin-bottom:5px;">Payment Method</div>
                  <div style="font-size:15px;font-weight:600;color:#ffffff;">${member.paymentMethod}</div>
                </td></tr>
                <tr><td style="padding-bottom:18px;">
                  <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                      color:#999999;text-transform:uppercase;margin-bottom:5px;">Transaction ID</div>
                  <div style="font-size:14px;font-weight:700;color:#d4af37;word-break:break-all;">${txnDisplay}</div>
                </td></tr>
                <tr><td>
                  <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;
                      color:#999999;text-transform:uppercase;margin-bottom:5px;">Membership Status</div>
                  <div style="font-size:14px;font-weight:800;color:#d4af37;
                              letter-spacing:1px;text-transform:uppercase;">&#9679; ACTIVE</div>
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
                          <img src="cid:billingSummaryIcon" width="16" height="16" style="display:block;" alt="Billing"/>
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
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #333333;">
                      <tr>
                        <td style="font-size:13px;color:#cccccc;">Membership Fee</td>
                        <td align="right" style="font-size:13px;font-weight:600;color:#ffffff;">
                          ${fmtAmount(member.membershipAmount)}</td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #333333;">
                      <tr>
                        <td style="font-size:13px;color:#cccccc;">Registration Fee</td>
                        <td align="right" style="font-size:13px;font-weight:600;color:#ffffff;">Rs.0.00</td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #333333;">
                      <tr>
                        <td style="font-size:13px;color:#cccccc;">GST (Incl.)</td>
                        <td align="right" style="font-size:13px;font-weight:600;color:#ffffff;">Included</td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="padding-top:4px;border-top:1px solid #d4af37;">
                      <tr>
                        <td style="font-size:14px;font-weight:800;color:#ffffff;">Total Paid</td>
                        <td align="right" style="font-size:17px;font-weight:900;color:#d4af37;">
                          ${fmtAmount(member.membershipAmount)}</td>
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
                          <img src="cid:memberInfoIcon" width="16" height="16" style="display:block;" alt="Member Info"/>
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
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #333333;">
                      <tr><td>
                        <div style="font-size:10px;font-weight:700;letter-spacing:1px;
                            color:#999999;text-transform:uppercase;margin-bottom:3px;">Name</div>
                        <div style="font-size:13px;font-weight:700;color:#d4af37;word-break:break-word;">
                          ${member.fullName}</div>
                      </td></tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #333333;">
                      <tr><td>
                        <div style="font-size:10px;font-weight:700;letter-spacing:1px;
                            color:#999999;text-transform:uppercase;margin-bottom:3px;">Phone</div>
                        <div style="font-size:13px;font-weight:700;color:#d4af37;">
                          +91 ${member.phone || 'N/A'}</div>
                      </td></tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #333333;">
                      <tr><td>
                        <div style="font-size:10px;font-weight:700;letter-spacing:1px;
                            color:#999999;text-transform:uppercase;margin-bottom:3px;">Email</div>
                        <div style="font-size:12px;font-weight:600;color:#d4af37;word-break:break-all;">
                          ${member.email}</div>
                      </td></tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr><td>
                        <div style="font-size:10px;font-weight:700;letter-spacing:1px;
                            color:#999999;text-transform:uppercase;margin-bottom:3px;">Member ID</div>
                        <div style="font-size:13px;font-weight:700;color:#d4af37;">
                          ${member.memberId}</div>
                      </td></tr>
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
                background-color:#d4af37;border-radius:50px;font-size:14px;
                font-weight:800;letter-spacing:3px;color:#000000;
                text-decoration:none;text-transform:uppercase;
                font-family:Arial,sans-serif;">
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
                <tr><td align="center" style="padding-bottom:6px;">
                  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                    <tr>
                      <td align="center" valign="middle"
                        style="width:36px;height:36px;border-radius:50%;
                              background-color:#2a2200;border:1px solid #d4af37;">
                        <img src="cid:phoneIcon" width="16" height="16" style="display:block;" alt="Phone"/>
                      </td>
                    </tr>
                  </table>
                </td></tr>
                <tr><td align="center"
                  style="font-size:12px;color:#cccccc;font-weight:500;font-family:Arial,sans-serif;">
                  ${GYM_PHONE}
                </td></tr>
              </table>
            </td>
            <!-- Email -->
            <td width="33%" align="center"
              style="padding:0 6px;border-right:1px solid #333333;">
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                <tr><td align="center" style="padding-bottom:6px;">
                  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                    <tr>
                      <td align="center" valign="middle"
                        style="width:36px;height:36px;border-radius:50%;
                              background-color:#2a2200;border:1px solid #d4af37;">
                        <img src="cid:gmailIcon" width="16" height="16" style="display:block;" alt="Email"/>
                      </td>
                    </tr>
                  </table>
                </td></tr>
                <tr><td align="center"
                  style="font-size:12px;color:#cccccc;font-weight:500;
                        word-break:break-all;font-family:Arial,sans-serif;">
                  ${GYM_EMAIL}
                </td></tr>
              </table>
            </td>
            <!-- Address -->
            <td width="33%" align="center" style="padding:0 6px;">
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                <tr><td align="center" style="padding-bottom:6px;">
                  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                    <tr>
                      <td align="center" valign="middle"
                        style="width:36px;height:36px;border-radius:50%;
                              background-color:#2a2200;border:1px solid #d4af37;">
                        <img src="cid:locationIcon" width="16" height="16" style="display:block;" alt="Location"/>
                      </td>
                    </tr>
                  </table>
                </td></tr>
                <tr><td align="center"
                  style="font-size:12px;color:#cccccc;font-weight:500;font-family:Arial,sans-serif;">
                  ${GYM_ADDRESS}
                </td></tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Social icons -->
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 18px;">
          <tr>
            <!-- Facebook -->
            <td style="padding:0 7px;">
              <a href="#" style="text-decoration:none;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" valign="middle"
                      style="width:42px;height:42px;border-radius:10px;
                            background-color:#2a2200;border:1px solid #d4af37;">
                      <img src="cid:facebookIcon" width="18" height="18" style="display:block;" alt="Facebook"/>
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
                            background-color:#2a2200;border:1px solid #d4af37;">
                      <img src="cid:instagramIcon" width="18" height="18" style="display:block;" alt="Instagram"/>
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
                            background-color:#2a2200;border:1px solid #d4af37;">
                      <img src="cid:twitterIcon" width="18" height="18" style="display:block;" alt="Twitter"/>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
            <!-- WhatsApp -->
            <td style="padding:0 7px;">
              <a href="#" style="text-decoration:none;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" valign="middle"
                      style="width:42px;height:42px;border-radius:10px;
                            background-color:#2a2200;border:1px solid #d4af37;">
                      <img src="cid:whatsappIcon" width="18" height="18" style="display:block;" alt="WhatsApp"/>
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
              style="font-size:12px;color:#888888;letter-spacing:0.5px;font-family:Arial,sans-serif;">
              &copy; ${new Date().getFullYear()} ${GYM_NAME}. All Rights Reserved.
            </td>
          </tr>
        </table>

      </td>
    </tr>

  </table>
  </td></tr>
  </table>
  </body>
  </html>`;

    const info = await transporter.sendMail({
      from:    `"${GYM_NAME}" <${process.env.SMTP_EMAIL}>`,
      to:      member.email,
      subject: `Membership Activated - Welcome to ${GYM_NAME}!`,
      html,
      attachments: [
        {
          filename: 'membership-activated.png',
          path: path.join(ASSETS_DIR, 'membership activated (1).png'),
          cid: 'membershipActivatedIcon',
        },
        {
          filename: 'member-summary.png',
          path: path.join(ASSETS_DIR, 'MEMBER SUMMARY.png'),
          cid: 'membershipDetailsIcon',
        },
        {
          filename: 'logo.png',
          path: path.join(ASSETS_DIR, 'Lifetime  fitness image.png'),
          cid: 'lifetimeFitnessLogo',
        },
        {
          filename: 'billing-summary.png',
          path: path.join(ASSETS_DIR, 'billing summary.png'),
          cid: 'billingSummaryIcon',
        },
        {
          filename: 'member-info.png',
          path: path.join(ASSETS_DIR, 'MEMBER INFO.png'),
          cid: 'memberInfoIcon',
        },
        {
          filename: 'location.png',
          path: path.join(ASSETS_DIR, 'Location.png'),
          cid: 'locationIcon',
        },
        {
          filename: 'facebook.png',
          path: path.join(ASSETS_DIR, 'facebook.png'),
          cid: 'facebookIcon',
        },
        {
          filename: 'instagram.png',
          path: path.join(ASSETS_DIR, 'instagram.png'),
          cid: 'instagramIcon',
        },
        {
          filename: 'twitter.png',
          path: path.join(ASSETS_DIR, 'twitter.png'),
          cid: 'twitterIcon',
        },
        {
          filename: 'whatsapp.png',
          path: path.join(ASSETS_DIR, 'whatsapp.png'),
          cid: 'whatsappIcon',
        },
        {
          filename: 'gmail.png',
          path: path.join(ASSETS_DIR, 'gmail.png'),
          cid: 'gmailIcon',
        },
        {
          filename: 'phone.png',
          path: path.join(ASSETS_DIR, 'phone.png'),
          cid: 'phoneIcon',
        },
      ],
    });

    log(FN, 'log', '✅ Email sent successfully', {
      to: member.email, memberId: member.memberId, messageId: info.messageId,
    });
    return info;
  };

  // ─────────────────────────────────────────
  // EXPORTS
  // ─────────────────────────────────────────
  const sendEmail = sendOTPEmail;
  module.exports = sendEmail;
  module.exports.sendOTPEmail = sendOTPEmail;
  module.exports.sendMembershipConfirmationEmail = sendMembershipConfirmationEmail;