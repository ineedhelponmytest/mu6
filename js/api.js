/* ============================================================
   MU6 – API Client
   Talks to Cloudflare Pages Functions (/api/*) when deployed.
   Falls back to MU6Store (localStorage) when running locally
   without a server (file:// or no KV binding).
   ============================================================ */

const MU6API = (() => {

  /* ---- Detect if we have a real API available ---- */
  const IS_DEPLOYED = window.location.protocol !== "file:" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";

  /* ---- Token management ---- */
  function getToken() { return localStorage.getItem("mu6_token") || ""; }
  function setToken(t) { localStorage.setItem("mu6_token", t); }
  function clearToken() { localStorage.removeItem("mu6_token"); }

  /* ---- HTTP helpers ---- */
  async function req(method, path, body) {
    const opts = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    const token = getToken();
    if (token) opts.headers["Authorization"] = `Bearer ${token}`;
    if (body) opts.body = JSON.stringify(body);
    try {
      const res = await fetch(`/api${path}`, opts);
      return res.json();
    } catch {
      return { ok: false, error: "Network error. Check your connection." };
    }
  }

  const get  = (path)       => req("GET",  path);
  const post = (path, body) => req("POST", path, body);

  /* ---- Auth ---- */
  async function register(username, email, password) {
    if (!IS_DEPLOYED) {
      const r = MU6Store.register({ username, email, password });
      return r;
    }
    const r = await post("/auth/register", { username, email, password });
    if (r.ok && r.token) setToken(r.token);
    return r;
  }

  async function login(email, password) {
    if (!IS_DEPLOYED) {
      const r = MU6Store.login({ email, password });
      return r;
    }
    const r = await post("/auth/login", { email, password });
    if (r.ok && r.token) {
      setToken(r.token);
      // Cache user in localStorage for UI
      localStorage.setItem("mu6_user", JSON.stringify(r.user));
    }
    return r;
  }

  function logout() {
    if (!IS_DEPLOYED) { MU6Store.logout(); return; }
    clearToken();
    localStorage.removeItem("mu6_user");
  }

  function currentUser() {
    if (!IS_DEPLOYED) return MU6Store.currentUser();
    const raw = localStorage.getItem("mu6_user");
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  /* ---- Stats ---- */
  async function getSiteStats() {
    if (!IS_DEPLOYED) return MU6Store.getSiteStats();
    return get("/stats");
  }

  /* ---- Search ---- */
  async function search(q) {
    if (!IS_DEPLOYED) return MU6Store.search(q);
    return get(`/search?q=${encodeURIComponent(q)}`);
  }

  /* ---- Artists ---- */
  async function getArtists(params = {}) {
    if (!IS_DEPLOYED) {
      let artists = MU6Store.getArtists();
      if (params.genre) artists = artists.filter(a => (a.genres||[]).includes(params.genre));
      if (params.sort === "followers") artists.sort((a,b) => b.followers - a.followers);
      else if (params.sort === "name") artists.sort((a,b) => a.name.localeCompare(b.name));
      else artists = artists.slice().reverse();
      return artists;
    }
    const qs = new URLSearchParams(params).toString();
    return get(`/artists${qs ? "?" + qs : ""}`);
  }

  async function getArtist(id) {
    if (!IS_DEPLOYED) return MU6Store.getArtist(id);
    return get(`/artists/${id}`);
  }

  async function addArtist(data) {
    if (!IS_DEPLOYED) return MU6Store.addArtist(data);
    return post("/artists", data);
  }

  /* ---- Songs ---- */
  async function getSongs(params = {}) {
    if (!IS_DEPLOYED) {
      let songs = MU6Store.getSongs();
      if (params.genre) songs = songs.filter(s => s.genre === params.genre);
      if (params.artistId) songs = songs.filter(s => s.artistId === params.artistId);
      return songs.slice().reverse();
    }
    const qs = new URLSearchParams(params).toString();
    return get(`/songs${qs ? "?" + qs : ""}`);
  }

  async function getSong(id) {
    if (!IS_DEPLOYED) return MU6Store.getSong(id);
    return get(`/songs/${id}`);
  }

  async function addSong(data) {
    if (!IS_DEPLOYED) return MU6Store.addSong(data);
    return post("/songs", data);
  }

  /* ---- Albums ---- */
  async function getAlbums(params = {}) {
    if (!IS_DEPLOYED) {
      let albums = MU6Store.getAlbums();
      if (params.genre) albums = albums.filter(a => a.genre === params.genre);
      if (params.artistId) albums = albums.filter(a => a.artistId === params.artistId);
      return albums.slice().reverse();
    }
    const qs = new URLSearchParams(params).toString();
    return get(`/albums${qs ? "?" + qs : ""}`);
  }

  async function getAlbum(id) {
    if (!IS_DEPLOYED) return MU6Store.getAlbum(id);
    return get(`/albums/${id}`);
  }

  async function addAlbum(data) {
    if (!IS_DEPLOYED) return MU6Store.addAlbum(data);
    return post("/albums", data);
  }

  /* ---- Playlists ---- */
  async function getPlaylists(params = {}) {
    if (!IS_DEPLOYED) {
      let playlists = MU6Store.getPlaylists();
      if (params.category) playlists = playlists.filter(p => p.category === params.category);
      return playlists.slice().reverse();
    }
    const qs = new URLSearchParams(params).toString();
    return get(`/playlists${qs ? "?" + qs : ""}`);
  }

  async function getPlaylist(id) {
    if (!IS_DEPLOYED) return MU6Store.getPlaylist(id);
    return get(`/playlists/${id}`);
  }

  async function createPlaylist(data) {
    if (!IS_DEPLOYED) return MU6Store.createPlaylist(data);
    return post("/playlists", data);
  }

  async function addSongToPlaylist(playlistId, songId) {
    if (!IS_DEPLOYED) return MU6Store.addSongToPlaylist(playlistId, songId);
    return post(`/playlists/${playlistId}/songs`, { songId });
  }

  /* ---- Reviews ---- */
  async function getReviews(albumId) {
    if (!IS_DEPLOYED) return MU6Store.getReviews(albumId);
    return get(`/reviews${albumId ? "?albumId=" + albumId : ""}`);
  }

  async function addReview(data) {
    if (!IS_DEPLOYED) return MU6Store.addReview(data);
    return post("/reviews", data);
  }

  /* ---- Discussions ---- */
  async function getDiscussions(category) {
    if (!IS_DEPLOYED) return MU6Store.getDiscussions();
    return get(`/discussions${category ? "?category=" + encodeURIComponent(category) : ""}`);
  }

  async function addDiscussion(data) {
    if (!IS_DEPLOYED) return MU6Store.addDiscussion(data);
    return post("/discussions", data);
  }

  /* ---- Follows ---- */
  async function toggleFollow(artistId) {
    if (!IS_DEPLOYED) return MU6Store.toggleFollow(artistId);
    return post("/follows", { artistId });
  }

  async function isFollowing(artistId) {
    if (!IS_DEPLOYED) return MU6Store.isFollowing(artistId);
    const user = currentUser();
    if (!user) return false;
    const follows = await get(`/follows/${user.id}`);
    return Array.isArray(follows) ? follows.includes(artistId) : false;
  }

  /* ---- Favorites ---- */
  async function toggleFavorite(songId) {
    if (!IS_DEPLOYED) return MU6Store.toggleFavorite(songId);
    return post("/favorites", { songId });
  }

  async function isFavorite(songId) {
    if (!IS_DEPLOYED) return MU6Store.isFavorite(songId);
    const user = currentUser();
    if (!user) return false;
    const favs = await get(`/favorites/${user.id}`);
    return Array.isArray(favs) ? favs.includes(songId) : false;
  }

  /* ---- Genre counts ---- */
  async function getGenreCounts() {
    if (!IS_DEPLOYED) return MU6Store.getGenreCounts();
    return get("/genre-counts");
  }

  return {
    IS_DEPLOYED,
    register, login, logout, currentUser,
    getSiteStats, search,
    getArtists, getArtist, addArtist,
    getSongs, getSong, addSong,
    getAlbums, getAlbum, addAlbum,
    getPlaylists, getPlaylist, createPlaylist, addSongToPlaylist,
    getReviews, addReview,
    getDiscussions, addDiscussion,
    toggleFollow, isFollowing,
    toggleFavorite, isFavorite,
    getGenreCounts,
  };
})();
