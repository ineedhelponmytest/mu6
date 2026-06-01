# MU6 – Music Discovery Platform

> Discover your next favorite sound. A next-generation music discovery platform built for Cloudflare Pages.

---

## 🚀 Deploy to Cloudflare Pages

### **Option A – Cloudflare Dashboard (Recommended for Production)**

#### Step 1: Prepare Your Repository

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial MU6 commit"

# Create a new GitHub repo and push
gh repo create mu6 --public --source=. --remote=origin --push
```

> **Note:** If you don't have `gh` CLI, create a repo manually on [github.com](https://github.com/new) and push:
> ```bash
> git remote add origin https://github.com/YOUR_USERNAME/mu6.git
> git branch -M main
> git push -u origin main
> ```

#### Step 2: Connect to Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Select **Pages** from the left sidebar
3. Click **Create a project** → **Connect to Git**
4. Authorize GitHub and select your `mu6` repository
5. Configure build settings:
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/` (root)
6. Click **Save and Deploy**

Cloudflare will automatically deploy your site. You'll get a URL like `mu6.pages.dev`.

#### Step 3: Create Cloudflare KV Namespace

KV is Cloudflare's edge key-value store. It's optional but recommended for storing user data, reviews, playlists, etc.

```bash
# Install Wrangler (Cloudflare CLI)
npm install -D wrangler

# Create production KV namespace
npx wrangler kv:namespace create "MU6_DATA"
# Output: ✓ Created namespace with ID: abc123def456...

# Create preview KV namespace (for testing)
npx wrangler kv:namespace create "MU6_DATA" --preview
# Output: ✓ Created namespace with ID: xyz789uvw012...
```

Copy both IDs and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "MU6_DATA"
id = "abc123def456..."
preview_id = "xyz789uvw012..."
```

#### Step 4: Bind KV in Cloudflare Dashboard

1. Go to your Pages project → **Settings** → **Functions**
2. Under **KV namespace bindings**, click **Add binding**
3. Set:
   - **Variable name:** `MU6_DATA`
   - **KV namespace:** Select the namespace you created
4. Click **Save**

#### Step 5: Redeploy

Push a new commit to trigger a redeploy:

```bash
git commit --allow-empty -m "Trigger redeploy with KV binding"
git push
```

Your site is now live with a real backend! 🎉

---

### **Option B – Wrangler CLI (Quick Deploy)**

For rapid testing or if you prefer CLI:

```bash
npm install -D wrangler

# Deploy directly to Cloudflare Pages
npx wrangler pages deploy .
```

This uploads your entire project to Cloudflare Pages without needing GitHub.

---

### **Option C – Local Testing Before Deploy**

Test everything locally first:

```bash
npm install
npm run dev
# Opens at http://localhost:3000
```

The app uses **localStorage** locally, so no KV setup needed for testing.

---

### **Deployment Checklist**

- [ ] Repository pushed to GitHub
- [ ] Cloudflare Pages project created and connected
- [ ] Build settings configured (no build command, root output)
- [ ] KV namespace created (optional but recommended)
- [ ] KV binding added in Pages Settings
- [ ] Site deployed and accessible at `*.pages.dev`
- [ ] Test login/register functionality
- [ ] Test creating playlists and reviews
- [ ] Check browser console for errors
- [ ] Verify Service Worker is registered (offline support)

---

### **Troubleshooting Deployment**

| Issue | Solution |
|-------|----------|
| **Build fails** | Check that build command is empty and output directory is `/` |
| **API returns 404** | Ensure `functions/api/[[route]].js` exists and KV binding is configured |
| **Data not persisting** | Verify KV namespace binding in Pages Settings → Functions |
| **CORS errors** | Check `_headers` file has correct CORS headers |
| **Service Worker not working** | Ensure site is served over HTTPS (Cloudflare Pages is always HTTPS) |
| **Stuck on old version** | Hard refresh (Ctrl+Shift+R) or clear browser cache |

---

### **Environment Variables (Optional)**

If you need environment variables (e.g., API keys), add them in Pages Settings:

1. Pages project → **Settings** → **Environment variables**
2. Add variables for production and preview environments
3. Access in your code via `process.env.VARIABLE_NAME`

Example for external APIs:
```bash
SPOTIFY_API_KEY=your_key_here
APPLE_MUSIC_API_KEY=your_key_here
```

Then in `functions/api/[[route]].js`:
```javascript
const spotifyKey = env.SPOTIFY_API_KEY;
```

---

### **Custom Domain (Optional)**

To use your own domain instead of `*.pages.dev`:

1. Pages project → **Custom domains**
2. Add your domain
3. Update DNS records as instructed
4. Cloudflare will auto-provision SSL certificate

---

### **Monitoring & Analytics**

After deployment, monitor your site:

1. **Pages Analytics** – Pages project → **Analytics**
   - View requests, errors, and performance
2. **Real User Monitoring (RUM)** – Cloudflare dashboard → **Analytics**
   - See actual user performance metrics
3. **Error Tracking** – Check browser console in DevTools
   - Look for API errors, missing resources, etc.

---

### **Next Steps After Deployment**

1. **Add custom domain** (optional)
2. **Set up email notifications** for deployment failures
3. **Configure rate limiting** if you expect high traffic
4. **Enable caching** for static assets (already done via `_headers`)
5. **Set up monitoring** for uptime and performance
6. **Migrate to D1** if you need SQL database (instead of KV)
7. **Add authentication** via Clerk, Auth0, or similar for production

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
