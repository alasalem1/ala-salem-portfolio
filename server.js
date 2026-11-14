'use strict';
/**
 * Portfolio backend: static hosting + contact API + email notifications.
 * Node 18+, no npm packages.
 *
 *   POST /api/contact     { name, email, message }  -> saves to data/messages.jsonl and emails you
 *   GET  /api/messages    header x-admin-token      -> lists saved messages (needs ADMIN_TOKEN)
 *   POST /api/test-email  header x-admin-token      -> sends a test email so you can check your SMTP settings
 *   GET  /api/health
 *
 * Settings come from environment variables or a .env file next to this file (see .env.example).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const tls = require('tls');

// ---------- .env loader (no dependency) ----------
try {
  const txt = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
} catch (e) { /* no .env file, that is fine */ }

const PORT = Number(process.env.PORT) || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const FILE = path.join(DATA_DIR, 'messages.jsonl');
const MAX_BODY = 10 * 1024;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

const MAIL = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  user: process.env.SMTP_USER || '',
  pass: (process.env.SMTP_PASS || '').replace(/\s+/g, ''), // Gmail shows app passwords with spaces
  to: process.env.MAIL_TO || 'alasalem0@gmail.com',
  insecure: process.env.SMTP_INSECURE_TLS === '1', // for local tests only
};
MAIL.from = process.env.MAIL_FROM || MAIL.user;
// Option B: Resend (HTTPS API). Works on hosts that block SMTP, such as Render's free plan.
const RESEND = {
  key: process.env.RESEND_API_KEY || '',
  url: process.env.RESEND_API_URL || 'https://api.resend.com/emails',
  from: process.env.RESEND_FROM || 'Portfolio <onboarding@resend.dev>',
};
const smtpReady = () => !!(MAIL.user && MAIL.pass && MAIL.from);
const mailReady = () => !!RESEND.key || smtpReady();
const mailMode = () => (RESEND.key ? 'Resend' : smtpReady() ? 'Gmail SMTP' : 'off');

fs.mkdirSync(DATA_DIR, { recursive: true });

// ---------- tiny SMTP client (implicit TLS, port 465, AUTH LOGIN) ----------
const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');
const oneLine = (s) => String(s).replace(/[\r\n]+/g, ' ').trim();
const encWord = (s) => (/^[\x20-\x7E]*$/.test(s) ? s : '=?UTF-8?B?' + b64(s) + '?=');
const addrName = (s) => encWord(oneLine(s).replace(/[<>",]/g, '').slice(0, 80) || 'Visitor');

function buildMessage({ from, to, replyTo, replyName, subject, text }) {
  const body = Buffer.from(text, 'utf8').toString('base64').replace(/(.{76})/g, '$1\r\n');
  return [
    'From: ' + encWord('Portfolio contact form') + ' <' + from + '>',
    'To: <' + to + '>',
    replyTo ? 'Reply-To: ' + addrName(replyName) + ' <' + replyTo + '>' : null,
    'Subject: ' + encWord(oneLine(subject).slice(0, 150)),
    'Date: ' + new Date().toUTCString(),
    'Message-ID: <' + crypto.randomUUID() + '@portfolio.local>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    body,
  ].filter((l) => l !== null).join('\r\n');
}

function smtpSend(msg) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host: MAIL.host, port: MAIL.port, servername: MAIL.host, rejectUnauthorized: !MAIL.insecure });
    socket.setEncoding('utf8');
    let finished = false, buf = '', lines = [];
    const queue = []; let waiter = null;
    const timer = setTimeout(() => fail(new Error('SMTP timeout')), 15000);
    function fail(e) { if (finished) return; finished = true; clearTimeout(timer); socket.destroy(); reject(e); }
    function succeed() { if (finished) return; finished = true; clearTimeout(timer); socket.end(); resolve(); }
    socket.on('error', fail);
    socket.on('close', () => fail(new Error('SMTP connection closed early')));
    socket.on('data', (d) => {
      buf += d;
      let i;
      while ((i = buf.indexOf('\r\n')) >= 0) {
        const line = buf.slice(0, i); buf = buf.slice(i + 2);
        lines.push(line);
        if (/^\d{3} /.test(line)) { // last line of a reply
          const reply = { code: Number(line.slice(0, 3)), text: lines.join(' | ') }; lines = [];
          if (waiter) { const w = waiter; waiter = null; w(reply); } else queue.push(reply);
        }
      }
    });
    const next = () => (queue.length ? Promise.resolve(queue.shift()) : new Promise((res) => { waiter = res; }));
    async function step(line, ok) {
      if (line !== null) socket.write(line + '\r\n');
      const r = await next();
      if (!ok.includes(r.code)) throw new Error('SMTP ' + r.text.slice(0, 200));
      return r;
    }
    (async () => {
      await step(null, [220]);
      await step('EHLO portfolio.local', [250]);
      await step('AUTH LOGIN', [334]);
      await step(b64(MAIL.user), [334]);
      await step(b64(MAIL.pass), [235]);
      await step('MAIL FROM:<' + msg.from + '>', [250]);
      await step('RCPT TO:<' + msg.to + '>', [250, 251]);
      await step('DATA', [354]);
      const data = buildMessage(msg).replace(/\r?\n/g, '\r\n').replace(/^\./gm, '..');
      await step(data + '\r\n.', [250]);
      try { socket.write('QUIT\r\n'); } catch (e) {}
      succeed();
    })().catch(fail);
  });
}

function notify(rec) {
  const text = [
    'You have a new message from your portfolio.',
    '',
    'Name:    ' + oneLine(rec.name),
    'Email:   ' + rec.email,
    'Time:    ' + rec.createdAt,
    '',
    rec.message,
    '',
    '(Reply to this email to answer ' + oneLine(rec.name) + ' directly.)',
  ].join('\n');
  const subject = 'Portfolio message from ' + oneLine(rec.name);
  if (RESEND.key) return resendSend({ to: MAIL.to, replyTo: rec.email, replyName: rec.name, subject, text });
  return smtpSend({ from: MAIL.from, to: MAIL.to, replyTo: rec.email, replyName: rec.name, subject, text });
}

async function resendSend({ to, replyTo, replyName, subject, text }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(RESEND.url, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + RESEND.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: RESEND.from, to: [to], reply_to: replyTo, subject: oneLine(subject).slice(0, 150), text }),
      signal: ctrl.signal,
    });
    if (!r.ok) {
      let msg = '';
      try { const j = await r.json(); msg = j.message || j.error || ''; } catch (e) {}
      throw new Error('Resend ' + r.status + (msg ? ': ' + String(msg).slice(0, 200) : ''));
    }
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Resend timeout');
    throw e;
  } finally { clearTimeout(timer); }
}

// ---------- http ----------
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf', '.ico': 'image/x-icon',
};

const hits = new Map(); // ip -> [timestamps]
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) { hits.set(ip, list); return true; }
  list.push(now); hits.set(ip, list); return false;
}
setInterval(() => { const now = Date.now(); for (const [ip, l] of hits) if (!l.some((t) => now - t < WINDOW_MS)) hits.delete(ip); }, WINDOW_MS).unref();

function send(res, status, body, headers = {}) {
  const isObj = typeof body === 'object' && !Buffer.isBuffer(body);
  const payload = isObj ? JSON.stringify(body) : body;
  res.writeHead(status, Object.assign({
    'Content-Type': isObj ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'no-store',
  }, headers));
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0, over = false; const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (over) return; // keep draining, store nothing
      if (size > MAX_BODY) { over = true; chunks.length = 0; reject(Object.assign(new Error('too large'), { status: 413 })); }
      else chunks.push(c);
    });
    req.on('end', () => { if (!over) resolve(Buffer.concat(chunks).toString('utf8')); });
    req.on('error', reject);
  });
}

function clean(v, max) { return typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max) : ''; }

function isAdmin(req) {
  const a = Buffer.from(String(req.headers['x-admin-token'] || '')), b = Buffer.from(ADMIN_TOKEN);
  return !!ADMIN_TOKEN && a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function contact(req, res) {
  const ip = req.socket.remoteAddress || 'unknown';
  if (limited(ip)) return send(res, 429, { error: 'Too many messages. Try again later.' });
  let data;
  try { data = JSON.parse(await readBody(req)); } catch (e) { return send(res, e.status || 400, { error: e.status === 413 ? 'Message too large.' : 'Invalid request.' }, e.status === 413 ? { Connection: 'close' } : {}); }
  if (!data || typeof data !== 'object') return send(res, 400, { error: 'Invalid request.' });
  if (data.website) return send(res, 200, { ok: true }); // honeypot: pretend success
  const name = clean(data.name, 80), email = clean(data.email, 120), message = clean(data.message, 2000);
  if (!name || message.length < 5 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return send(res, 422, { error: 'Name, a valid email and a message are required.' });
  const rec = { id: crypto.randomUUID(), name, email, message, createdAt: new Date().toISOString() };
  await fs.promises.appendFile(FILE, JSON.stringify(rec) + '\n', 'utf8'); // saved first, so nothing is lost if email fails
  let emailed = false;
  if (mailReady()) {
    try { await notify(rec); emailed = true; } catch (e) { console.error('Email notification failed:', e.message); }
  }
  send(res, 201, { ok: true, id: rec.id, emailed });
}

async function messages(req, res) {
  if (!isAdmin(req)) return send(res, 401, { error: 'Unauthorized.' });
  let text = '';
  try { text = await fs.promises.readFile(FILE, 'utf8'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const items = text.split('\n').filter(Boolean).map((l) => JSON.parse(l)).reverse();
  send(res, 200, { count: items.length, messages: items });
}

async function testEmail(req, res) {
  if (!isAdmin(req)) return send(res, 401, { error: 'Unauthorized.' });
  if (!mailReady()) return send(res, 400, { error: 'Email is not configured. Set RESEND_API_KEY, or SMTP_USER and SMTP_PASS, in .env.' });
  try {
    await notify({ name: 'Test', email: MAIL.to, message: 'This is a test email from your portfolio server. Email notifications work.', createdAt: new Date().toISOString() });
    send(res, 200, { ok: true, sentTo: MAIL.to });
  } catch (e) { send(res, 502, { ok: false, error: e.message }); }
}

function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, '');
  const proto = String(req.headers['x-forwarded-proto'] || 'http').split(',')[0].trim();
  return proto + '://' + (req.headers.host || 'localhost');
}

async function serveStatic(req, res, pathname) {
  let rel;
  try { rel = decodeURIComponent(pathname); } catch (e) { return send(res, 400, 'Bad request'); }
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR + path.sep)) return send(res, 403, 'Forbidden');
  try {
    const st = await fs.promises.stat(file);
    if (!st.isFile()) throw new Error('not file');
    if (path.basename(file) === 'index.html') {
      // fill in absolute URLs for link previews (LinkedIn, WhatsApp, Slack need them)
      const page = (await fs.promises.readFile(file, 'utf8')).replace(/__SITE_URL__/g, siteUrl(req));
      res.writeHead(200, { 'Content-Type': MIME['.html'], 'Content-Length': Buffer.byteLength(page), 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'public, max-age=300' });
      return req.method === 'HEAD' ? res.end() : res.end(page);
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Content-Length': st.size, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'public, max-age=300' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  } catch (e) { send(res, 404, 'Not found'); }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const p = url.pathname;
    if (p === '/api/health' && req.method === 'GET') return send(res, 200, { ok: true, email: mailReady() });
    if (p === '/api/contact') return req.method === 'POST' ? await contact(req, res) : send(res, 405, { error: 'Use POST.' }, { Allow: 'POST' });
    if (p === '/api/messages') return req.method === 'GET' ? await messages(req, res) : send(res, 405, { error: 'Use GET.' }, { Allow: 'GET' });
    if (p === '/api/test-email') return req.method === 'POST' ? await testEmail(req, res) : send(res, 405, { error: 'Use POST.' }, { Allow: 'POST' });
    if (p.startsWith('/api/')) return send(res, 404, { error: 'Not found.' });
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
    await serveStatic(req, res, p);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, 500, { error: 'Server error.' });
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log('Portfolio running on http://localhost:' + PORT);
    console.log(mailReady()
      ? 'Email notifications: ON via ' + mailMode() + ', messages are sent to ' + MAIL.to
      : 'Email notifications: OFF. Create a .env file (see .env.example).');
  });
}
module.exports = server;
