/* ============================================================
   MU6 – Discover Page Logic
   ============================================================ */

let _searchResults = null;
let _activeResultFilter = "all";

/* ---- Init ---- */
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page !== "discover") return;
  initNavbar();
  updateAuthUI();
  renderDiscoverGenres();
  renderDiscoverMoods();
  renderEraTimeline();
  renderColorPicker();
  renderHiddenGems();
  renderGenreMap();
  renderChallenges();
  handleURLParams();

  document.getElementById("discoverSearch")?.addEventListener("keydown", e => {
    if (e.key === "Enter") runSearch();
  });
});

/* ---- URL params (from homepage search / genre / mood links) ---- */
function handleURLParams() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  const genre = params.get("genre");
  const mood = params.get("mood");

  if (q) {
    document.getElementById("discoverSearch").value = q;
    runSearch();
  } else if (genre) {
    document.getElementById("discoverSearch").value = genre;
    runSearch();
    document.getElementById("genres")?.scrollIntoView({ behavior: "smooth" });
  } else if (mood) {
    filterByMood(mood);
    document.getElementById("moods")?.scrollIntoView({ behavior: "smooth" });
  }
}

/* ---- Search ---- */
function runSearch() {
  const q = document.getElementById("discoverSearch")?.value.trim();
  if (!q) return;
  _searchResults = MU6Store.search(q);
  _activeResultFilter = "all";
  document.getElementById("searchResultsSection")?.classList.remove("hidden");
  document.getElementById("searchResultsTitle").textContent = `Results for "${q}"`;
  document.querySelectorAll(".filter-chip").forEach(c => c.classList.toggle("active", c.dataset.filter === "all"));
  renderSearchResults();
  document.getElementById("searchResultsSection")?.scrollIntoView({ behavior: "smooth" });
}

function clearSearch() {
  _searchResults = null;
  document.getElementById("discoverSearch").value = "";
  document.getElementById("searchResultsSection")?.classList.add("hidden");
  document.getElementById("searchResults").innerHTML = "";
  history.replaceState(null, "", "discover.html");
}

function setResultFilter(filter, btn) {
  _activeResultFilter = filter;
  document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  renderSearchResults();
}

function renderSearchResults() {
  const container = document.getElementById("searchResults");
  if (!_searchResults) return;
  const { artists, songs, albums, playlists } = _searchResults;
  const total = artists.length + songs.length + albums.length + playlists.length;

  if (!total) {
    container.innerHTML = renderEmptyState("🔍", "No results found", "Try a different search term or browse by genre below.");
    return;
  }

  let html = "";
  const f = _activeResultFilter;

  if ((f === "all" || f === "artists") && artists.length) {
    html += `<div class="result-section"><h3 class="result-section-title">Artists (${artists.length})</h3>
      <div class="cards-grid">${artists.map(a => `
        <div class="card" onclick="window.location='artists.html?id=${a.id}'">
          <div class="card-image-placeholder" style="background:${getArtistGradient(a.id)}">${a.emoji}</div>
          <div class="card-body">
            <div class="card-title">${escHtml(a.name)}</div>
            <div class="card-sub">${escHtml((a.genres||[]).join(", "))}</div>
            <div class="card-meta"><span class="card-badge">${formatCount(a.followers)} followers</span></div>
          </div>
        </div>`).join("")}
      </div></div>`;
  }

  if ((f === "all" || f === "songs") && songs.length) {
    html += `<div class="result-section"><h3 class="result-section-title">Songs (${songs.length})</h3>
      <div class="track-list">${songs.map((s, i) => `
        <div class="track-item">
          <span class="track-num">${i+1}</span>
          <div class="track-art">${s.emoji}</div>
          <div class="track-info">
            <div class="track-name">${escHtml(s.title)}</div>
            <div class="track-artist">${escHtml(s.artistName)}</div>
          </div>
          <span class="track-duration">${s.duration||"—"}</span>
          <div class="track-actions">${renderStreamingLinks(s.streamingLinks)}
            <button class="track-btn" onclick="toggleFav('${s.id}',this)">${MU6Store.isFavorite(s.id)?"❤️":"🤍"}</button>
          </div>
        </div>`).join("")}
      </div></div>`;
  }

  if ((f === "all" || f === "albums") && albums.length) {
    html += `<div class="result-section"><h3 class="result-section-title">Albums (${albums.length})</h3>
      <div class="cards-grid">${albums.map(a => `
        <div class="card">
          <div class="card-image-placeholder" style="background:${getArtistGradient(a.id)}">${a.emoji}</div>
          <div class="card-body">
            <div class="card-title">${escHtml(a.title)}</div>
            <div class="card-sub">${escHtml(a.artistName)} · ${a.year}</div>
            <div class="card-meta">
              <span class="card-badge">⭐ ${formatAvgRating(a.ratingSum,a.ratingCount)}</span>
              <button class="track-btn" onclick="openAddReviewModal('${a.id}')" title="Review">✍️</button>
            </div>
          </div>
        </div>`).join("")}
      </div></div>`;
  }

  if ((f === "all" || f === "playlists") && playlists.length) {
    html += `<div class="result-section"><h3 class="result-section-title">Playlists (${playlists.length})</h3>
      <div class="playlists-grid">${playlists.map(p => {
        const pSongs = MU6Store.getSongs().filter(s => p.songs.includes(s.id)).slice(0,4);
        const cells = [0,1,2,3].map(i => `<div class="playlist-cover-cell">${pSongs[i]?pSongs[i].emoji:"🎵"}</div>`).join("");
        return `<div class="playlist-card" onclick="window.location='playlists.html?id=${p.id}'">
          <div class="playlist-cover">${cells}</div>
          <div class="playlist-body">
            <div class="playlist-title">${escHtml(p.title)}</div>
            <div class="playlist-meta"><span>${p.songs.length} tracks</span><span class="playlist-dot"></span><span>by ${escHtml(p.ownerName)}</span></div>
          </div>
        </div>`;
      }).join("")}</div></div>`;
  }

  if (!html) {
    html = renderEmptyState("🔍", `No ${_activeResultFilter} found`, "Try a different filter or search term.");
  }

  container.innerHTML = html;
}

/* ---- Genre Browser ---- */
function renderDiscoverGenres() {
  const grid = document.getElementById("discoverGenreGrid");
  if (!grid) return;
  const counts = MU6Store.getGenreCounts();
  grid.innerHTML = MU6Data.genres.map(g => `
    <div class="genre-card" style="background:${g.color}" onclick="filterByGenre('${escHtml(g.name)}')">
      <span class="genre-emoji">${g.emoji}</span>
      <div class="genre-name">${g.name}</div>
      <div class="genre-count">${formatCount(counts[g.name]||0)} tracks</div>
    </div>`).join("");
}

function filterByGenre(genre) {
  const songs = MU6Store.getSongs().filter(s => s.genre === genre);
  const artists = MU6Store.getArtists().filter(a => (a.genres||[]).includes(genre));
  const container = document.getElementById("genreResults");
  if (!container) return;

  let html = `<div class="section-header"><div><span class="section-label">🎵 Genre</span><h2 class="section-title">${escHtml(genre)}</h2></div></div>`;

  if (!songs.length && !artists.length) {
    html += renderEmptyState("🎵", `No ${genre} content yet`, "Be the first to add an artist or song in this genre.",
      `<button class="btn-primary" onclick="openAddArtistModal()">Add Artist</button>`);
  } else {
    if (artists.length) {
      html += `<h3 style="margin-bottom:16px;color:var(--text-secondary);font-size:14px;text-transform:uppercase;letter-spacing:1px">Artists</h3>
        <div class="cards-grid" style="margin-bottom:40px">${artists.map(a => `
          <div class="card" onclick="window.location='artists.html?id=${a.id}'">
            <div class="card-image-placeholder" style="background:${getArtistGradient(a.id)}">${a.emoji}</div>
            <div class="card-body">
              <div class="card-title">${escHtml(a.name)}</div>
              <div class="card-sub">${escHtml((a.genres||[]).join(", "))}</div>
            </div>
          </div>`).join("")}</div>`;
    }
    if (songs.length) {
      html += `<h3 style="margin-bottom:16px;color:var(--text-secondary);font-size:14px;text-transform:uppercase;letter-spacing:1px">Songs</h3>
        <div class="track-list">${songs.map((s,i) => `
          <div class="track-item">
            <span class="track-num">${i+1}</span>
            <div class="track-art">${s.emoji}</div>
            <div class="track-info"><div class="track-name">${escHtml(s.title)}</div><div class="track-artist">${escHtml(s.artistName)}</div></div>
            <span class="track-duration">${s.duration||"—"}</span>
            <div class="track-actions">${renderStreamingLinks(s.streamingLinks)}</div>
          </div>`).join("")}</div>`;
    }
  }

  container.innerHTML = html;
  container.scrollIntoView({ behavior: "smooth" });
}

/* ---- Mood Browser ---- */
function renderDiscoverMoods() {
  const grid = document.getElementById("discoverMoodGrid");
  if (!grid) return;
  grid.innerHTML = MU6Data.moods.map(m => `
    <div class="mood-card" style="border-color:${m.color}33" onclick="filterByMood('${m.name}')">
      <div class="mood-emoji">${m.emoji}</div>
      <div class="mood-name">${m.name}</div>
      <div class="mood-desc">${m.desc}</div>
    </div>`).join("");
}

function filterByMood(mood) {
  const moodData = MU6Data.moods.find(m => m.name === mood);
  const container = document.getElementById("moodResults");
  if (!container) return;

  // Map mood to genres
  const moodGenreMap = {
    "Energized":   ["Electronic","Hip-Hop","Metal","Pop"],
    "Melancholic": ["Post-Rock","Dream Pop","Indie Rock","Ambient"],
    "Focused":     ["Lo-Fi","Ambient","Classical","Jazz"],
    "Romantic":    ["R&B / Soul","Neo-Soul","Pop","Jazz"],
    "Chill":       ["Lo-Fi","Reggae","Ambient","Jazz"],
    "Euphoric":    ["Electronic","Pop","Hip-Hop","Synthwave"],
    "Dark":        ["Metal","Synthwave","Post-Rock","Electronic"],
    "Nostalgic":   ["Synthwave","Folk","Indie Rock","Pop"],
  };

  const relatedGenres = moodGenreMap[mood] || [];
  const songs = MU6Store.getSongs().filter(s => relatedGenres.includes(s.genre));
  const artists = MU6Store.getArtists().filter(a => (a.genres||[]).some(g => relatedGenres.includes(g)));

  let html = `<div class="section-header"><div>
    <span class="section-label">${moodData?.emoji||"💫"} Mood</span>
    <h2 class="section-title">${escHtml(mood)}</h2>
  </div></div>`;

  if (!songs.length && !artists.length) {
    html += renderEmptyState(moodData?.emoji||"💫", `No ${mood} music yet`,
      `Add songs in genres like ${relatedGenres.slice(0,3).join(", ")} to populate this mood.`,
      `<button class="btn-primary" onclick="openAddSongModal()">Add Song</button>`);
  } else {
    if (artists.length) {
      html += `<h3 style="margin-bottom:16px;color:var(--text-secondary);font-size:14px;text-transform:uppercase;letter-spacing:1px">Artists</h3>
        <div class="cards-grid" style="margin-bottom:40px">${artists.slice(0,8).map(a => `
          <div class="card" onclick="window.location='artists.html?id=${a.id}'">
            <div class="card-image-placeholder" style="background:${getArtistGradient(a.id)}">${a.emoji}</div>
            <div class="card-body">
              <div class="card-title">${escHtml(a.name)}</div>
              <div class="card-sub">${escHtml((a.genres||[]).join(", "))}</div>
            </div>
          </div>`).join("")}</div>`;
    }
    if (songs.length) {
      html += `<h3 style="margin-bottom:16px;color:var(--text-secondary);font-size:14px;text-transform:uppercase;letter-spacing:1px">Songs</h3>
        <div class="track-list">${songs.slice(0,10).map((s,i) => `
          <div class="track-item">
            <span class="track-num">${i+1}</span>
            <div class="track-art">${s.emoji}</div>
            <div class="track-info"><div class="track-name">${escHtml(s.title)}</div><div class="track-artist">${escHtml(s.artistName)}</div></div>
            <span class="track-duration">${s.duration||"—"}</span>
            <div class="track-actions">${renderStreamingLinks(s.streamingLinks)}</div>
          </div>`).join("")}</div>`;
    }
  }

  container.innerHTML = html;
  container.scrollIntoView({ behavior: "smooth" });
}

/* ---- Era Timeline ---- */
function renderEraTimeline() {
  const tl = document.getElementById("eraTimeline");
  if (!tl) return;
  tl.innerHTML = MU6Data.eras.map(e => `
    <div class="era-item" onclick="filterByEra('${e.decade}')">
      <div class="era-decade">${e.decade}</div>
      <div class="era-label">${e.label}</div>
    </div>`).join("");
}

function filterByEra(decade) {
  const year = parseInt(decade);
  const albums = MU6Store.getAlbums().filter(a => a.year >= year && a.year < year + 10);
  const container = document.getElementById("eraResults");
  if (!container) return;

  document.querySelectorAll(".era-item").forEach(el => {
    el.classList.toggle("active", el.querySelector(".era-decade")?.textContent === decade);
  });

  let html = `<div class="section-header"><div>
    <span class="section-label">📅 Era</span>
    <h2 class="section-title">${decade}s Music</h2>
  </div></div>`;

  if (!albums.length) {
    html += renderEmptyState("📅", `No ${decade}s albums yet`,
      `Add albums released in the ${decade}s to populate this era.`,
      `<button class="btn-primary" onclick="openAddAlbumModal()">Add Album</button>`);
  } else {
    html += `<div class="cards-grid">${albums.map(a => `
      <div class="card">
        <div class="card-image-placeholder" style="background:${getArtistGradient(a.id)}">${a.emoji}</div>
        <div class="card-body">
          <div class="card-title">${escHtml(a.title)}</div>
          <div class="card-sub">${escHtml(a.artistName)} · ${a.year}</div>
          <div class="card-meta">
            <span class="card-badge">⭐ ${formatAvgRating(a.ratingSum,a.ratingCount)}</span>
            <div class="stream-links-mini">${renderStreamingLinks(a.streamingLinks)}</div>
          </div>
        </div>
      </div>`).join("")}</div>`;
  }

  container.innerHTML = html;
  container.scrollIntoView({ behavior: "smooth" });
}

/* ---- Color Picker ---- */
function renderColorPicker() {
  const picker = document.getElementById("colorPicker");
  if (!picker) return;
  picker.innerHTML = MU6Data.colors.map(c => `
    <div class="color-swatch" style="background:${c.hex}" title="${c.mood}" onclick="filterByColor('${c.hex}','${c.mood}')"></div>`).join("");
}

function filterByColor(hex, mood) {
  document.querySelectorAll(".color-swatch").forEach(s => {
    s.classList.toggle("active", s.style.background === hex || s.style.backgroundColor === hex);
  });

  const colorData = MU6Data.colors.find(c => c.hex === hex);
  const relatedGenres = colorData?.genres || [];
  const songs = MU6Store.getSongs().filter(s => relatedGenres.includes(s.genre));
  const container = document.getElementById("colorResults");
  if (!container) return;

  let html = `<div class="section-header"><div>
    <span class="section-label">🎨 Color Mood</span>
    <h2 class="section-title" style="display:flex;align-items:center;gap:12px">
      <span style="width:28px;height:28px;border-radius:50%;background:${hex};display:inline-block;flex-shrink:0"></span>
      ${escHtml(mood)}
    </h2>
  </div></div>
  <p style="color:var(--text-secondary);margin-bottom:24px">Related genres: ${relatedGenres.join(", ")}</p>`;

  if (!songs.length) {
    html += renderEmptyState("🎨", "No music for this color yet",
      `Add songs in genres like ${relatedGenres.join(", ")} to populate this palette.`,
      `<button class="btn-primary" onclick="openAddSongModal()">Add Song</button>`);
  } else {
    html += `<div class="track-list">${songs.slice(0,10).map((s,i) => `
      <div class="track-item">
        <span class="track-num">${i+1}</span>
        <div class="track-art">${s.emoji}</div>
        <div class="track-info"><div class="track-name">${escHtml(s.title)}</div><div class="track-artist">${escHtml(s.artistName)}</div></div>
        <span class="track-duration">${s.duration||"—"}</span>
        <div class="track-actions">${renderStreamingLinks(s.streamingLinks)}</div>
      </div>`).join("")}</div>`;
  }

  container.innerHTML = html;
  container.scrollIntoView({ behavior: "smooth" });
}

/* ---- Hidden Gems ---- */
function renderHiddenGems() {
  const grid = document.getElementById("gemsGrid");
  if (!grid) return;
  // Hidden gems = artists with 0 followers (newly added, undiscovered)
  const gems = MU6Store.getArtists().filter(a => a.followers < 10);
  if (!gems.length) {
    grid.innerHTML = renderEmptyState("💎", "No hidden gems yet",
      "Add artists to MU6 and they'll appear here as hidden gems waiting to be discovered.",
      `<button class="btn-primary" onclick="openAddArtistModal()">Add Artist</button>`);
    return;
  }
  grid.innerHTML = `<div class="cards-grid">${gems.map(a => `
    <div class="card" onclick="window.location='artists.html?id=${a.id}'">
      <div class="card-image-placeholder" style="background:${getArtistGradient(a.id)}">${a.emoji}</div>
      <div class="card-body">
        <div class="card-title">${escHtml(a.name)}</div>
        <div class="card-sub">${escHtml((a.genres||[]).join(", "))}</div>
        <div class="card-meta">
          <span class="discovery-tag">💎 Hidden Gem</span>
        </div>
      </div>
    </div>`).join("")}</div>`;
}

/* ---- Genre Map ---- */
function renderGenreMap() {
  const map = document.getElementById("genreMap");
  if (!map) return;
  const counts = MU6Store.getGenreCounts();
  map.innerHTML = MU6Data.genreMapNodes.map(n => {
    const count = counts[n.name] || 0;
    const size = n.size + Math.min(count * 2, 40);
    return `<div class="genre-node" style="
      left:${n.x}%;top:${n.y}%;
      width:${size}px;height:${size}px;
      background:${n.color}22;
      border:2px solid ${n.color}66;
      color:${n.color};
      font-size:${Math.max(11, size/6)}px;
      transform:translate(-50%,-50%);
      padding:8px;
      text-align:center;
    " onclick="filterByGenre('${n.name}')" title="${n.name}: ${count} tracks">
      ${n.name}
    </div>`;
  }).join("");
}

/* ---- Random Discovery ---- */
function randomDiscover() {
  const container = document.getElementById("randomResult");
  if (!container) return;

  const allSongs = MU6Store.getSongs();
  const allArtists = MU6Store.getArtists();
  const allAlbums = MU6Store.getAlbums();
  const pool = [...allSongs.map(s => ({...s, _type:"song"})),
                ...allArtists.map(a => ({...a, _type:"artist"})),
                ...allAlbums.map(a => ({...a, _type:"album"}))];

  if (!pool.length) {
    container.innerHTML = renderEmptyState("🎲", "Nothing to discover yet",
      "Add artists, songs, and albums to MU6 first, then hit Random to discover them!",
      `<button class="btn-primary" onclick="openAddArtistModal()">Add Artist</button>`);
    return;
  }

  const item = pool[Math.floor(Math.random() * pool.length)];
  let html = `<div class="glass" style="border-radius:var(--radius-xl);padding:40px;text-align:center;max-width:500px;margin:0 auto">
    <div style="font-size:64px;margin-bottom:16px">${item.emoji}</div>
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:var(--purple-light);margin-bottom:8px">
      ${item._type === "song" ? "🎵 Song" : item._type === "artist" ? "🎤 Artist" : "💿 Album"}
    </div>
    <h2 style="font-size:28px;margin-bottom:8px">${escHtml(item.title || item.name)}</h2>`;

  if (item._type === "song") {
    html += `<p style="color:var(--text-secondary);margin-bottom:20px">${escHtml(item.artistName)} · ${item.genre||""}</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">${renderStreamingLinks(item.streamingLinks)}</div>`;
  } else if (item._type === "artist") {
    html += `<p style="color:var(--text-secondary);margin-bottom:20px">${escHtml((item.genres||[]).join(", "))}</p>
      <p style="color:var(--text-secondary);font-size:14px;margin-bottom:20px">${escHtml(item.bio||"")}</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">${renderStreamingLinks(item.streamingLinks)}</div>`;
  } else {
    html += `<p style="color:var(--text-secondary);margin-bottom:20px">${escHtml(item.artistName)} · ${item.year} · ${item.genre||""}</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">${renderStreamingLinks(item.streamingLinks)}</div>`;
  }

  html += `<button class="btn-primary" style="margin-top:24px" onclick="randomDiscover()">🎲 Try Another</button></div>`;
  container.innerHTML = html;
  container.scrollIntoView({ behavior: "smooth" });
}

/* ---- Challenges ---- */
function renderChallenges() {
  const grid = document.getElementById("challengeGrid");
  if (!grid) return;
  const user = MU6Store.currentUser();
  const userStats = user ? MU6Store.getUserStats() : null;

  grid.innerHTML = MU6Data.challenges.map(c => {
    let progress = 0;
    if (userStats) {
      if (c.title === "Genre Explorer") progress = Math.min(c.total, userStats.discovered);
      else if (c.title === "Hidden Gem Hunter") progress = Math.min(c.total, userStats.following);
      else if (c.title === "Review Writer") progress = Math.min(c.total, userStats.reviews);
      else if (c.title === "Playlist Builder") progress = Math.min(c.total, userStats.playlists);
    }
    const pct = Math.round((progress / c.total) * 100);
    const done = progress >= c.total;

    return `<div class="feature-card glass" style="${done ? "border-color:rgba(16,185,129,0.4)" : ""}">
      <div class="feature-icon">${done ? "✅" : c.reward.split(" ")[0]}</div>
      <h3>${c.title}</h3>
      <p>${c.desc}</p>
      <div style="background:var(--bg-secondary);border-radius:var(--radius-full);height:6px;margin-bottom:12px;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:var(--gradient);border-radius:var(--radius-full);transition:width 0.5s ease"></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:12px;color:var(--text-muted)">${progress}/${c.total} ${done?"✓":""}</span>
        <span style="font-size:12px;color:var(--purple-light);font-weight:600">${c.reward}</span>
      </div>
    </div>`;
  }).join("");
}
