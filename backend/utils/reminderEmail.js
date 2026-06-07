// ─────────────────────────────────────────────────────────────
// reminderEmail.js
// Place: backend/utils/reminderEmail.js
// Generates premium renewal reminder HTML email
// ─────────────────────────────────────────────────────────────

const QUOTES = [
  'Success starts with self-discipline.',
  'The body achieves what the mind believes.',
  'Every workout counts — come back stronger.',
  'Your only limit is you.',
  'Push harder than yesterday if you want a different tomorrow.',
];

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

const buildRenewalEmailHTML = (member) => {
  const GYM_NAME    = process.env.GYM_NAME    || 'Lifetime Fitness';
  const GYM_PHONE   = process.env.GYM_PHONE   || '+91 98765 43210';
  const GYM_EMAIL   = process.env.GYM_EMAIL   || process.env.SMTP_EMAIL;
  const GYM_ADDRESS = process.env.GYM_ADDRESS || '123, Fitness Street, Chennai, Tamil Nadu - 600001';
  const GYM_WEBSITE = process.env.GYM_WEBSITE || '#';

  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  const gymWords = GYM_NAME.trim().split(' ');
  const gymFirst = gymWords.length > 1 ? gymWords.slice(0, -1).join(' ') : gymWords[0];
  const gymLast  = gymWords.length > 1 ? gymWords[gymWords.length - 1] : '';

  const daysSince = Math.max(
    0,
    Math.floor((Date.now() - new Date(member.expiryDate).getTime()) / (1000 * 60 * 60 * 24))
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Renew Your Membership - ${GYM_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#111111;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#111111">
<tr><td align="center" style="padding:20px 12px;">

<table width="600" cellpadding="0" cellspacing="0" border="0"
  style="max-width:600px;width:100%;background-color:#1a1a1a;border-radius:16px;
         overflow:hidden;border:2px solid #d4af37;">

  <!-- HEADER -->
  <tr>
    <td align="center" bgcolor="#1a1a1a"
      style="padding:36px 32px 28px;border-bottom:2px solid #d4af37;">
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px;">
        <tr>
          <td align="center" valign="middle" bgcolor="#d4af37"
            style="width:68px;height:68px;border-radius:16px;border:3px solid #f5c842;">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
              stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4v16M18 4v16M3 8h4M17 8h4M3 16h4M17 16h4"/>
            </svg>
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

  <!-- HERO -->
  <tr>
    <td align="center" bgcolor="#1e0000"
      style="padding:36px 32px 32px;border-bottom:2px solid #d4af37;">
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
        <tr>
          <td align="center" valign="middle"
            style="width:72px;height:72px;border-radius:50%;
                   background-color:#2a0000;border:3px solid #e00000;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#e00000" stroke-width="2"/>
              <path d="M12 8v5M12 16v.5" stroke="#e00000" stroke-width="2.5"
                stroke-linecap="round"/>
            </svg>
          </td>
        </tr>
      </table>
      <div style="font-size:32px;font-weight:900;letter-spacing:2px;
                  text-transform:uppercase;margin-bottom:16px;line-height:1.1;">
        <span style="color:#ffffff;">MEMBERSHIP&nbsp;</span><span style="color:#e00000;">EXPIRED!</span>
      </div>
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;width:280px;">
        <tr>
          <td style="height:3px;background-color:#d4af37;border-radius:2px;"></td>
          <td style="width:14px;" align="center" valign="middle">
            <div style="width:10px;height:10px;border-radius:50%;background-color:#d4af37;margin:0 4px;"></div>
          </td>
          <td style="height:3px;background-color:#d4af37;border-radius:2px;"></td>
        </tr>
      </table>
      <div style="font-size:20px;font-weight:700;color:#ffffff;margin-bottom:12px;">
        Hello ${member.fullName},
      </div>
      <div style="font-size:15px;color:#cccccc;line-height:1.8;max-width:440px;margin:0 auto;">
        Your <strong style="color:#d4af37;">${member.membershipName}</strong> membership<br/>
        expired on <strong style="color:#e00000;">${fmtDate(member.expiryDate)}</strong>
        ${daysSince > 0 ? `<br/><span style="color:#f5a623;">(${daysSince} day${daysSince !== 1 ? 's' : ''} ago)</span>` : ''}.
        <br/><br/>
        We miss you at <strong style="color:#d4af37;">${GYM_NAME}</strong>!<br/>
        Renew today and continue your fitness journey. 💪
      </div>
    </td>
  </tr>

  <!-- MEMBERSHIP SUMMARY -->
  <tr>
    <td bgcolor="#1a1a1a" style="padding:24px 24px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:#242424;border:1px solid #d4af37;border-radius:12px;overflow:hidden;">
        <tr>
          <td colspan="2" bgcolor="#2a2200"
            style="padding:14px 20px;border-bottom:1px solid #d4af37;">
            <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#d4af37;text-transform:uppercase;">
              Membership Summary
            </div>
          </td>
        </tr>
        <tr>
          <td width="50%" valign="top"
            style="padding:20px;border-right:1px solid #333333;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr><td style="padding-bottom:16px;">
                <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:#999999;text-transform:uppercase;margin-bottom:5px;">Membership Plan</div>
                <div style="font-size:15px;font-weight:700;color:#d4af37;">${member.membershipName}</div>
              </td></tr>
              <tr><td style="padding-bottom:16px;">
                <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:#999999;text-transform:uppercase;margin-bottom:5px;">Duration</div>
                <div style="font-size:15px;font-weight:600;color:#ffffff;">${member.membershipDuration}</div>
              </td></tr>
              <tr><td>
                <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:#999999;text-transform:uppercase;margin-bottom:5px;">Member ID</div>
                <div style="font-size:15px;font-weight:700;color:#d4af37;">${member.memberId}</div>
              </td></tr>
            </table>
          </td>
          <td width="50%" valign="top" style="padding:20px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr><td style="padding-bottom:16px;">
                <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:#999999;text-transform:uppercase;margin-bottom:5px;">Join Date</div>
                <div style="font-size:15px;font-weight:600;color:#ffffff;">${fmtDate(member.joinDate)}</div>
              </td></tr>
              <tr><td style="padding-bottom:16px;">
                <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:#999999;text-transform:uppercase;margin-bottom:5px;">Expired On</div>
                <div style="font-size:15px;font-weight:700;color:#e00000;">${fmtDate(member.expiryDate)}</div>
              </td></tr>
              <tr><td>
                <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:#999999;text-transform:uppercase;margin-bottom:5px;">Last Amount Paid</div>
                <div style="font-size:15px;font-weight:700;color:#d4af37;">Rs.${Number(member.membershipAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- MOTIVATIONAL QUOTE -->
  <tr>
    <td bgcolor="#1a1a1a" style="padding:20px 24px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:#1e1e00;border:1px solid #d4af37;border-radius:12px;">
        <tr>
          <td style="padding:20px 24px;">
            <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#d4af37;text-transform:uppercase;margin-bottom:10px;">
              💡 Fitness Motivation
            </div>
            <div style="font-size:16px;font-style:italic;color:#ffffff;line-height:1.6;">
              "${quote}"
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CTA -->
  <tr>
    <td bgcolor="#1a1a1a" align="center" style="padding:28px 24px 20px;">
      <div style="font-size:13px;color:#cccccc;margin-bottom:18px;line-height:1.7;">
        Contact us to renew your membership and pick up right where you left off.
      </div>
      <a href="${GYM_WEBSITE}"
        style="display:inline-block;padding:16px 52px;
               background-color:#d4af37;border-radius:50px;
               font-size:14px;font-weight:800;letter-spacing:3px;
               color:#000000;text-decoration:none;text-transform:uppercase;
               font-family:Arial,sans-serif;">
        RENEW MEMBERSHIP
      </a>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td bgcolor="#111111" style="padding:24px 32px 28px;border-top:2px solid #d4af37;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
        <tr>
          <td align="center" width="33%" style="padding:0 6px;border-right:1px solid #333;">
            <div style="font-size:12px;color:#cccccc;font-family:Arial,sans-serif;">📞 ${GYM_PHONE}</div>
          </td>
          <td align="center" width="33%" style="padding:0 6px;border-right:1px solid #333;">
            <div style="font-size:12px;color:#cccccc;word-break:break-all;font-family:Arial,sans-serif;">✉️ ${GYM_EMAIL}</div>
          </td>
          <td align="center" width="33%" style="padding:0 6px;">
            <div style="font-size:12px;color:#cccccc;font-family:Arial,sans-serif;">📍 ${GYM_ADDRESS}</div>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="font-size:12px;color:#888888;letter-spacing:0.5px;font-family:Arial,sans-serif;">
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
};

module.exports = buildRenewalEmailHTML;