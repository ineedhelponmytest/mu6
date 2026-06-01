/* ============================================================
   MU6 – Main App Logic
   ============================================================ */

/* ---- Particle Canvas ---- */
function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H, particles = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const COLORS = ["#8b5cf6","#06b6d4","#ec4899","#a78bfa","#22d3ee"];

  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.1,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
}

/* ---- Navbar scroll effect ---- */
function initNavbar() {
  const nav = document.getElementById("navbar");
  if (!nav) return;
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 20);
  });

  const hamburger = document.getElementById("hamburger");
  const navLinks = document.querySelector(".nav-links");
  const navActions = document.querySelector(".nav-actions");
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      navLinks && navLinks.classList.toggle("open");
      navActions && navActions.classList.toggle("open");
    });
  }
}

/* ---- Intersection Observer reveal ---- */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

/* ---- Tabs ---- */
function initTabs() {
  document.querySelectorAll(".tab-group").forEach(group => {
    group.querySelectorAll(".tab").forEach(tab => {
      tab.addEventListener("click", () => {
        group.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const target = tab.dataset.tab;
        document.querySelectorAll(".tab-content").forEach(c => {
          c.classList.toggle("active", c.id === "tab-" + target);
        });
      });
    });
  });

  document.querySelectorAll(".ptab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".ptab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderPlaylists(tab.dataset.ptab);
    });
  });
}

/* ---- Toast ---- */
function showToast(msg, type = "") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = "toast show" + (type ? " " + type : "");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = "toast"; }, 3200);
}

/* ---- Modals ---- */
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add("active");
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove("active");
}
function switchModal(from, to) {
  closeModal(from);
  setTimeout(() => openModal(to), 180);
}

document.addEventListener("click", e => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("active");
  }
});

/* ---- Auth handlers ---- */
function handleLogin(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('[type="email"]').value.trim();
  const password = form.querySelector('[type="password"]').value;
  const result = MU6Store.login({ email, password });
  if (result.ok) {
    closeModal("loginModal");
    showToast("Welcome back, " + result.user.username + "! 🎵", "success");
    updateAuthUI();
    form.reset();
  } else {
    showToast(result.error, "error");
  }
}

function handleSignup(e) {
  e.preventDefault();
  const form = e.target;
  const inputs = form.querySelectorAll("input");
  const username = inputs[0].value.trim();
  const email = inputs[1].value.trim();
  const password = inputs[2].value;
  if (password.length < 6) { showToast("Password must be at least 6 characters.", "error"); return; }
  const result = MU6Store.register({ username, email, password });
  if (result.ok) {
    closeModal("signupModal");
    showToast("Welcome to MU6, " + result.user.username + "! 🎉", "success");
    updateAuthUI();
    form.reset();
  } else {
    showToast(result.error, "error");
  }
}

function updateAuthUI() {
  const user = MU6Store.currentUser();
  const navActions = document.querySelector(".nav-actions");
  if (!navActions) return;
  if (user) {
    navActions.innerHTML = `
      <a href="dashboard.html" class="btn-ghost">Dashboard</a>
      <button class="btn-primary" onclick="handleLogout()">Log Out</button>
    `;
  } else {
    navActions.innerHTML = `
      <button class="btn-ghost" onclick="openModal('loginModal')">Log In</button>
      <button class="btn-primary" onclick="openModal('signupModal')">Sign Up</button>
    `;
  }
  updateSiteStats();
}

function handleLogout() {
  MU6Store.logout();
  showToast("Logged out. See you soon! 👋");
  updateAuthUI();
  if (window.location.pathname.includes("dashboard")) {
    window.location.href = "index.html";
  }
}

/* ---- Site stats (hero numbers) ---- */
function updateSiteStats() {
  const stats = MU6Store.getSiteStats();
  const artistEl = document.querySelector(".stat-num[data-stat='artists']");
  const trackEl  = document.querySelector(".stat-num[data-stat='tracks']");
  const plEl     = document.querySelector(".stat-num[data-stat='playlists']");
  if (artistEl) artistEl.textContent = formatCount(stats.artists);
  if (trackEl)  trackEl.textContent  = formatCount(stats.songs);
  if (plEl)     plEl.textContent     = formatCount(stats.playlists);
}

function formatCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M+";
  if (n >= 1000)    return (n / 1000).toFixed(1) + "K+";
  return n.toString();
}

function formatAvgRating(sum, count) {
  if (!count) return "—";
  return (sum / count).toFixed(1);
}

/* ---- Search ---- */
function handleSearch() {
  const q = document.getElementById("heroSearch")?.value.trim();
  if (!q) return;
  window.location.href = "discover.html?q=" + encodeURIComponent(q);
}

function quickSearch(term) {
  window.location.href = "discover.html?q=" + encodeURIComponent(term);
}

document.addEventListener("keydown", e => {
  if (e.key === "Enter" && document.activeElement?.id === "heroSearch") handleSearch();
});

/* ---- Render helpers ---- */
function renderStreamingLinks(links) {
  if (!links || !Object.keys(links).length) return "";
  return Object.entries(links).map(([platform, url]) => {
    const p = MU6Data.streamingPlatforms.find(x => x.id === platform);
    if (!p || !url) return "";
    return `<a href="${url}" target="_blank" rel="noopener" class="stream-link" title="${p.name}">${p.icon} ${p.name}</a>`;
  }).join("");
}

function renderStars(rating, max = 5) {
  let html = '<div class="review-stars">';
  for (let i = 1; i <= max; i++) {
    html += `<span class="star ${i <= rating ? "filled" : "empty"}">★</span>`;
  }
  return html + "</div>";
}

function renderEmptyState(icon, title, subtitle, actionHtml = "") {
  return `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${subtitle}</p>
      ${actionHtml}
    </div>`;
}

/* ---- Trending Artists ---- */
function renderTrendingArtists() {
  const grid = document.getElementById("trendingArtistsGrid");
  if (!grid) return;
  const artists = MU6Store.getArtists().slice(-8).reverse();
  if (!artists.length) {
    grid.innerHTML = renderEmptyState("🎤", "No artists yet", "Be the first to add an artist to MU6.",
      `<button class="btn-primary" onclick="openModal('loginModal')">Add Artist</button>`);
    return;
  }
  grid.innerHTML = artists.map(a => `
    <div class="card" onclick="window.location='artists.html?id=${a.id}'">
      <div class="card-image-placeholder" style="background:${getArtistGradient(a.id)}">${a.emoji}</div>
      <div class="card-body">
        <div class="card-title">${escHtml(a.name)}</div>
        <div class="card-sub">${escHtml((a.genres || []).join(", ") || "Unknown Genre")}</div>
        <div class="card-meta">
          <span class="card-badge">${formatCount(a.followers)} followers</span>
        </div>
      </div>
    </div>`).join("");
}

/* ---- Trending Songs ---- */
function renderTrendingSongs() {
  const list = document.getElementById("trendingSongsList");
  if (!list) return;
  const songs = MU6Store.getSongs().slice(-10).reverse();
  if (!songs.length) {
    list.innerHTML = renderEmptyState("🎵", "No songs yet", "Add the first song to MU6.",
      `<button class="btn-primary" onclick="openModal('loginModal')">Add Song</button>`);
    return;
  }
  list.innerHTML = songs.map((s, i) => `
    <div class="track-item">
      <span class="track-num">${i + 1}</span>
      <div class="track-art">${s.emoji}</div>
      <div class="track-info">
        <div class="track-name">${escHtml(s.title)}</div>
        <div class="track-artist">${escHtml(s.artistName)}</div>
      </div>
      <span class="track-duration">${s.duration || "—"}</span>
      <div class="track-actions">
        ${renderStreamingLinks(s.streamingLinks)}
        <button class="track-btn" onclick="toggleFav('${s.id}',this)" title="Save">${MU6Store.isFavorite(s.id) ? "❤️" : "🤍"}</button>
      </div>
    </div>`).join("");
}

/* ---- Trending Albums ---- */
function renderTrendingAlbums() {
  const grid = document.getElementById("trendingAlbumsGrid");
  if (!grid) return;
  const albums = MU6Store.getAlbums().slice(-8).reverse();
  if (!albums.length) {
    grid.innerHTML = renderEmptyState("💿", "No albums yet", "Add the first album to MU6.",
      `<button class="btn-primary" onclick="openModal('loginModal')">Add Album</button>`);
    return;
  }
  grid.innerHTML = albums.map(a => `
    <div class="card" onclick="window.location='artists.html?album=${a.id}'">
      <div class="card-image-placeholder" style="background:${getArtistGradient(a.id)}">${a.emoji}</div>
      <div class="card-body">
        <div class="card-title">${escHtml(a.title)}</div>
        <div class="card-sub">${escHtml(a.artistName)} · ${a.year}</div>
        <div class="card-meta">
          <span class="card-badge">⭐ ${formatAvgRating(a.ratingSum, a.ratingCount)}</span>
          <span class="card-trend">${a.trackCount} tracks</span>
        </div>
      </div>
    </div>`).join("");
}

/* ---- Discoveries ---- */
function renderDiscoveries() {
  const grid = document.getElementById("discoveriesGrid");
  if (!grid) return;
  const songs = MU6Store.getSongs().filter(s => s.plays < 100).slice(-6).reverse();
  if (!songs.length) {
    grid.innerHTML = renderEmptyState("💎", "No discoveries yet", "Add songs to start building the discovery feed.");
    return;
  }
  grid.innerHTML = songs.map(s => `
    <div class="discovery-card">
      <div class="discovery-art">${s.emoji}</div>
      <div class="discovery-info">
        <div class="discovery-title">${escHtml(s.title)}</div>
        <div class="discovery-sub">${escHtml(s.artistName)}</div>
        <span class="discovery-tag">Hidden Gem</span>
      </div>
    </div>`).join("");
}

/* ---- Genres ---- */
function renderGenres() {
  const grid = document.getElementById("genreGrid");
  if (!grid) return;
  const counts = MU6Store.getGenreCounts();
  grid.innerHTML = MU6Data.genres.map(g => `
    <div class="genre-card" style="background:${g.color}" onclick="window.location='discover.html?genre=${encodeURIComponent(g.name)}'">
      <span class="genre-emoji">${g.emoji}</span>
      <div class="genre-name">${g.name}</div>
      <div class="genre-count">${formatCount(counts[g.name] || 0)} tracks</div>
    </div>`).join("");
}

/* ---- Moods ---- */
function renderMoods() {
  const grid = document.getElementById("moodGrid");
  if (!grid) return;
  grid.innerHTML = MU6Data.moods.map(m => `
    <div class="mood-card" style="border-color:${m.color}22" onclick="window.location='discover.html?mood=${encodeURIComponent(m.name)}'">
      <div class="mood-emoji">${m.emoji}</div>
      <div class="mood-name">${m.name}</div>
      <div class="mood-desc">${m.desc}</div>
    </div>`).join("");
}

/* ---- Playlists ---- */
function renderPlaylists(category = "curated") {
  const grid = document.getElementById("playlistsGrid");
  if (!grid) return;
  const all = MU6Store.getPlaylists();
  const filtered = category === "curated"
    ? all.filter(p => p.category === "curated")
    : category === "community"
    ? all.filter(p => p.category === "community")
    : category === "newreleases"
    ? all.slice(-4).reverse()
    : all.filter(p => p.category === "genre");

  if (!filtered.length) {
    grid.innerHTML = renderEmptyState("🎧", "No playlists yet",
      "Create the first playlist in this category.",
      `<a href="playlists.html" class="btn-primary">Create Playlist</a>`);
    return;
  }
  grid.innerHTML = filtered.slice(0, 8).map(p => {
    const songs = MU6Store.getSongs().filter(s => p.songs.includes(s.id)).slice(0, 4);
    const cells = [0,1,2,3].map(i => `<div class="playlist-cover-cell">${songs[i] ? songs[i].emoji : "🎵"}</div>`).join("");
    return `
      <div class="playlist-card" onclick="window.location='playlists.html?id=${p.id}'">
        <div class="playlist-cover">${cells}</div>
        <div class="playlist-body">
          <div class="playlist-title">${escHtml(p.title)}</div>
          <div class="playlist-meta">
            <span>${p.songs.length} tracks</span>
            <span class="playlist-dot"></span>
            <span>by ${escHtml(p.ownerName)}</span>
          </div>
        </div>
      </div>`;
  }).join("");
}

/* ---- Community avatars ---- */
function renderAvatarStack() {
  const stack = document.getElementById("avatarStack");
  if (!stack) return;
  const users = MU6Store.load().users.slice(-6);
  if (!users.length) {
    stack.innerHTML = `<span style="color:var(--text-muted);font-size:13px">Be the first to join!</span>`;
    return;
  }
  stack.innerHTML = users.map((u, i) => {
    const color = MU6Data.avatarColors[i % MU6Data.avatarColors.length];
    return `<div class="avatar" style="left:${i * 36}px;background:${color}" title="${escHtml(u.username)}">${u.username[0].toUpperCase()}</div>`;
  }).join("");
  stack.style.width = (users.length * 36 + 16) + "px";
}

/* ---- Favorite toggle ---- */
function toggleFav(songId, btn) {
  const user = MU6Store.currentUser();
  if (!user) { openModal("loginModal"); return; }
  MU6Store.toggleFavorite(songId);
  if (btn) btn.textContent = MU6Store.isFavorite(songId) ? "❤️" : "🤍";
  showToast(MU6Store.isFavorite(songId) ? "Added to favorites ❤️" : "Removed from favorites", "success");
}

/* ---- Helpers ---- */
function escHtml(str) {
  return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function getArtistGradient(id) {
  const colors = MU6Data.avatarColors;
  const idx = Math.abs(hashCode(String(id))) % colors.length;
  return colors[idx];
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h;
}

/* ---- Add-content modals (shared across pages) ---- */
function buildStreamingInputs() {
  return MU6Data.streamingPlatforms.map(p => `
    <div class="form-group">
      <label>${p.icon} ${p.name} Link <span style="color:var(--text-muted)">(optional)</span></label>
      <input type="url" name="stream_${p.id}" placeholder="https://${p.urlPattern}/..." />
    </div>`).join("");
}

function collectStreamingLinks(form) {
  const links = {};
  MU6Data.streamingPlatforms.forEach(p => {
    const val = form.querySelector(`[name="stream_${p.id}"]`)?.value.trim();
    if (val) links[p.id] = val;
  });
  return links;
}

/* ---- Add Artist Modal ---- */
function openAddArtistModal() {
  const user = MU6Store.currentUser();
  if (!user) { openModal("loginModal"); return; }
  let modal = document.getElementById("addArtistModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.id = "addArtistModal";
    modal.innerHTML = `
      <div class="modal glass" style="max-width:560px;max-height:90vh;overflow-y:auto">
        <button class="modal-close" onclick="closeModal('addArtistModal')">✕</button>
        <h2>Add Artist</h2>
        <p class="modal-sub">Share an artist you love with the MU6 community</p>
        <form class="modal-form" id="addArtistForm">
          <div class="form-group">
            <label>Artist Name *</label>
            <input type="text" name="name" placeholder="e.g. Radiohead" required />
          </div>
          <div class="form-group">
            <label>Emoji / Icon</label>
            <input type="text" name="emoji" placeholder="🎵" maxlength="4" />
          </div>
          <div class="form-group">
            <label>Genres (comma-separated) *</label>
            <input type="text" name="genres" placeholder="e.g. Alternative, Post-Rock, Experimental" required />
          </div>
          <div class="form-group">
            <label>Biography</label>
            <textarea name="bio" rows="3" placeholder="Tell us about this artist..." style="background:rgba(255,255,255,0.05);border:1px solid var(--glass-border);border-radius:var(--radius-md);padding:12px 16px;color:var(--text-primary);font-size:15px;outline:none;resize:vertical;width:100%"></textarea>
          </div>
          <div style="margin:8px 0 4px;font-size:13px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px">Streaming Links</div>
          ${buildStreamingInputs()}
          <button type="submit" class="btn-primary full-width">Add Artist</button>
        </form>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", e => { if (e.target === modal) closeModal("addArtistModal"); });
    document.getElementById("addArtistForm").addEventListener("submit", e => {
      e.preventDefault();
      const form = e.target;
      const name = form.querySelector('[name="name"]').value.trim();
      const emoji = form.querySelector('[name="emoji"]').value.trim() || "🎵";
      const genres = form.querySelector('[name="genres"]').value.split(",").map(g => g.trim()).filter(Boolean);
      const bio = form.querySelector('[name="bio"]').value.trim();
      const streamingLinks = collectStreamingLinks(form);
      const result = MU6Store.addArtist({ name, bio, genres, streamingLinks, emoji });
      if (result.ok) {
        closeModal("addArtistModal");
        showToast("Artist added! 🎤", "success");
        form.reset();
        if (typeof renderTrendingArtists === "function") renderTrendingArtists();
        if (typeof renderArtistsList === "function") renderArtistsList();
      } else {
        showToast(result.error, "error");
      }
    });
  }
  openModal("addArtistModal");
}

/* ---- Add Song Modal ---- */
function openAddSongModal() {
  const user = MU6Store.currentUser();
  if (!user) { openModal("loginModal"); return; }
  const artists = MU6Store.getArtists();
  let modal = document.getElementById("addSongModal");
  if (modal) modal.remove();

  modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "addSongModal";
  const artistOptions = artists.length
    ? artists.map(a => `<option value="${a.id}" data-name="${escHtml(a.name)}">${escHtml(a.name)}</option>`).join("")
    : `<option value="">— Add an artist first —</option>`;
  const genreOptions = MU6Data.genres.map(g => `<option value="${g.name}">${g.name}</option>`).join("");

  modal.innerHTML = `
    <div class="modal glass" style="max-width:560px;max-height:90vh;overflow-y:auto">
      <button class="modal-close" onclick="closeModal('addSongModal')">✕</button>
      <h2>Add Song</h2>
      <p class="modal-sub">Add a track with streaming links so others can listen</p>
      <form class="modal-form" id="addSongForm">
        <div class="form-group">
          <label>Song Title *</label>
          <input type="text" name="title" placeholder="e.g. Creep" required />
        </div>
        <div class="form-group">
          <label>Artist *</label>
          <select name="artistId" required style="background:rgba(255,255,255,0.05);border:1px solid var(--glass-border);border-radius:var(--radius-md);padding:12px 16px;color:var(--text-primary);font-size:15px;outline:none;width:100%">
            <option value="">Select artist…</option>
            ${artistOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Genre *</label>
          <select name="genre" required style="background:rgba(255,255,255,0.05);border:1px solid var(--glass-border);border-radius:var(--radius-md);padding:12px 16px;color:var(--text-primary);font-size:15px;outline:none;width:100%">
            <option value="">Select genre…</option>
            ${genreOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Duration <span style="color:var(--text-muted)">(optional, e.g. 3:45)</span></label>
          <input type="text" name="duration" placeholder="3:45" pattern="[0-9]+:[0-5][0-9]" />
        </div>
        <div class="form-group">
          <label>Emoji / Icon</label>
          <input type="text" name="emoji" placeholder="🎵" maxlength="4" />
        </div>
        <div style="margin:8px 0 4px;font-size:13px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px">Streaming Links <span style="color:var(--text-muted);font-weight:400">(add at least one)</span></div>
        ${buildStreamingInputs()}
        <button type="submit" class="btn-primary full-width">Add Song</button>
      </form>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal("addSongModal"); });
  document.getElementById("addSongForm").addEventListener("submit", e => {
    e.preventDefault();
    const form = e.target;
    const title = form.querySelector('[name="title"]').value.trim();
    const artistSelect = form.querySelector('[name="artistId"]');
    const artistId = artistSelect.value;
    const artistName = artistSelect.options[artistSelect.selectedIndex]?.dataset.name || "";
    const genre = form.querySelector('[name="genre"]').value;
    const duration = form.querySelector('[name="duration"]').value.trim();
    const emoji = form.querySelector('[name="emoji"]').value.trim() || "🎵";
    const streamingLinks = collectStreamingLinks(form);
    if (!artistId) { showToast("Please select an artist.", "error"); return; }
    if (!Object.keys(streamingLinks).length) { showToast("Please add at least one streaming link.", "error"); return; }
    const result = MU6Store.addSong({ title, artistId, artistName, genre, duration, streamingLinks, emoji });
    if (result.ok) {
      closeModal("addSongModal");
      showToast("Song added! 🎵", "success");
      form.reset();
      if (typeof renderTrendingSongs === "function") renderTrendingSongs();
      if (typeof renderSongsList === "function") renderSongsList();
    } else {
      showToast(result.error, "error");
    }
  });
  openModal("addSongModal");
}

/* ---- Add Album Modal ---- */
function openAddAlbumModal() {
  const user = MU6Store.currentUser();
  if (!user) { openModal("loginModal"); return; }
  const artists = MU6Store.getArtists();
  let modal = document.getElementById("addAlbumModal");
  if (modal) modal.remove();

  modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "addAlbumModal";
  const artistOptions = artists.length
    ? artists.map(a => `<option value="${a.id}" data-name="${escHtml(a.name)}">${escHtml(a.name)}</option>`).join("")
    : `<option value="">— Add an artist first —</option>`;
  const genreOptions = MU6Data.genres.map(g => `<option value="${g.name}">${g.name}</option>`).join("");
  const currentYear = new Date().getFullYear();

  modal.innerHTML = `
    <div class="modal glass" style="max-width:560px;max-height:90vh;overflow-y:auto">
      <button class="modal-close" onclick="closeModal('addAlbumModal')">✕</button>
      <h2>Add Album</h2>
      <p class="modal-sub">Add an album with streaming links</p>
      <form class="modal-form" id="addAlbumForm">
        <div class="form-group">
          <label>Album Title *</label>
          <input type="text" name="title" placeholder="e.g. OK Computer" required />
        </div>
        <div class="form-group">
          <label>Artist *</label>
          <select name="artistId" required style="background:rgba(255,255,255,0.05);border:1px solid var(--glass-border);border-radius:var(--radius-md);padding:12px 16px;color:var(--text-primary);font-size:15px;outline:none;width:100%">
            <option value="">Select artist…</option>
            ${artistOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Genre *</label>
          <select name="genre" required style="background:rgba(255,255,255,0.05);border:1px solid var(--glass-border);border-radius:var(--radius-md);padding:12px 16px;color:var(--text-primary);font-size:15px;outline:none;width:100%">
            <option value="">Select genre…</option>
            ${genreOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Release Year</label>
          <input type="number" name="year" value="${currentYear}" min="1900" max="${currentYear}" />
        </div>
        <div class="form-group">
          <label>Number of Tracks</label>
          <input type="number" name="trackCount" placeholder="12" min="1" max="200" />
        </div>
        <div class="form-group">
          <label>Emoji / Icon</label>
          <input type="text" name="emoji" placeholder="💿" maxlength="4" />
        </div>
        <div style="margin:8px 0 4px;font-size:13px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px">Streaming Links <span style="color:var(--text-muted);font-weight:400">(add at least one)</span></div>
        ${buildStreamingInputs()}
        <button type="submit" class="btn-primary full-width">Add Album</button>
      </form>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal("addAlbumModal"); });
  document.getElementById("addAlbumForm").addEventListener("submit", e => {
    e.preventDefault();
    const form = e.target;
    const title = form.querySelector('[name="title"]').value.trim();
    const artistSelect = form.querySelector('[name="artistId"]');
    const artistId = artistSelect.value;
    const artistName = artistSelect.options[artistSelect.selectedIndex]?.dataset.name || "";
    const genre = form.querySelector('[name="genre"]').value;
    const year = parseInt(form.querySelector('[name="year"]').value) || new Date().getFullYear();
    const trackCount = parseInt(form.querySelector('[name="trackCount"]').value) || 0;
    const emoji = form.querySelector('[name="emoji"]').value.trim() || "💿";
    const streamingLinks = collectStreamingLinks(form);
    if (!artistId) { showToast("Please select an artist.", "error"); return; }
    if (!Object.keys(streamingLinks).length) { showToast("Please add at least one streaming link.", "error"); return; }
    const result = MU6Store.addAlbum({ title, artistId, artistName, year, genre, streamingLinks, emoji, trackCount });
    if (result.ok) {
      closeModal("addAlbumModal");
      showToast("Album added! 💿", "success");
      form.reset();
      if (typeof renderTrendingAlbums === "function") renderTrendingAlbums();
    } else {
      showToast(result.error, "error");
    }
  });
  openModal("addAlbumModal");
}

/* ---- Add Review Modal ---- */
function openAddReviewModal(albumId) {
  const user = MU6Store.currentUser();
  if (!user) { openModal("loginModal"); return; }
  const album = MU6Store.getAlbum(albumId);
  if (!album) { showToast("Album not found.", "error"); return; }

  let modal = document.getElementById("addReviewModal");
  if (modal) modal.remove();
  modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "addReviewModal";
  modal.innerHTML = `
    <div class="modal glass">
      <button class="modal-close" onclick="closeModal('addReviewModal')">✕</button>
      <h2>Write a Review</h2>
      <p class="modal-sub">${escHtml(album.title)} by ${escHtml(album.artistName)}</p>
      <form class="modal-form" id="addReviewForm">
        <div class="form-group">
          <label>Rating</label>
          <div class="star-picker" id="starPicker" data-rating="0">
            ${[1,2,3,4,5].map(n => `<span class="star-pick" data-val="${n}" style="font-size:28px;cursor:pointer;color:var(--text-muted)">★</span>`).join("")}
          </div>
          <input type="hidden" name="rating" value="0" />
        </div>
        <div class="form-group">
          <label>Your Review *</label>
          <textarea name="text" rows="4" placeholder="What did you think of this album?" required style="background:rgba(255,255,255,0.05);border:1px solid var(--glass-border);border-radius:var(--radius-md);padding:12px 16px;color:var(--text-primary);font-size:15px;outline:none;resize:vertical;width:100%"></textarea>
        </div>
        <button type="submit" class="btn-primary full-width">Post Review</button>
      </form>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal("addReviewModal"); });

  // Star picker
  const picker = modal.querySelector("#starPicker");
  const ratingInput = modal.querySelector('[name="rating"]');
  picker.querySelectorAll(".star-pick").forEach(star => {
    star.addEventListener("mouseover", () => {
      const v = parseInt(star.dataset.val);
      picker.querySelectorAll(".star-pick").forEach((s, i) => { s.style.color = i < v ? "#f59e0b" : "var(--text-muted)"; });
    });
    star.addEventListener("mouseleave", () => {
      const cur = parseInt(ratingInput.value);
      picker.querySelectorAll(".star-pick").forEach((s, i) => { s.style.color = i < cur ? "#f59e0b" : "var(--text-muted)"; });
    });
    star.addEventListener("click", () => {
      ratingInput.value = star.dataset.val;
      picker.dataset.rating = star.dataset.val;
    });
  });

  document.getElementById("addReviewForm").addEventListener("submit", e => {
    e.preventDefault();
    const form = e.target;
    const rating = parseInt(form.querySelector('[name="rating"]').value);
    const text = form.querySelector('[name="text"]').value.trim();
    if (!rating) { showToast("Please select a star rating.", "error"); return; }
    const result = MU6Store.addReview({ albumId, albumTitle: album.title, albumArtist: album.artistName, albumEmoji: album.emoji, rating, text });
    if (result.ok) {
      closeModal("addReviewModal");
      showToast("Review posted! ✍️", "success");
      if (typeof renderReviews === "function") renderReviews();
    } else {
      showToast(result.error, "error");
    }
  });
  openModal("addReviewModal");
}

/* ---- Add Discussion Modal ---- */
function openAddDiscussionModal() {
  const user = MU6Store.currentUser();
  if (!user) { openModal("loginModal"); return; }
  let modal = document.getElementById("addDiscModal");
  if (modal) modal.remove();
  modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "addDiscModal";
  const cats = ["Discovery","Recommendations","Discussion","General","News"];
  modal.innerHTML = `
    <div class="modal glass">
      <button class="modal-close" onclick="closeModal('addDiscModal')">✕</button>
      <h2>Start a Discussion</h2>
      <p class="modal-sub">Share your thoughts with the MU6 community</p>
      <form class="modal-form" id="addDiscForm">
        <div class="form-group">
          <label>Title *</label>
          <input type="text" name="title" placeholder="What's on your mind?" required />
        </div>
        <div class="form-group">
          <label>Category</label>
          <select name="category" style="background:rgba(255,255,255,0.05);border:1px solid var(--glass-border);border-radius:var(--radius-md);padding:12px 16px;color:var(--text-primary);font-size:15px;outline:none;width:100%">
            ${cats.map(c => `<option value="${c}">${c}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label>Body <span style="color:var(--text-muted)">(optional)</span></label>
          <textarea name="body" rows="4" placeholder="Add more context..." style="background:rgba(255,255,255,0.05);border:1px solid var(--glass-border);border-radius:var(--radius-md);padding:12px 16px;color:var(--text-primary);font-size:15px;outline:none;resize:vertical;width:100%"></textarea>
        </div>
        <button type="submit" class="btn-primary full-width">Post Discussion</button>
      </form>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal("addDiscModal"); });
  document.getElementById("addDiscForm").addEventListener("submit", e => {
    e.preventDefault();
    const form = e.target;
    const title = form.querySelector('[name="title"]').value.trim();
    const category = form.querySelector('[name="category"]').value;
    const body = form.querySelector('[name="body"]').value.trim();
    const result = MU6Store.addDiscussion({ title, body, category });
    if (result.ok) {
      closeModal("addDiscModal");
      showToast("Discussion posted! 💬", "success");
      if (typeof renderDiscussions === "function") renderDiscussions();
    } else {
      showToast(result.error, "error");
    }
  });
  openModal("addDiscModal");
}

/* ---- Homepage init ---- */
function initHomepage() {
  initParticles();
  initNavbar();
  initReveal();
  initTabs();
  updateAuthUI();

  // Update hero stats to show live counts
  const heroStats = document.querySelectorAll(".stat-num");
  if (heroStats.length >= 3) {
    const stats = MU6Store.getSiteStats();
    heroStats[0].textContent = formatCount(stats.artists) || "0";
    heroStats[1].textContent = formatCount(stats.songs) || "0";
    heroStats[2].textContent = formatCount(stats.playlists) || "0";
    heroStats[0].setAttribute("data-stat","artists");
    heroStats[1].setAttribute("data-stat","tracks");
    heroStats[2].setAttribute("data-stat","playlists");
  }

  renderTrendingArtists();
  renderTrendingSongs();
  renderTrendingAlbums();
  renderDiscoveries();
  renderGenres();
  renderMoods();
  renderPlaylists("curated");
  renderAvatarStack();

  // Add content buttons in nav (if logged in)
  const user = MU6Store.currentUser();
  if (user) {
    const addBtn = document.createElement("button");
    addBtn.className = "btn-ghost";
    addBtn.textContent = "+ Add";
    addBtn.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:900;background:var(--gradient);color:#fff;border:none;padding:14px 24px;border-radius:var(--radius-full);font-weight:700;box-shadow:var(--shadow-glow);font-size:15px";
    addBtn.onclick = () => showAddMenu();
    document.body.appendChild(addBtn);
  }
}

function showAddMenu() {
  let menu = document.getElementById("addMenu");
  if (menu) { menu.remove(); return; }
  menu = document.createElement("div");
  menu.id = "addMenu";
  menu.style.cssText = "position:fixed;bottom:80px;right:24px;z-index:901;background:var(--bg-card);border:1px solid var(--glass-border);border-radius:var(--radius-lg);padding:8px;display:flex;flex-direction:column;gap:4px;box-shadow:var(--shadow-md)";
  menu.innerHTML = `
    <button class="sidebar-link" onclick="openAddArtistModal();document.getElementById('addMenu').remove()">🎤 Add Artist</button>
    <button class="sidebar-link" onclick="openAddSongModal();document.getElementById('addMenu').remove()">🎵 Add Song</button>
    <button class="sidebar-link" onclick="openAddAlbumModal();document.getElementById('addMenu').remove()">💿 Add Album</button>
    <a href="playlists.html" class="sidebar-link">🎧 Create Playlist</a>
  `;
  document.body.appendChild(menu);
  setTimeout(() => document.addEventListener("click", function h(e) {
    if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener("click", h); }
  }), 50);
}

/* ---- Boot ---- */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (!page || page === "home") initHomepage();
  // Other pages init their own functions
});
