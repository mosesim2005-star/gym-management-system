'use strict';

/**
 * assetToDataURI.js
 * ─────────────────────────────────────────────────────────────
 * Reads image files from a local assets/ folder and converts
 * them to Base64 Data URIs for embedding inside HTML emails.
 *
 * Why embed as Base64?
 *   • No external hosting required
 *   • Works on Render, Railway, Heroku — any Node.js host
 *   • Images survive email forwarding
 *   • No blocked-image warnings from "remote content"
 *
 * Limitation:
 *   Gmail clips emails > ~102 KB total HTML size.
 *   Keep total email HTML under 80 KB to be safe.
 *   Prefer small, optimised PNGs (< 30 KB each).
 * ─────────────────────────────────────────────────────────────
 */

const fs   = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────
// MIME TYPE MAP
// Maps file extensions → correct MIME type string
// ─────────────────────────────────────────────────────────────
const MIME_MAP = {
  png:  'image/png',
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  gif:  'image/gif',
  webp: 'image/webp',
  svg:  'image/svg+xml',
};

// ─────────────────────────────────────────────────────────────
// SVG FALLBACK ICONS
// Returned when an image file is missing or fails to load.
// These are tiny inline SVGs — no external dependencies.
// ─────────────────────────────────────────────────────────────
const SVG_FALLBACKS = {
  logo: `<svg width="120" height="40" viewBox="0 0 120 40"
           xmlns="http://www.w3.org/2000/svg">
           <rect width="120" height="40" rx="6" fill="#d4af37"/>
           <text x="60" y="26" text-anchor="middle"
             font-family="Arial" font-size="14"
             font-weight="bold" fill="#000">GYM</text>
         </svg>`,

  badge: `<svg width="60" height="60" viewBox="0 0 60 60"
            xmlns="http://www.w3.org/2000/svg">
            <circle cx="30" cy="30" r="28"
              fill="#2a2200" stroke="#d4af37" stroke-width="2"/>
            <path d="M18 30 l8 8 l16-16"
              stroke="#d4af37" stroke-width="3"
              stroke-linecap="round" fill="none"/>
          </svg>`,

  icon: `<svg width="24" height="24" viewBox="0 0 24 24"
           xmlns="http://www.w3.org/2000/svg">
           <circle cx="12" cy="12" r="10"
             fill="#2a2200" stroke="#d4af37" stroke-width="1.5"/>
           <path d="M8 12 l3 3 l5-5"
             stroke="#d4af37" stroke-width="2"
             stroke-linecap="round" fill="none"/>
         </svg>`,
};

// ─────────────────────────────────────────────────────────────
// CORE FUNCTION: assetToDataURI
//
// @param {string} filename   - Filename inside backend/assets/
// @param {string} [fallback] - Key from SVG_FALLBACKS ('logo'|'badge'|'icon')
//                              or a custom SVG string
// @returns {string}          - Base64 data URI  OR  SVG fallback string
// ─────────────────────────────────────────────────────────────
const assetToDataURI = (filename, fallback = 'icon') => {

  // ── Step 1: Build the full absolute path ──
  // __dirname = directory of THIS file (backend/utils/)
  // '../assets/' = backend/assets/
  const filePath = path.join(__dirname, '..', 'assets', filename);

  // ── Step 2: Check if file exists before trying to read ──
  if (!fs.existsSync(filePath)) {
    console.warn(`[assetToDataURI] ⚠ File not found: ${filePath}`);
    // Return SVG fallback so email still renders cleanly
    return SVG_FALLBACKS[fallback] || SVG_FALLBACKS.icon;
  }

  try {
    // ── Step 3: Read raw binary content ──
    const fileBuffer = fs.readFileSync(filePath);

    // ── Step 4: Encode to Base64 string ──
    const base64String = fileBuffer.toString('base64');

    // ── Step 5: Detect MIME type from file extension ──
    const ext      = path.extname(filename).toLowerCase().replace('.', '');
    const mimeType = MIME_MAP[ext];

    if (!mimeType) {
      console.warn(`[assetToDataURI] ⚠ Unsupported file type: .${ext}`);
      return SVG_FALLBACKS[fallback] || SVG_FALLBACKS.icon;
    }

    // ── Step 6: Return complete Data URI ──
    // Format: data:<mime-type>;base64,<base64-encoded-content>
    return `data:${mimeType};base64,${base64String}`;

  } catch (err) {
    // ── Step 7: Graceful error — never crash the email ──
    console.error(`[assetToDataURI] ✗ Failed to load "${filename}":`, err.message);
    return SVG_FALLBACKS[fallback] || SVG_FALLBACKS.icon;
  }
};

// ─────────────────────────────────────────────────────────────
// HELPER: imgTag
//
// Smart wrapper around assetToDataURI.
// • If asset loads → returns <img src="data:..."> tag
// • If asset missing → returns inline <svg> fallback tag
//
// This means your template ALWAYS renders something visible,
// even on a fresh server where assets aren't uploaded yet.
//
// @param {string} filename   - Filename in assets/
// @param {object} opts       - { alt, width, height, style, fallback }
// @returns {string}          - HTML string ready to drop into a template
// ─────────────────────────────────────────────────────────────
const imgTag = (filename, opts = {}) => {
  const {
    alt      = '',
    width    = '',
    height   = '',
    style    = 'display:block;',
    fallback = 'icon',
  } = opts;

  const uri = assetToDataURI(filename, fallback);

  // If it starts with 'data:' it's a real image — use <img>
  if (uri.startsWith('data:')) {
    const w = width  ? `width="${width}"`   : '';
    const h = height ? `height="${height}"` : '';
    return `<img src="${uri}" alt="${alt}" ${w} ${h} border="0"
                 style="${style}" />`;
  }

  // Otherwise it's an SVG string — return it directly
  return uri;
};

// ─────────────────────────────────────────────────────────────
// EXAMPLE: buildSampleEmail
//
// Demonstrates how to use imgTag() inside a Nodemailer template.
// Compatible with Gmail (mobile + desktop), Outlook, Apple Mail.
//
// Key rules for Gmail mobile rendering:
//   1. Use table-based layout (not divs/flexbox)
//   2. Inline all CSS — no <style> blocks
//   3. Keep total HTML under ~80 KB to avoid "View entire message"
//   4. Use width="600" on outer table, not CSS max-width only
// ─────────────────────────────────────────────────────────────
const buildSampleEmail = ({ name = 'Member', logoFile = 'logo.png' } = {}) => {
  // Load logo — falls back to SVG text logo if file missing
  const logoHTML = imgTag(logoFile, {
    alt:      'Gym Logo',
    width:    '180',
    style:    'display:block;margin:0 auto;',
    fallback: 'logo',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Welcome</title>
</head>
<body style="margin:0;padding:0;background:#111111;">

  <!--
    OUTER WRAPPER TABLE
    Gmail needs a full-width wrapper to honour background colours.
  -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         bgcolor="#111111">
    <tr>
      <td align="center" style="padding:24px 12px;">

        <!--
          INNER EMAIL TABLE (max 600px)
          Hard-coded width + max-width covers both desktop and mobile.
        -->
        <table width="600" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;width:100%;background:#1a1a1a;
                      border-radius:14px;overflow:hidden;
                      border:2px solid #d4af37;">

          <!-- LOGO ROW -->
          <tr>
            <td align="center" bgcolor="#1a1a1a"
                style="padding:28px 32px 20px;">
              ${logoHTML}
            </td>
          </tr>

          <!-- HEADLINE ROW -->
          <tr>
            <td align="center" bgcolor="#1a1a1a"
                style="padding:0 32px 28px;border-bottom:1px solid #d4af37;">
              <p style="margin:0;font-family:Arial,sans-serif;
                        font-size:26px;font-weight:900;
                        letter-spacing:3px;color:#d4af37;
                        text-transform:uppercase;">
                Welcome, ${name}!
              </p>
              <p style="margin:10px 0 0;font-family:Arial,sans-serif;
                        font-size:14px;color:#cccccc;line-height:1.7;">
                Your membership is now <strong style="color:#ffffff;">active</strong>.
                We are excited to have you on board.
              </p>
            </td>
          </tr>

          <!-- CTA ROW -->
          <tr>
            <td align="center" bgcolor="#1a1a1a"
                style="padding:28px 32px;">
              <a href="#"
                 style="display:inline-block;padding:14px 44px;
                        background:#d4af37;border-radius:50px;
                        font-family:Arial,sans-serif;font-size:13px;
                        font-weight:800;letter-spacing:2px;
                        color:#000000;text-decoration:none;
                        text-transform:uppercase;">
                VISIT THE GYM
              </a>
            </td>
          </tr>

          <!-- FOOTER ROW -->
          <tr>
            <td align="center" bgcolor="#111111"
                style="padding:18px 32px;border-top:1px solid #d4af37;">
              <p style="margin:0;font-family:Arial,sans-serif;
                        font-size:11px;color:#888888;">
                &copy; ${new Date().getFullYear()} Lifetime Fitness.
                All Rights Reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
};

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────
module.exports = {
  assetToDataURI,   // Core: filename → Base64 data URI or SVG string
  imgTag,           // Helper: filename → ready-to-use HTML tag
  buildSampleEmail, // Example: full email HTML string
  SVG_FALLBACKS,    // Exported so you can customise fallbacks
};