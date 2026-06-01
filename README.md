# MU6 – Music Discovery Platform

> Discover your next favorite sound. A next-generation music discovery platform built for Cloudflare Pages.

---

## 🚀 Deploy to Cloudflare Pages (5 minutes)

### Option A – Cloudflare Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial MU6 commit"
   gh repo create mu6 --public --push
   ```

2. **Connect to Cloudflare Pages**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Pages** → **Create a project**
   - Connect your GitHub repo
   - Build settings:
     - **Framework preset:** None
     - **Build command:** *(leave empty)*
     - **Build output directory:** `/` (root)
   - Click **Save and Deploy**

3. **Create KV Namespace**
   ```bash
   npm install
   npx wrangler kv:namespace create "MU6_DATA"
   npx wrangler kv:namespace create "MU6_DATA" --preview
   ```
   Copy the namespace IDs printed and update `wrangler.toml`:
   ```toml
   [[kv_namespaces]]
   binding = "MU6_DATA"
   id = "YOUR_KV_NAMESPACE_ID"
   preview_id = "YOUR_KV_PREVIEW_NAMESPACE_ID"
   ```

4. **Bind KV in Cloudflare Dashboard**
   - Pages project → **Settings** → **Functions** → **KV namespace bindings**
   - Add binding: Variable name = `MU6_DATA`, KV namespace = the one you created

5. **Redeploy** – your site is live with a real backend!

---

### Option B – Wrangler CLI

```bash
npm install
npx wrangler pages deploy .
```

---

## 🛠 Local Development

```bash
npm install
npm run dev
# Opens at http://localhost:3000
```

When running locally, the app automatically falls back to **localStorage** for all data — no KV setup needed.

---

## 📁 Project Structure

```
mu6/
├── index.html              # Homepage
├── discover.html           # Discovery engine
├── artists.html            # Artists + artist detail
├── playlists.html          # Playlists
├── community.html          # Reviews + discussions
├── dashboard.html          # User dashboard
├── css/
│   └── style.css           # All styles
├── js/
│   ├── data.js             # Static data + MU6Store (localStorage)
│   ├── api.js              # API client (KV when deployed, localStorage locally)
│   ├── app.js              # Main app logic + shared UI
│   └── discover.js         # Discovery page logic
├── functions/
│   └── api/
│       └── [[route]].js    # Cloudflare Pages Function (all /api/* routes)
├── sw.js                   # Service Worker (offline support)
├── _headers                # Cloudflare security headers
├── _redirects              # Cloudflare routing rules
├── wrangler.toml           # Cloudflare config
└── package.json
```

---

## 🔌 API Reference

All endpoints are at `/api/*` and handled by `functions/api/[[route]].js`.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/stats` | Site statistics |
| GET | `/api/search?q=` | Search all content |
| GET/POST | `/api/artists` | List / create artists |
| GET | `/api/artists/:id` | Get artist |
| GET/POST | `/api/songs` | List / create songs |
| GET/POST | `/api/albums` | List / create albums |
| GET/POST | `/api/playlists` | List / create playlists |
| POST | `/api/playlists/:id/songs` | Add song to playlist |
| GET/POST | `/api/reviews` | List / create reviews |
| GET/POST | `/api/discussions` | List / create discussions |
| POST | `/api/follows` | Toggle follow artist |
| POST | `/api/favorites` | Toggle favorite song |
| GET | `/api/genre-counts` | Genre track counts |

**Authentication:** Pass `Authorization: Bearer <token>` header. Token is returned on login/register.

---

## 🎨 Features

- **Dark glassmorphism UI** with purple/cyan accent colors
- **Particle animation** hero section
- **Discovery engine** – genre, mood, era, color, random, hidden gems
- **Interactive genre map**
- **User accounts** – register, login, dashboard
- **Artists** – add with streaming links (Spotify, Apple Music, YouTube, etc.)
- **Songs** – streaming links only (no audio uploads)
- **Albums** – with community ratings
- **Playlists** – create and manage
- **Reviews** – star ratings + written reviews
- **Discussions** – community forum
- **Service Worker** – offline support
- **Cloudflare KV** – global edge data storage
- **Cloudflare Pages Functions** – serverless API

---

## 🔒 Security

- Security headers via `_headers` (CSP, HSTS, X-Frame-Options, etc.)
- Input sanitization (HTML escaping)
- Auth token required for all write operations
- CORS configured for API routes

---

## 📝 Notes

- **Passwords** are currently stored as base64 (demo only). For production, use a proper hashing library via a Cloudflare Worker binding (e.g., `bcryptjs` via a Durable Object or external auth service like Clerk/Auth0).
- **KV storage** is eventually consistent. For high-write scenarios, consider Cloudflare D1 (SQLite) or Durable Objects.
- The `_redirects` file serves `index.html` for all unmatched routes (SPA behavior).

---

## 📄 License

MIT © 2026 MU6
