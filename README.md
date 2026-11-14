# Ala Salem portfolio

A React front end (`public/index.html`, React 18 from a CDN) served by a small Node.js backend (`server.js`, no npm packages). Visitors can send you a message from the contact form. You get it by email and it is also saved in `data/messages.jsonl`.

## 1. Run it on your computer

```bash
node server.js          # then open http://localhost:3000
```

Node 18 or newer. No `npm install` needed.

## 2. Get messages in your email

Copy `.env.example` to `.env` and fill it in. Choose ONE of these:

**Option A: Resend (recommended, works on any host)**
1. Sign up at https://resend.com with **alasalem0@gmail.com** (use this exact address).
2. Create an API key.
3. In `.env`: `RESEND_API_KEY=re_...` and `MAIL_TO=alasalem0@gmail.com`.

Resend's free test sender can only deliver to the email you signed up with, which is exactly what you need (messages to yourself).

**Option B: Gmail SMTP (fine on your own computer, blocked on many free hosts)**
1. Turn on 2-Step Verification for your Google account.
2. Create an App password at https://myaccount.google.com/apppasswords.
3. In `.env`: `SMTP_USER=alasalem0@gmail.com`, `SMTP_PASS=<the 16 characters>`, `MAIL_TO=alasalem0@gmail.com`.

Start the server and it prints `Email notifications: ON via ...`. Test it without the form:

```bash
# set ADMIN_TOKEN in .env first, then:
curl -X POST -H "x-admin-token: YOUR_TOKEN" http://localhost:3000/api/test-email
```

Replying to the email goes straight to the visitor (their address is the Reply-To). If email fails, the message is still saved in `data/messages.jsonl`.

## 3. Put it online and add it to LinkedIn

You need a public web address. Render has a free plan and works with this project (`render.yaml` is included).

1. Create a free GitHub repository and upload this folder (the `.gitignore` keeps your `.env` private):
   ```bash
   git init && git add . && git commit -m "portfolio"
   git branch -M main
   git remote add origin https://github.com/alasalem1/ala-salem-portfolio.git
   git push -u origin main
   ```
2. On https://render.com choose **New > Blueprint**, pick the repository. Render reads `render.yaml`.
3. When asked, enter `RESEND_API_KEY`. After the first deploy, set `SITE_URL` to your site address (for example `https://ala-salem-portfolio.onrender.com`) and redeploy. `ADMIN_TOKEN` is generated for you; find it in the service's Environment tab.
4. Open the site. Send yourself a test message. Check your inbox.

Notes:
- Render's free plan blocks Gmail SMTP, so use Option A there.
- A free Render service goes to sleep when nobody visits, and the first visit afterwards can take about a minute. A paid plan or another host avoids that.
- On the free plan the `data/` folder is erased on each restart or deploy. Your email inbox is the permanent record of messages.

**LinkedIn**
- Profile > **Contact info** (pencil icon) > **Website** > add your URL, type "Portfolio".
- Or **Add profile section > Featured > Links** and paste the URL. LinkedIn shows the preview card with your name, role and image (set up in `index.html` and `public/og.png`).
- If the preview looks old after changes, refresh it at https://www.linkedin.com/post-inspector/.

## API

| Method | Path              | What it does |
| ------ | ----------------- | ------------ |
| POST   | `/api/contact`    | Body `{ name, email, message }`. Validates, saves, emails you. 5 messages per IP per 10 minutes. |
| GET    | `/api/messages`   | Header `x-admin-token`. Lists saved messages, newest first. |
| POST   | `/api/test-email` | Header `x-admin-token`. Sends a test email. |
| GET    | `/api/health`     | `{ "ok": true, "email": true|false }` |

## Files

- `server.js` backend: static files, contact API, email (Resend or SMTP).
- `public/index.html` the site, already built. `public/og.png` is the LinkedIn preview image.
- `src/app.jsx` readable React source (Loader, Wipe, Marquee, Shell, Hero, Skills, Projects, About, Resume, Contact).
- `.env.example` settings template. `render.yaml` Render blueprint.

To change the React source and rebuild, compile it with esbuild and paste the output into the `<script>` block of `public/index.html`:

```bash
npx esbuild src/app.jsx --jsx=transform --jsx-factory=React.createElement --jsx-fragment=React.Fragment --outfile=app.js
```

The photo and CV are embedded as `__PHOTO__` and `__CVPDF__` placeholders in the source and as base64 in the built page.
