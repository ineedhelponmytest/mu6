/* ============================================================
   MU6 – Empty Data Store (Production Ready)
   All data is user-generated. No mock/fake data.
   ============================================================ */

const MU6Data = {

  /* ---- Artists ---- */
  artists: [],

  /* ---- Songs ---- */
  songs: [],

  /* ---- Albums ---- */
  albums: [],

  /* ---- Playlists ---- */
  playlists: {
    curated: [],
    community: [],
    newreleases: [],
    genre: [],
  },

  /* ---- Genres (static taxonomy – not user content) ---- */
  genres: [
    { name: "Electronic",  emoji: "🎛️", count: 0, color: "linear-gradient(135deg,#6366f1,#8b5cf6)",  bg: "#6366f1" },
    { name: "Hip-Hop",     emoji: "🎤", count: 0, color: "linear-gradient(135deg,#f59e0b,#ef4444)",  bg: "#f59e0b" },
    { name: "Indie Rock",  emoji: "🎸", count: 0, color: "linear-gradient(135deg,#10b981,#06b6d4)",  bg: "#10b981" },
    { name: "Jazz",        emoji: "🎷", count: 0, color: "linear-gradient(135deg,#f97316,#eab308)",  bg: "#f97316" },
    { name: "Lo-Fi",       emoji: "🌙", count: 0, color: "linear-gradient(135deg,#8b5cf6,#ec4899)",  bg: "#8b5cf6" },
    { name: "R&B / Soul",  emoji: "💜", count: 0, color: "linear-gradient(135deg,#ec4899,#8b5cf6)",  bg: "#ec4899" },
    { name: "Ambient",     emoji: "🌊", count: 0, color: "linear-gradient(135deg,#06b6d4,#3b82f6)",  bg: "#06b6d4" },
    { name: "Classical",   emoji: "🎻", count: 0, color: "linear-gradient(135deg,#84cc16,#10b981)",  bg: "#84cc16" },
    { name: "Metal",       emoji: "🤘", count: 0, color: "linear-gradient(135deg,#374151,#6b7280)",  bg: "#374151" },
    { name: "Pop",         emoji: "⭐", count: 0, color: "linear-gradient(135deg,#f43f5e,#f97316)",  bg: "#f43f5e" },
    { name: "Folk",        emoji: "🪕", count: 0, color: "linear-gradient(135deg,#92400e,#d97706)",  bg: "#92400e" },
    { name: "Reggae",      emoji: "🌴", count: 0, color: "linear-gradient(135deg,#16a34a,#eab308)",  bg: "#16a34a" },
    { name: "Synthwave",   emoji: "🌈", count: 0, color: "linear-gradient(135deg,#a78bfa,#22d3ee)",  bg: "#a78bfa" },
    { name: "Post-Rock",   emoji: "🏔️", count: 0, color: "linear-gradient(135deg,#64748b,#94a3b8)",  bg: "#64748b" },
    { name: "Neo-Soul",    emoji: "☀️", count: 0, color: "linear-gradient(135deg,#fbbf24,#f97316)",  bg: "#fbbf24" },
    { name: "Dream Pop",   emoji: "🌸", count: 0, color: "linear-gradient(135deg,#f9a8d4,#c084fc)",  bg: "#f9a8d4" },
  ],

  /* ---- Moods (static taxonomy) ---- */
  moods: [
    { name: "Energized",   emoji: "⚡", desc: "High-energy bangers",      color: "#f59e0b" },
    { name: "Melancholic", emoji: "🌧️", desc: "Emotional & reflective",   color: "#6366f1" },
    { name: "Focused",     emoji: "🎯", desc: "Deep work & study",        color: "#06b6d4" },
    { name: "Romantic",    emoji: "💕", desc: "Love & intimacy",          color: "#ec4899" },
    { name: "Chill",       emoji: "😌", desc: "Laid-back vibes",          color: "#10b981" },
    { name: "Euphoric",    emoji: "🎉", desc: "Pure joy & celebration",   color: "#8b5cf6" },
    { name: "Dark",        emoji: "🌑", desc: "Brooding & intense",       color: "#374151" },
    { name: "Nostalgic",   emoji: "📼", desc: "Throwback feelings",       color: "#f97316" },
  ],

  /* ---- Eras (static taxonomy) ---- */
  eras: [
    { decade: "1950s", label: "Rock & Roll Birth",       emoji: "🎸" },
    { decade: "1960s", label: "Psychedelic Revolution",  emoji: "🌈" },
    { decade: "1970s", label: "Disco & Punk",            emoji: "🕺" },
    { decade: "1980s", label: "Synth & New Wave",        emoji: "🎹" },
    { decade: "1990s", label: "Grunge & Hip-Hop",        emoji: "🎤" },
    { decade: "2000s", label: "Digital Age",             emoji: "💿" },
    { decade: "2010s", label: "Streaming Era",           emoji: "📱" },
    { decade: "2020s", label: "Genre Fusion",            emoji: "🔮" },
  ],

  /* ---- Color → Mood map (static) ---- */
  colors: [
    { hex: "#ef4444", mood: "Passionate",  genres: ["Metal", "Punk", "Hip-Hop"] },
    { hex: "#f97316", mood: "Energetic",   genres: ["Electronic", "Dance", "Pop"] },
    { hex: "#eab308", mood: "Joyful",      genres: ["Reggae", "Funk", "Soul"] },
    { hex: "#22c55e", mood: "Fresh",       genres: ["Folk", "Indie", "Acoustic"] },
    { hex: "#06b6d4", mood: "Calm",        genres: ["Ambient", "Lo-Fi", "Jazz"] },
    { hex: "#3b82f6", mood: "Melancholic", genres: ["Post-Rock", "Shoegaze", "Dream Pop"] },
    { hex: "#8b5cf6", mood: "Mystical",    genres: ["Synthwave", "Electronic", "Ambient"] },
    { hex: "#ec4899", mood: "Romantic",    genres: ["R&B", "Pop", "Neo-Soul"] },
    { hex: "#f1f5f9", mood: "Pure",        genres: ["Classical", "Acoustic", "Ambient"] },
    { hex: "#1e293b", mood: "Dark",        genres: ["Dark Techno", "Black Metal", "Industrial"] },
  ],

  /* ---- Genre map nodes (static layout) ---- */
  genreMapNodes: [
    { name: "Electronic", x: 50, y: 45, size: 90, color: "#8b5cf6" },
    { name: "Hip-Hop",    x: 20, y: 30, size: 80, color: "#f59e0b" },
    { name: "Rock",       x: 75, y: 25, size: 75, color: "#ef4444" },
    { name: "Jazz",       x: 30, y: 65, size: 65, color: "#f97316" },
    { name: "R&B",        x: 15, y: 55, size: 70, color: "#ec4899" },
    { name: "Pop",        x: 60, y: 70, size: 85, color: "#06b6d4" },
    { name: "Classical",  x: 80, y: 60, size: 60, color: "#84cc16" },
    { name: "Ambient",    x: 45, y: 20, size: 55, color: "#22d3ee" },
    { name: "Folk",       x: 85, y: 40, size: 50, color: "#d97706" },
    { name: "Metal",      x: 65, y: 15, size: 60, color: "#6b7280" },
    { name: "Lo-Fi",      x: 35, y: 40, size: 55, color: "#a78bfa" },
    { name: "Reggae",     x: 10, y: 75, size: 45, color: "#16a34a" },
  ],

  /* ---- Avatar palette (static UI helpers) ---- */
  avatarColors: [
    "linear-gradient(135deg,#8b5cf6,#06b6d4)",
    "linear-gradient(135deg,#ec4899,#f97316)",
    "linear-gradient(135deg,#10b981,#06b6d4)",
    "linear-gradient(135deg,#f59e0b,#ef4444)",
    "linear-gradient(135deg,#6366f1,#8b5cf6)",
    "linear-gradient(135deg,#84cc16,#10b981)",
  ],

  /* ---- Reviews ---- */
  reviews: [],

  /* ---- Discussions ---- */
  discussions: [],

  /* ---- Discoveries ---- */
  discoveries: [],

  /* ---- Daily challenges (static definitions) ---- */
  challenges: [
    { title: "Genre Explorer",      desc: "Listen to 5 different genres today",                  total: 5,  reward: "🏆 Explorer Badge" },
    { title: "Hidden Gem Hunter",   desc: "Discover 3 artists with under 10K followers",         total: 3,  reward: "💎 Gem Badge" },
    { title: "Review Writer",       desc: "Write 2 album reviews this week",                     total: 2,  reward: "✍️ Critic Badge" },
    { title: "Playlist Builder",    desc: "Add 10 tracks to a playlist",                         total: 10, reward: "🎧 Curator Badge" },
    { title: "Social Sharer",       desc: "Share 3 discoveries with the community",              total: 3,  reward: "📢 Sharer Badge" },
  ],

  /* ---- Streaming platform helpers ---- */
  streamingPlatforms: [
    { id: "spotify",   name: "Spotify",       icon: "🟢", urlPattern: "open.spotify.com" },
    { id: "apple",     name: "Apple Music",   icon: "🍎", urlPattern: "music.apple.com" },
    { id: "youtube",   name: "YouTube Music", icon: "▶️",  urlPattern: "music.youtube.com" },
    { id: "tidal",     name: "Tidal",         icon: "🌊", urlPattern: "tidal.com" },
    { id: "deezer",    name: "Deezer",        icon: "🎵", urlPattern: "deezer.com" },
    { id: "soundcloud",name: "SoundCloud",    icon: "🔶", urlPattern: "soundcloud.com" },
    { id: "bandcamp",  name: "Bandcamp",      icon: "🏕️", urlPattern: "bandcamp.com" },
    { id: "amazon",    name: "Amazon Music",  icon: "📦", urlPattern: "music.amazon.com" },
  ],
};

/* ============================================================
   LocalStorage persistence layer
   ============================================================ */
const MU6Store = {

  _key: "mu6_store",

  _defaults() {
    return {
      users: [],          // registered accounts
      currentUser: null,  // logged-in user id
      artists: [],
      songs: [],
      albums: [],
      playlists: [],
      reviews: [],
      discussions: [],
      follows: {},        // { userId: [artistId, ...] }
      favorites: {},      // { userId: [songId, ...] }
      history: {},        // { userId: [{ id, type, ts }] }
      ratings: {},        // { userId: { albumId: rating } }
      genreCounts: {},    // { genreName: count }
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this._key);
      if (!raw) return this._defaults();
      return { ...this._defaults(), ...JSON.parse(raw) };
    } catch {
      return this._defaults();
    }
  },

  save(state) {
    try {
      localStorage.setItem(this._key, JSON.stringify(state));
    } catch (e) {
      console.warn("MU6Store: could not persist to localStorage", e);
    }
  },

  get() { return this.load(); },

  set(updater) {
    const state = this.load();
    const next = typeof updater === "function" ? updater(state) : { ...state, ...updater };
    this.save(next);
    return next;
  },

  /* ---- Auth ---- */
  register({ username, email, password }) {
    const state = this.load();
    if (state.users.find(u => u.email === email)) return { ok: false, error: "Email already registered." };
    if (state.users.find(u => u.username === username)) return { ok: false, error: "Username taken." };
    const user = {
      id: "u_" + Date.now(),
      username,
      email,
      passwordHash: btoa(password), // NOTE: not secure – demo only
      avatar: null,
      bio: "",
      level: "New Listener",
      joinedAt: new Date().toISOString(),
      badges: [],
      challengeProgress: {},
    };
    state.users.push(user);
    state.currentUser = user.id;
    this.save(state);
    return { ok: true, user };
  },

  login({ email, password }) {
    const state = this.load();
    const user = state.users.find(u => u.email === email && u.passwordHash === btoa(password));
    if (!user) return { ok: false, error: "Invalid email or password." };
    state.currentUser = user.id;
    this.save(state);
    return { ok: true, user };
  },

  logout() {
    this.set(s => ({ ...s, currentUser: null }));
  },

  currentUser() {
    const state = this.load();
    if (!state.currentUser) return null;
    return state.users.find(u => u.id === state.currentUser) || null;
  },

  /* ---- Artists ---- */
  addArtist({ name, bio, genres, streamingLinks, emoji }) {
    const user = this.currentUser();
    if (!user) return { ok: false, error: "Not logged in." };
    const artist = {
      id: "a_" + Date.now(),
      name: name.trim(),
      bio: bio.trim(),
      genres: genres || [],
      emoji: emoji || "🎵",
      streamingLinks: streamingLinks || {},  // { spotify: url, apple: url, ... }
      submittedBy: user.id,
      followers: 0,
      monthly: 0,
      createdAt: new Date().toISOString(),
    };
    this.set(s => ({ ...s, artists: [...s.artists, artist] }));
    return { ok: true, artist };
  },

  getArtists() { return this.load().artists; },
  getArtist(id) { return this.load().artists.find(a => a.id === id) || null; },

  /* ---- Songs ---- */
  addSong({ title, artistId, artistName, genre, duration, streamingLinks, emoji }) {
    const user = this.currentUser();
    if (!user) return { ok: false, error: "Not logged in." };
    const song = {
      id: "s_" + Date.now(),
      title: title.trim(),
      artistId,
      artistName: artistName.trim(),
      genre,
      duration: duration || "",
      emoji: emoji || "🎵",
      streamingLinks: streamingLinks || {},  // { spotify: url, youtube: url, ... }
      submittedBy: user.id,
      plays: 0,
      createdAt: new Date().toISOString(),
    };
    this.set(s => {
      const gc = { ...s.genreCounts };
      if (genre) gc[genre] = (gc[genre] || 0) + 1;
      return { ...s, songs: [...s.songs, song], genreCounts: gc };
    });
    return { ok: true, song };
  },

  getSongs() { return this.load().songs; },
  getSong(id) { return this.load().songs.find(s => s.id === id) || null; },

  /* ---- Albums ---- */
  addAlbum({ title, artistId, artistName, year, genre, streamingLinks, emoji, trackCount }) {
    const user = this.currentUser();
    if (!user) return { ok: false, error: "Not logged in." };
    const album = {
      id: "al_" + Date.now(),
      title: title.trim(),
      artistId,
      artistName: artistName.trim(),
      year: year || new Date().getFullYear(),
      genre,
      emoji: emoji || "💿",
      streamingLinks: streamingLinks || {},
      trackCount: trackCount || 0,
      submittedBy: user.id,
      ratingSum: 0,
      ratingCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.set(s => ({ ...s, albums: [...s.albums, album] }));
    return { ok: true, album };
  },

  getAlbums() { return this.load().albums; },
  getAlbum(id) { return this.load().albums.find(a => a.id === id) || null; },

  /* ---- Playlists ---- */
  createPlaylist({ title, description, category, emoji }) {
    const user = this.currentUser();
    if (!user) return { ok: false, error: "Not logged in." };
    const playlist = {
      id: "p_" + Date.now(),
      title: title.trim(),
      description: (description || "").trim(),
      category: category || "community",
      emoji: emoji || "🎧",
      ownerId: user.id,
      ownerName: user.username,
      songs: [],          // array of song ids
      followers: 0,
      createdAt: new Date().toISOString(),
    };
    this.set(s => ({ ...s, playlists: [...s.playlists, playlist] }));
    return { ok: true, playlist };
  },

  addSongToPlaylist(playlistId, songId) {
    const user = this.currentUser();
    if (!user) return { ok: false, error: "Not logged in." };
    this.set(s => ({
      ...s,
      playlists: s.playlists.map(p =>
        p.id === playlistId && p.ownerId === user.id
          ? { ...p, songs: p.songs.includes(songId) ? p.songs : [...p.songs, songId] }
          : p
      ),
    }));
    return { ok: true };
  },

  getPlaylists() { return this.load().playlists; },
  getPlaylist(id) { return this.load().playlists.find(p => p.id === id) || null; },

  /* ---- Reviews ---- */
  addReview({ albumId, albumTitle, albumArtist, albumEmoji, rating, text }) {
    const user = this.currentUser();
    if (!user) return { ok: false, error: "Not logged in." };
    const review = {
      id: "r_" + Date.now(),
      albumId,
      albumTitle,
      albumArtist,
      albumEmoji: albumEmoji || "💿",
      userId: user.id,
      username: user.username,
      userInitial: user.username[0].toUpperCase(),
      rating: Math.min(5, Math.max(1, rating)),
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    // update album rating
    this.set(s => ({
      ...s,
      reviews: [...s.reviews, review],
      albums: s.albums.map(a =>
        a.id === albumId
          ? { ...a, ratingSum: a.ratingSum + review.rating, ratingCount: a.ratingCount + 1 }
          : a
      ),
    }));
    return { ok: true, review };
  },

  getReviews(albumId) {
    const reviews = this.load().reviews;
    return albumId ? reviews.filter(r => r.albumId === albumId) : reviews;
  },

  /* ---- Discussions ---- */
  addDiscussion({ title, body, category }) {
    const user = this.currentUser();
    if (!user) return { ok: false, error: "Not logged in." };
    const disc = {
      id: "d_" + Date.now(),
      title: title.trim(),
      body: (body || "").trim(),
      category: category || "General",
      userId: user.id,
      username: user.username,
      replies: 0,
      views: 0,
      hot: false,
      createdAt: new Date().toISOString(),
    };
    this.set(s => ({ ...s, discussions: [...s.discussions, disc] }));
    return { ok: true, disc };
  },

  getDiscussions() { return this.load().discussions; },

  /* ---- Follows ---- */
  toggleFollow(artistId) {
    const user = this.currentUser();
    if (!user) return { ok: false, error: "Not logged in." };
    this.set(s => {
      const follows = { ...s.follows };
      const list = follows[user.id] || [];
      follows[user.id] = list.includes(artistId)
        ? list.filter(id => id !== artistId)
        : [...list, artistId];
      // update artist follower count
      const artists = s.artists.map(a => {
        if (a.id !== artistId) return a;
        const delta = follows[user.id].includes(artistId) ? 1 : -1;
        return { ...a, followers: Math.max(0, a.followers + delta) };
      });
      return { ...s, follows, artists };
    });
    return { ok: true };
  },

  isFollowing(artistId) {
    const user = this.currentUser();
    if (!user) return false;
    const state = this.load();
    return (state.follows[user.id] || []).includes(artistId);
  },

  getFollowedArtists() {
    const user = this.currentUser();
    if (!user) return [];
    const state = this.load();
    const ids = state.follows[user.id] || [];
    return state.artists.filter(a => ids.includes(a.id));
  },

  /* ---- Favorites ---- */
  toggleFavorite(songId) {
    const user = this.currentUser();
    if (!user) return { ok: false, error: "Not logged in." };
    this.set(s => {
      const favs = { ...s.favorites };
      const list = favs[user.id] || [];
      favs[user.id] = list.includes(songId)
        ? list.filter(id => id !== songId)
        : [...list, songId];
      return { ...s, favorites: favs };
    });
    return { ok: true };
  },

  isFavorite(songId) {
    const user = this.currentUser();
    if (!user) return false;
    const state = this.load();
    return (state.favorites[user.id] || []).includes(songId);
  },

  getFavorites() {
    const user = this.currentUser();
    if (!user) return [];
    const state = this.load();
    const ids = state.favorites[user.id] || [];
    return state.songs.filter(s => ids.includes(s.id));
  },

  /* ---- History ---- */
  addToHistory(itemId, type) {
    const user = this.currentUser();
    if (!user) return;
    this.set(s => {
      const hist = { ...s.history };
      const list = hist[user.id] || [];
      const entry = { id: itemId, type, ts: Date.now() };
      hist[user.id] = [entry, ...list.filter(e => !(e.id === itemId && e.type === type))].slice(0, 50);
      return { ...s, history: hist };
    });
  },

  getHistory() {
    const user = this.currentUser();
    if (!user) return [];
    const state = this.load();
    return state.history[user.id] || [];
  },

  /* ---- Ratings ---- */
  rateAlbum(albumId, rating) {
    const user = this.currentUser();
    if (!user) return { ok: false, error: "Not logged in." };
    this.set(s => {
      const ratings = { ...s.ratings };
      const prev = (ratings[user.id] || {})[albumId];
      ratings[user.id] = { ...(ratings[user.id] || {}), [albumId]: rating };
      const albums = s.albums.map(a => {
        if (a.id !== albumId) return a;
        let sum = a.ratingSum;
        let cnt = a.ratingCount;
        if (prev !== undefined) { sum -= prev; } else { cnt += 1; }
        sum += rating;
        return { ...a, ratingSum: sum, ratingCount: cnt };
      });
      return { ...s, ratings, albums };
    });
    return { ok: true };
  },

  getUserRating(albumId) {
    const user = this.currentUser();
    if (!user) return null;
    const state = this.load();
    return (state.ratings[user.id] || {})[albumId] || null;
  },

  /* ---- Search ---- */
  search(query) {
    if (!query || !query.trim()) return { artists: [], songs: [], albums: [], playlists: [] };
    const q = query.toLowerCase();
    const state = this.load();
    return {
      artists:   state.artists.filter(a => a.name.toLowerCase().includes(q) || (a.genres || []).some(g => g.toLowerCase().includes(q))),
      songs:     state.songs.filter(s => s.title.toLowerCase().includes(q) || s.artistName.toLowerCase().includes(q) || (s.genre || "").toLowerCase().includes(q)),
      albums:    state.albums.filter(a => a.title.toLowerCase().includes(q) || a.artistName.toLowerCase().includes(q)),
      playlists: state.playlists.filter(p => p.title.toLowerCase().includes(q)),
    };
  },

  /* ---- Genre counts (live) ---- */
  getGenreCounts() { return this.load().genreCounts || {}; },

  /* ---- Stats ---- */
  getSiteStats() {
    const state = this.load();
    return {
      artists:   state.artists.length,
      songs:     state.songs.length,
      albums:    state.albums.length,
      playlists: state.playlists.length,
      users:     state.users.length,
      reviews:   state.reviews.length,
    };
  },

  getUserStats() {
    const user = this.currentUser();
    if (!user) return null;
    const state = this.load();
    return {
      discovered: (state.history[user.id] || []).length,
      saved:      (state.favorites[user.id] || []).length,
      playlists:  state.playlists.filter(p => p.ownerId === user.id).length,
      reviews:    state.reviews.filter(r => r.userId === user.id).length,
      following:  (state.follows[user.id] || []).length,
      level:      user.level,
      badges:     user.badges || [],
    };
  },
};
