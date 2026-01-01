# Movie Stream API

A high-performance REST API for fetching streaming URLs from Vidlink for movies and TV series. Built with Node.js, Fastify, and WebAssembly for token generation.

## Features

- Fetch streaming URLs for movies by TMDB ID
- Fetch streaming URLs for TV series episodes
- Search movies/series and retrieve TMDB metadata
- HLS playlist extraction with multiple quality options
- WebAssembly-based token generation for authentication
- Fast and lightweight using Fastify framework

## Prerequisites

- Node.js >= 18.x (for native fetch support)
- TMDB API Key (for search functionality)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/aryaniiil/vidapi.git
cd vidapi
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
TMDB_API_KEY=your_tmdb_api_key_here
```

4. Start the server:
```bash
npm start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### 1. Get Movie Stream

Fetch streaming data for a movie using its TMDB ID.

**Endpoint:** `GET /movie/:movieId`

**Parameters:**
- `movieId` (string, required) - The TMDB ID of the movie

**Example Request:**
```bash
curl http://localhost:3000/movie/550
```

**Example Response:**
```json
{
  "movieId": "550",
  "api_url": "https://vidlink.pro/api/b/movie/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAr9x1SDsmc8aKTy7YzQ_0CsGAAchNQFYZsJIobQ?multiLang=0",
  "headers": {
    "referer": "https://vidlink.pro/movie/550",
    "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36",
    "accept": "*/*",
    "origin": "https://vidlink.pro"
  },
  "playlist": "#EXTM3U\n#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=4500000,RESOLUTION=1920x1080\n...",
  "stream": {
    "playlist": "https://storm.vodvidl.site/proxy/file2/...",
    "sourceId": "stormflixerz"
  }
}
```

### 2. Get TV Series Episode Stream

Fetch streaming data for a specific TV series episode.

**Endpoint:** `GET /series/:tmdbId/:season/:episode`

**Parameters:**
- `tmdbId` (string, required) - The TMDB ID of the TV series
- `season` (integer, required) - Season number
- `episode` (integer, required) - Episode number

**Example Request:**
```bash
curl http://localhost:3000/series/1396/1/7
```

**Example Response:**
```json
{
  "tmdbId": "1396",
  "season": 1,
  "episode": 7,
  "api_url": "https://vidlink.pro/api/b/tv/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAr9x1SDsmc8aKTy7YzQ_0CsGAAchNQFYZsJIobQ/1/7?multiLang=0",
  "headers": {
    "referer": "https://vidlink.pro/tv/1396/1/7",
    "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36",
    "accept": "*/*",
    "origin": "https://vidlink.pro"
  },
  "playlist": "#EXTM3U\n#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=4500000,RESOLUTION=1920x1080\n/proxy/file2/HEhmp84DAHkAtkR4FDt9Wwp2uY+IpU+dwfAuwu076sj+bch9sE7tUK66iWCC9YRXEuRQ3PDMEVb5tdMzg3tC8i9hlnofNunUHuStZLwn7M7MZaFgBekRlKVMWPFySCtU8Xte2yJihFn7pxFnIUxE7wml1N7t1RQjHyVxfonbw=/MTA4MA==/aW5kZXgubTN1OA==.m3u8?headers=%7B%22referer%22%3A%22https%3A%2F%2Fvideostr.net%2F%22%2C%22origin%22%3A%22https%3A%2F%2Fvideostr.net%22%7D&host=https%3A%2F%2Frainflare53.pro\n#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=1800000,RESOLUTION=1280x720\n/proxy/file2/HEhmp84DAHkAtkR4FDt9Wwp2uY+IpU+dwfAuwu076sj+bch9sE7tUK66iWCC9YRXEuRQ3PDMEVb5tdMzg3tC8i9hlnofNunUHuStZLwn7M7MZaFgBekRlKVMWPFySCtU8Xte2yJihFn7pxFnIUxE7wml1N7t1RQjHyVxfonbw=/NzIw/aW5kZXgubTN1OA==.m3u8?headers=%7B%22referer%22%3A%22https%3A%2F%2Fvideostr.net%2F%22%2C%22origin%22%3A%22https%3A%2F%2Fvideostr.net%22%7D&host=https%3A%2F%2Frainflare53.pro\n#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=720000,RESOLUTION=640x360\n/proxy/file2/HEhmp84DAHkAtkR4FDt9Wwp2uY+IpU+dwfAuwu076sj+bch9sE7tUK66iWCC9YRXEuRQ3PDMEVb5tdMzg3tC8i9hlnofNunUHuStZLwn7M7MZaFgBekRlKVMWPFySCtU8Xte2yJihFn7pxFnIUxE7wml1N7t1RQjHyVxfonbw=/MzYw/aW5kZXgubTN1OA==.m3u8?headers=%7B%22referer%22%3A%22https%3A%2F%2Fvideostr.net%2F%22%2C%22origin%22%3A%22https%3A%2F%2Fvideostr.net%22%7D&host=https%3A%2F%2Frainflare53.pro\n",
  "sourceId": "stormflixerz"
}
```

### 3. Search Movies/Series

Search for movies or TV series and retrieve TMDB metadata.

**Endpoint:** `GET /search/:query`

**Parameters:**
- `query` (string, required) - Search query (movie or series name)

**Example Request:**
```bash
curl http://localhost:3000/search/breaking%20bad
```

**Example Response:**
```json
{
  "tmdbId": "1396",
  "type": "tv",
  "title": "Breaking Bad",
  "overview": "When Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer...",
  "poster": "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
  "backdrop": "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
  "cast": [
    {
      "name": "Bryan Cranston",
      "character": "Walter White",
      "profile": "https://image.tmdb.org/t/p/w185/7Jahy5LZX2Fo8fGJltMreAI49hC.jpg"
    }
  ],
  "images": [
    "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg"
  ]
}
```

### 4. Health Check

Check if the API and WASM module are initialized.

**Endpoint:** `GET /health`

**Example Request:**
```bash
curl http://localhost:3000/health
```

**Example Response:**
```json
{
  "status": "ok",
  "wasmInitialized": true
}
```

## Understanding the Response

### Response Fields

- `api_url` - The Vidlink API endpoint used to fetch the stream
- `headers` - Required HTTP headers for accessing the stream URLs
- `playlist` - HLS master playlist containing multiple quality streams
- `sourceId` - The streaming source identifier (e.g., "stormflixerz")

### HLS Playlist Format

The `playlist` field contains an HLS master playlist with multiple quality options:

```
#EXTM3U
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=4500000,RESOLUTION=1920x1080
<1080p stream URL>
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=1800000,RESOLUTION=1280x720
<720p stream URL>
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=720000,RESOLUTION=640x360
<360p stream URL>
```

Each stream URL is a relative path that needs to be combined with the base domain.

## Using the Stream URLs

### Method 1: Direct Access with cURL

To access the stream URLs, you must include the required headers from the API response:

```bash
curl -H "referer: https://vidlink.pro/tv/1396/1/7" \
     -H "user-agent: Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36" \
     -H "accept: */*" \
     -H "origin: https://vidlink.pro" \
     "https://storm.vodvidl.site/proxy/file2/HEhm~p84DAHkAtkR~4FDt9Wwp2uY%2BIpU%2BdwfAuwu076sj%2Bbch9sE7tUK66iWCC9YRXEuRQ3PDMEVb5tdMzg3tC8i9hlnofNunUHuStZLwn7M7MZaFgBekRlKVMWPFySCtU8Xte2yJihFn7pxFnIUxE7wml1N7t1RQjHyVxfonbw%3D%2FcGxheWxpc3QubTN1OA%3D%3D.m3u8?headers=%7B%22referer%22%3A%22https://videostr.net/%22,%22origin%22:%22https://videostr.net%22%7D&host=https://rainflare53.pro"
```

### Method 2: Using with Video Players

#### FFmpeg
```bash
ffmpeg -headers "referer: https://vidlink.pro/tv/1396/1/7" \
       -user_agent "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36" \
       -i "https://storm.vodvidl.site/proxy/file2/.../playlist.m3u8" \
       -c copy output.mp4
```

#### Python with requests
```python
import requests

headers = {
    "referer": "https://vidlink.pro/tv/1396/1/7",
    "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36",
    "accept": "*/*",
    "origin": "https://vidlink.pro"
}

response = requests.get("https://storm.vodvidl.site/proxy/file2/.../playlist.m3u8", headers=headers)
playlist_content = response.text
print(playlist_content)
```

#### JavaScript/Node.js
```javascript
const fetch = require('node-fetch');

const headers = {
  'referer': 'https://vidlink.pro/tv/1396/1/7',
  'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
  'accept': '*/*',
  'origin': 'https://vidlink.pro'
};

fetch('https://storm.vodvidl.site/proxy/file2/.../playlist.m3u8', { headers })
  .then(res => res.text())
  .then(playlist => console.log(playlist));
```

### Method 3: Building a Video Player

When integrating with a video player (like Video.js, Plyr, or HLS.js), configure it to send the required headers:

```javascript
// Example with HLS.js
const video = document.getElementById('video');
const hls = new Hls({
  xhrSetup: function(xhr, url) {
    xhr.setRequestHeader('referer', 'https://vidlink.pro/tv/1396/1/7');
    xhr.setRequestHeader('origin', 'https://vidlink.pro');
  }
});

hls.loadSource('https://storm.vodvidl.site/proxy/file2/.../playlist.m3u8');
hls.attachMedia(video);
```

## URL Structure Explanation

The stream URLs follow this pattern:

```
https://storm.vodvidl.site/proxy/file2/{encrypted_path}/{quality}/{index}.m3u8?headers={encoded_headers}&host={origin_host}
```

**Components:**
- `encrypted_path` - Base64/encrypted path to the video resource
- `quality` - Base64 encoded quality identifier (MTA4MA== = 1080, NzIw = 720, MzYw = 360)
- `headers` - URL-encoded JSON with required referer and origin
- `host` - The origin server hosting the actual video files

## Important Notes

1. **Headers are Required**: All stream URLs must be accessed with the exact headers provided in the API response. Missing or incorrect headers will result in 403 Forbidden errors.

2. **URL Encoding**: When using stream URLs in browsers or HTTP clients, ensure proper URL encoding of special characters.

3. **Token Expiration**: Generated tokens may expire after a certain period. If streams stop working, request a new token from the API.

4. **Rate Limiting**: Be respectful of the upstream services. Implement caching and rate limiting in production environments.

5. **CORS**: If accessing from a browser, you may need to implement a proxy to handle CORS restrictions.

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `500` - Internal Server Error (WASM initialization failed, upstream API error, etc.)

**Error Response Format:**
```json
{
  "error": "Error message describing what went wrong"
}
```

## Development

### Project Structure
```
reversevid/
├── server.js          # Main API server
├── fu.wasm            # WebAssembly module for token generation
├── wasm_exec.js       # Go WASM runtime
├── package.json       # Dependencies
├── .env               # Environment variables
└── README.md          # This file
```

### Environment Variables

- `PORT` - Server port (default: 3000)
- `TMDB_API_KEY` - Your TMDB API key for search functionality

### Running in Development

```bash
npm install
npm start
```

### Running with Nodemon (auto-reload)

```bash
npm install -g nodemon
nodemon server.js
```

## License

This project is for educational purposes only. Respect copyright laws and terms of service of upstream providers.

## Disclaimer

This API is a reverse-engineered implementation for educational purposes. The authors are not responsible for any misuse or legal issues arising from the use of this software. Always ensure you have the right to access and stream content.
