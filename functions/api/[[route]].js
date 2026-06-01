/**
 * MU6 – Cloudflare Pages Functions
 * Catch-all API handler: /api/*
 *
 * All data is stored in Cloudflare KV (MU6_DATA namespace).
 * Bind the KV namespace in your Cloudflare Pages dashboard:
 *   Settings → Functions → KV namespace bindings → Variable: MU6_DATA
 *
 * Routes:
 *   GET  /api/artists          – list all artists
 *   POST /api/artists          – create artist
 *   GET  /api/artists/:id      – get artist
 *
 *   GET  /api/songs            – list all songs
 *   POST /api/songs            – create song
 *
 *   GET  /api/albums           – list all albums
 *   POST /api/albums           – create album
 *
 *   GET  /api/playlists        – list all playlists
 *   POST /api/playlists        – create playlist
 *   GET  /api/playlists/:id    – get playlist
 *   POST /api/playlists/:id/songs – add song to playlist
 *
 *   GET  /api/reviews          – list all reviews
 *   POST /api/reviews          – create review
 *
 *   GET  /api/discussions      – list all discussions
 *   POST /api/discussions      – create discussion
 *
 *   POST /api/auth/register    – register user
 *   POST /api/auth/login       – login user
 *
 *   GET  /api/stats            – site stats
 *   GET  /api/search?q=        – search
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function err(msg, status = 400) {
  return json({ ok: false, error: msg }, status);
}

async function kvGet(kv, key, fallback = []) {
  try {
    const val = await kv.get(key, "json");
    return val ?? fallback;
  } catch {
    return fallback;
  }
}

async function kvSet(kv, key, value) {
  await kv.put(key, JSON.stringify(value));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ---- Auth helpers ---- */
function hashPassword(pw) {
  // Simple base64 – replace with bcrypt/argon2 via a Worker binding in production
  return btoa(pw);
}

async function getUser(kv, userId) {
  const users = await kvGet(kv, "users", []);
  return users.find((u) => u.id === userId) || null;
}

async function getUserFromToken(kv, request) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace("Bearer ", "").trim();
  if (!token) return null;
  // Token is just userId:passwordHash (demo – use JWT in production)
  const [userId] = token.split(":");
  return getUser(kv, userId);
}

/* ================================================================
   MAIN HANDLER
   ================================================================ */
export async function onRequest(context) {
  const { request, env } = context;
  const kv = env.MU6_DATA;

  // OPTIONS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  const url = new URL(request.url);
  // Strip /api/ prefix and split into segments
  const path = url.pathname.replace(/^\/api\/?/, "");
  const segments = path.split("/").filter(Boolean);
  const method = request.method;

  let body = {};
  if (method === "POST" || method === "PUT") {
    try { body = await request.json(); } catch { body = {}; }
  }

  // If KV not bound, return helpful error
  if (!kv) {
    return err("KV namespace MU6_DATA not bound. See Cloudflare Pages → Settings → Functions → KV namespace bindings.", 503);
  }

  /* ---- /api/stats ---- */
  if (segments[0] === "stats" && method === "GET") {
    const [artists, songs, albums, playlists, users, reviews] = await Promise.all([
      kvGet(kv, "artists", []),
      kvGet(kv, "songs", []),
      kvGet(kv, "albums", []),
      kvGet(kv, "playlists", []),
      kvGet(kv, "users", []),
      kvGet(kv, "reviews", []),
    ]);
    return json({ artists: artists.length, songs: songs.length, albums: albums.length, playlists: playlists.length, users: users.length, reviews: reviews.length });
  }

  /* ---- /api/search?q= ---- */
  if (segments[0] === "search" && method === "GET") {
    const q = (url.searchParams.get("q") || "").toLowerCase().trim();
    if (!q) return json({ artists: [], songs: [], albums: [], playlists: [] });
    const [artists, songs, albums, playlists] = await Promise.all([
      kvGet(kv, "artists", []),
      kvGet(kv, "songs", []),
      kvGet(kv, "albums", []),
      kvGet(kv, "playlists", []),
    ]);
    return json({
      artists:   artists.filter(a => a.name.toLowerCase().includes(q) || (a.genres||[]).some(g => g.toLowerCase().includes(q))),
      songs:     songs.filter(s => s.title.toLowerCase().includes(q) || s.artistName.toLowerCase().includes(q)),
      albums:    albums.filter(a => a.title.toLowerCase().includes(q) || a.artistName.toLowerCase().includes(q)),
      playlists: playlists.filter(p => p.title.toLowerCase().includes(q)),
    });
  }

  /* ---- /api/auth/register ---- */
  if (segments[0] === "auth" && segments[1] === "register" && method === "POST") {
    const { username, email, password } = body;
    if (!username || !email || !password) return err("username, email, and password are required.");
    if (password.length < 6) return err("Password must be at least 6 characters.");
    const users = await kvGet(kv, "users", []);
    if (users.find(u => u.email === email)) return err("Email already registered.");
    if (users.find(u => u.username === username)) return err("Username taken.");
    const user = {
      id: "u_" + uid(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      level: "New Listener",
      joinedAt: new Date().toISOString(),
      badges: [],
    };
    users.push(user);
    await kvSet(kv, "users", users);
    const token = `${user.id}:${user.passwordHash}`;
    return json({ ok: true, token, user: { id: user.id, username: user.username, email: user.email, level: user.level } });
  }

  /* ---- /api/auth/login ---- */
  if (segments[0] === "auth" && segments[1] === "login" && method === "POST") {
    const { email, password } = body;
    if (!email || !password) return err("email and password are required.");
    const users = await kvGet(kv, "users", []);
    const user = users.find(u => u.email === email.toLowerCase() && u.passwordHash === hashPassword(password));
    if (!user) return err("Invalid email or password.", 401);
    const token = `${user.id}:${user.passwordHash}`;
    return json({ ok: true, token, user: { id: user.id, username: user.username, email: user.email, level: user.level } });
  }

  /* ---- /api/artists ---- */
  if (segments[0] === "artists") {
    if (method === "GET" && !segments[1]) {
      const artists = await kvGet(kv, "artists", []);
      const genre = url.searchParams.get("genre");
      const sort = url.searchParams.get("sort") || "newest";
      let result = genre ? artists.filter(a => (a.genres||[]).includes(genre)) : artists;
      if (sort === "followers") result.sort((a,b) => b.followers - a.followers);
      else if (sort === "name") result.sort((a,b) => a.name.localeCompare(b.name));
      else result = result.slice().reverse();
      return json(result);
    }
    if (method === "GET" && segments[1]) {
      const artists = await kvGet(kv, "artists", []);
      const artist = artists.find(a => a.id === segments[1]);
      if (!artist) return err("Artist not found.", 404);
      return json(artist);
    }
    if (method === "POST") {
      const user = await getUserFromToken(kv, request);
      if (!user) return err("Unauthorized.", 401);
      const { name, bio, genres, streamingLinks, emoji } = body;
      if (!name) return err("name is required.");
      const artists = await kvGet(kv, "artists", []);
      const artist = {
        id: "a_" + uid(),
        name: name.trim(),
        bio: (bio||"").trim(),
        genres: genres || [],
        emoji: emoji || "🎵",
        streamingLinks: streamingLinks || {},
        submittedBy: user.id,
        followers: 0,
        createdAt: new Date().toISOString(),
      };
      artists.push(artist);
      await kvSet(kv, "artists", artists);
      return json({ ok: true, artist }, 201);
    }
  }

  /* ---- /api/songs ---- */
  if (segments[0] === "songs") {
    if (method === "GET" && !segments[1]) {
      const songs = await kvGet(kv, "songs", []);
      const genre = url.searchParams.get("genre");
      const artistId = url.searchParams.get("artistId");
      let result = songs;
      if (genre) result = result.filter(s => s.genre === genre);
      if (artistId) result = result.filter(s => s.artistId === artistId);
      return json(result.slice().reverse());
    }
    if (method === "GET" && segments[1]) {
      const songs = await kvGet(kv, "songs", []);
      const song = songs.find(s => s.id === segments[1]);
      if (!song) return err("Song not found.", 404);
      return json(song);
    }
    if (method === "POST") {
      const user = await getUserFromToken(kv, request);
      if (!user) return err("Unauthorized.", 401);
      const { title, artistId, artistName, genre, duration, streamingLinks, emoji } = body;
      if (!title || !artistId || !artistName) return err("title, artistId, and artistName are required.");
      if (!streamingLinks || !Object.keys(streamingLinks).length) return err("At least one streaming link is required.");
      const songs = await kvGet(kv, "songs", []);
      const song = {
        id: "s_" + uid(),
        title: title.trim(),
        artistId,
        artistName: artistName.trim(),
        genre: genre || "",
        duration: duration || "",
        emoji: emoji || "🎵",
        streamingLinks: streamingLinks || {},
        submittedBy: user.id,
        plays: 0,
        createdAt: new Date().toISOString(),
      };
      songs.push(song);
      await kvSet(kv, "songs", songs);
      // Update genre counts
      if (genre) {
        const counts = await kvGet(kv, "genreCounts", {});
        counts[genre] = (counts[genre] || 0) + 1;
        await kvSet(kv, "genreCounts", counts);
      }
      return json({ ok: true, song }, 201);
    }
  }

  /* ---- /api/albums ---- */
  if (segments[0] === "albums") {
    if (method === "GET" && !segments[1]) {
      const albums = await kvGet(kv, "albums", []);
      const genre = url.searchParams.get("genre");
      const artistId = url.searchParams.get("artistId");
      let result = albums;
      if (genre) result = result.filter(a => a.genre === genre);
      if (artistId) result = result.filter(a => a.artistId === artistId);
      return json(result.slice().reverse());
    }
    if (method === "GET" && segments[1]) {
      const albums = await kvGet(kv, "albums", []);
      const album = albums.find(a => a.id === segments[1]);
      if (!album) return err("Album not found.", 404);
      return json(album);
    }
    if (method === "POST") {
      const user = await getUserFromToken(kv, request);
      if (!user) return err("Unauthorized.", 401);
      const { title, artistId, artistName, year, genre, streamingLinks, emoji, trackCount } = body;
      if (!title || !artistId || !artistName) return err("title, artistId, and artistName are required.");
      if (!streamingLinks || !Object.keys(streamingLinks).length) return err("At least one streaming link is required.");
      const albums = await kvGet(kv, "albums", []);
      const album = {
        id: "al_" + uid(),
        title: title.trim(),
        artistId,
        artistName: artistName.trim(),
        year: year || new Date().getFullYear(),
        genre: genre || "",
        emoji: emoji || "💿",
        streamingLinks: streamingLinks || {},
        trackCount: trackCount || 0,
        submittedBy: user.id,
        ratingSum: 0,
        ratingCount: 0,
        createdAt: new Date().toISOString(),
      };
      albums.push(album);
      await kvSet(kv, "albums", albums);
      return json({ ok: true, album }, 201);
    }
  }

  /* ---- /api/playlists ---- */
  if (segments[0] === "playlists") {
    if (method === "GET" && !segments[1]) {
      const playlists = await kvGet(kv, "playlists", []);
      const category = url.searchParams.get("category");
      const result = category ? playlists.filter(p => p.category === category) : playlists;
      return json(result.slice().reverse());
    }
    if (method === "GET" && segments[1] && !segments[2]) {
      const playlists = await kvGet(kv, "playlists", []);
      const playlist = playlists.find(p => p.id === segments[1]);
      if (!playlist) return err("Playlist not found.", 404);
      return json(playlist);
    }
    if (method === "POST" && !segments[1]) {
      const user = await getUserFromToken(kv, request);
      if (!user) return err("Unauthorized.", 401);
      const { title, description, category, emoji } = body;
      if (!title) return err("title is required.");
      const playlists = await kvGet(kv, "playlists", []);
      const playlist = {
        id: "p_" + uid(),
        title: title.trim(),
        description: (description||"").trim(),
        category: category || "community",
        emoji: emoji || "🎧",
        ownerId: user.id,
        ownerName: user.username,
        songs: [],
        followers: 0,
        createdAt: new Date().toISOString(),
      };
      playlists.push(playlist);
      await kvSet(kv, "playlists", playlists);
      return json({ ok: true, playlist }, 201);
    }
    // POST /api/playlists/:id/songs
    if (method === "POST" && segments[1] && segments[2] === "songs") {
      const user = await getUserFromToken(kv, request);
      if (!user) return err("Unauthorized.", 401);
      const { songId } = body;
      if (!songId) return err("songId is required.");
      const playlists = await kvGet(kv, "playlists", []);
      const idx = playlists.findIndex(p => p.id === segments[1]);
      if (idx === -1) return err("Playlist not found.", 404);
      if (playlists[idx].ownerId !== user.id) return err("Forbidden.", 403);
      if (!playlists[idx].songs.includes(songId)) {
        playlists[idx].songs.push(songId);
        await kvSet(kv, "playlists", playlists);
      }
      return json({ ok: true });
    }
  }

  /* ---- /api/reviews ---- */
  if (segments[0] === "reviews") {
    if (method === "GET") {
      const reviews = await kvGet(kv, "reviews", []);
      const albumId = url.searchParams.get("albumId");
      const result = albumId ? reviews.filter(r => r.albumId === albumId) : reviews;
      return json(result.slice().reverse());
    }
    if (method === "POST") {
      const user = await getUserFromToken(kv, request);
      if (!user) return err("Unauthorized.", 401);
      const { albumId, albumTitle, albumArtist, albumEmoji, rating, text } = body;
      if (!albumId || !rating || !text) return err("albumId, rating, and text are required.");
      const r = Math.min(5, Math.max(1, parseInt(rating)));
      const reviews = await kvGet(kv, "reviews", []);
      const review = {
        id: "r_" + uid(),
        albumId,
        albumTitle: albumTitle || "",
        albumArtist: albumArtist || "",
        albumEmoji: albumEmoji || "💿",
        userId: user.id,
        username: user.username,
        userInitial: user.username[0].toUpperCase(),
        rating: r,
        text: text.trim(),
        createdAt: new Date().toISOString(),
      };
      reviews.push(review);
      await kvSet(kv, "reviews", reviews);
      // Update album rating
      const albums = await kvGet(kv, "albums", []);
      const aIdx = albums.findIndex(a => a.id === albumId);
      if (aIdx !== -1) {
        albums[aIdx].ratingSum += r;
        albums[aIdx].ratingCount += 1;
        await kvSet(kv, "albums", albums);
      }
      return json({ ok: true, review }, 201);
    }
  }

  /* ---- /api/discussions ---- */
  if (segments[0] === "discussions") {
    if (method === "GET") {
      const discussions = await kvGet(kv, "discussions", []);
      const category = url.searchParams.get("category");
      const result = category ? discussions.filter(d => d.category === category) : discussions;
      return json(result.slice().reverse());
    }
    if (method === "POST") {
      const user = await getUserFromToken(kv, request);
      if (!user) return err("Unauthorized.", 401);
      const { title, body: bodyText, category } = body;
      if (!title) return err("title is required.");
      const discussions = await kvGet(kv, "discussions", []);
      const disc = {
        id: "d_" + uid(),
        title: title.trim(),
        body: (bodyText||"").trim(),
        category: category || "General",
        userId: user.id,
        username: user.username,
        replies: 0,
        views: 0,
        hot: false,
        createdAt: new Date().toISOString(),
      };
      discussions.push(disc);
      await kvSet(kv, "discussions", discussions);
      return json({ ok: true, disc }, 201);
    }
  }

  /* ---- /api/follows ---- */
  if (segments[0] === "follows") {
    if (method === "POST") {
      const user = await getUserFromToken(kv, request);
      if (!user) return err("Unauthorized.", 401);
      const { artistId } = body;
      if (!artistId) return err("artistId is required.");
      const follows = await kvGet(kv, `follows:${user.id}`, []);
      const isFollowing = follows.includes(artistId);
      const updated = isFollowing ? follows.filter(id => id !== artistId) : [...follows, artistId];
      await kvSet(kv, `follows:${user.id}`, updated);
      // Update artist follower count
      const artists = await kvGet(kv, "artists", []);
      const aIdx = artists.findIndex(a => a.id === artistId);
      if (aIdx !== -1) {
        artists[aIdx].followers = Math.max(0, artists[aIdx].followers + (isFollowing ? -1 : 1));
        await kvSet(kv, "artists", artists);
      }
      return json({ ok: true, following: !isFollowing });
    }
    if (method === "GET" && segments[1]) {
      const follows = await kvGet(kv, `follows:${segments[1]}`, []);
      return json(follows);
    }
  }

  /* ---- /api/favorites ---- */
  if (segments[0] === "favorites") {
    if (method === "POST") {
      const user = await getUserFromToken(kv, request);
      if (!user) return err("Unauthorized.", 401);
      const { songId } = body;
      if (!songId) return err("songId is required.");
      const favs = await kvGet(kv, `favorites:${user.id}`, []);
      const isFav = favs.includes(songId);
      const updated = isFav ? favs.filter(id => id !== songId) : [...favs, songId];
      await kvSet(kv, `favorites:${user.id}`, updated);
      return json({ ok: true, favorited: !isFav });
    }
    if (method === "GET" && segments[1]) {
      const favs = await kvGet(kv, `favorites:${segments[1]}`, []);
      return json(favs);
    }
  }

  /* ---- /api/genre-counts ---- */
  if (segments[0] === "genre-counts" && method === "GET") {
    const counts = await kvGet(kv, "genreCounts", {});
    return json(counts);
  }

  return err("Not found.", 404);
}
