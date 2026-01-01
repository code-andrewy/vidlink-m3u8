// server.js
// Single-file REST API to fetch Vidlink stream data for a given movieId
// Requires: node >= 18.x (for fetch), or node 18+ with built-in fetch
// Dependencies (to install): fastify, libsodium-wrappers, cross-fetch (optional if using global fetch)
'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const sodium = require('libsodium-wrappers');

const { Go } = require('./wasm_exec.js');

// Lightweight, high-performance HTTP server
const Fastify = require('fastify');
const fastify = Fastify({ logger: true, trustProxy: true });

// Global placeholders to share WASM state across requests
let wasmInitialized = false;
let wasmGo = null;
let wasmInstanceReady = null;

async function initializeWasm() {
  if (wasmInitialized) return;

  // Initialize libsodium
  await sodium.ready;
  global.sodium = sodium;

  // Prepare WASM environment
  wasmGo = new Go();
  // Provide a safe window-like global for the WASM code
  global.window = global;
  global.self = global;

  // Load WASM module
  const wasmPath = path.resolve(__dirname, './fu.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);

  // Instantiate with Go's importObject
  const { instance } = await WebAssembly.instantiate(wasmBuffer, wasmGo.importObject);
  wasmGo.run(instance);

  // Small delay to ensure initialization completes
  await new Promise(r => setTimeout(r, 2000));

  wasmInitialized = true;
}

// Generate a vidlink token using the WASM-provided getAdv function
async function generateVidlinkToken(movieId) {
  await initializeWasm();

  // Emulate a browser-like location/document for the WASM code
  global.location = {
    href: `https://vidlink.pro/movie/${movieId}`,
    pathname: `/movie/${movieId}`,
    origin: 'https://vidlink.pro'
  };
  global.document = { location: global.location };

  if (typeof global.getAdv === 'function') {
    const token = global.getAdv(movieId.toString());
    if (!token) throw new Error('getAdv returned null/undefined');
    return token;
  }

  throw new Error('getAdv not defined by WASM');
}

// Fetch and return stream data for a movie
async function getStreamUrl(movieId) {
  const token = await generateVidlinkToken(movieId);
  const apiUrl = `https://vidlink.pro/api/b/movie/${token}?multiLang=0`;
  const referer = `https://vidlink.pro/movie/${movieId}`;
  const headers = {
    'referer': referer,
    'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
    'accept': '*/*',
    'origin': 'https://vidlink.pro'
  };
  const response = await fetch(apiUrl, { headers });
  if (!response.ok) throw new Error(`API status ${response.status}`);
  const data = await response.json();
  let playlist = null;
  if (data.stream?.playlist) {
    try {
      const plRes = await fetch(data.stream.playlist, { headers });
      playlist = await plRes.text();
    } catch {}
  }
  return { api_url: apiUrl, headers, playlist, ...data };
}

// Fetch series stream data
async function getSeriesStreamUrl(tmdbId, season, episode) {
  await initializeWasm();
  global.location = {
    href: `https://vidlink.pro/tv/${tmdbId}`,
    pathname: `/tv/${tmdbId}`,
    origin: 'https://vidlink.pro'
  };
  global.document = { location: global.location };
  if (typeof global.getAdv !== 'function') throw new Error('getAdv not defined');
  const token = global.getAdv(tmdbId.toString());
  if (!token) throw new Error('getAdv returned null');
  const apiUrl = `https://vidlink.pro/api/b/tv/${token}/${season}/${episode}?multiLang=0`;
  const referer = `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`;
  const headers = {
    'referer': referer,
    'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
    'accept': '*/*',
    'origin': 'https://vidlink.pro'
  };
  const response = await fetch(apiUrl, { headers });
  if (!response.ok) throw new Error(`API status ${response.status}`);
  const data = await response.json();
  let playlist = null;
  if (data.stream?.playlist) {
    try {
      const plRes = await fetch(data.stream.playlist, { headers });
      playlist = await plRes.text();
    } catch {}
  }
  return { api_url: apiUrl, headers, playlist, ...data };
}

// Search DuckDuckGo and extract TMDB ID
async function searchMovie(query) {
  const cleanQuery = query.replace(/\s+/g, '+');
  const [ddgRes, tmdbRes] = await Promise.all([
    fetch(`https://lite.duckduckgo.com/lite/?q=site:themoviedb.org+${cleanQuery}`, { headers: { 'user-agent': 'Mozilla/5.0' } }),
    null
  ]);
  const html = await ddgRes.text();
  const tmdbMatch = html.match(/themoviedb\.org\/(movie|tv)\/(\d+)/i);
  if (!tmdbMatch) throw new Error('No TMDB result found');
  const [, type, tmdbId] = tmdbMatch;
  const tmdbUrl = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${process.env.TMDB_API_KEY}`;
  const tmdbData = await (await fetch(tmdbUrl)).json();
  const [credits, images] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}/credits?api_key=${process.env.TMDB_API_KEY}`).then(r => r.json()).catch(() => ({ cast: [] })),
    fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}/images?api_key=${process.env.TMDB_API_KEY}`).then(r => r.json()).catch(() => ({ backdrops: [] }))
  ]);
  return {
    tmdbId,
    type,
    title: tmdbData.title || tmdbData.name,
    overview: tmdbData.overview,
    poster: tmdbData.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : null,
    backdrop: tmdbData.backdrop_path ? `https://image.tmdb.org/t/p/original${tmdbData.backdrop_path}` : null,
    cast: credits.cast?.slice(0, 10).map(c => ({ name: c.name, character: c.character, profile: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null })) || [],
    images: images.backdrops?.slice(0, 5).map(i => `https://image.tmdb.org/t/p/original${i.file_path}`) || []
  };
}

// Route handlers
fastify.get('/movie/:movieId', async (request, reply) => {
  const { movieId } = request.params;
  if (!movieId || typeof movieId !== 'string') {
    return reply.code(400).send({ error: 'Invalid movieId' });
  }
  try {
    const result = await getStreamUrl(movieId);
    reply.code(200).send({ movieId, ...result });
  } catch (err) {
    reply.code(500).send({ error: err.message });
  }
});

fastify.get('/series/:tmdbId/:season/:episode', async (request, reply) => {
  const { tmdbId, season, episode } = request.params;
  const s = parseInt(season), e = parseInt(episode);
  if (!tmdbId || isNaN(s) || isNaN(e)) {
    return reply.code(400).send({ error: 'Invalid parameters' });
  }
  try {
    const result = await getSeriesStreamUrl(tmdbId, s, e);
    reply.code(200).send({ tmdbId, season: s, episode: e, ...result });
  } catch (err) {
    reply.code(500).send({ error: err.message });
  }
});

fastify.get('/search/:query', async (request, reply) => {
  const { query } = request.params;
  if (!query) return reply.code(400).send({ error: 'Invalid query' });
  try {
    const result = await searchMovie(query);
    reply.code(200).send(result);
  } catch (err) {
    reply.code(500).send({ error: err.message });
  }
});

// Optional health check
fastify.get('/health', async () => {
  return { status: 'ok', wasmInitialized };
});

// Start server
const PORT = process.env.PORT || 3000;
fastify.listen({ port: PORT, host: '0.0.0.0' }).then(async () => {
  console.log(`API listening on http://0.0.0.0:${PORT}`);
  console.log('Initializing WASM...');
  await initializeWasm();
  console.log('WASM ready!');
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
