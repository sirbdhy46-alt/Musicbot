import { logger } from "../utils/logger.ts";

const GIPHY_BASE = "https://api.giphy.com/v1/gifs";
type Rating = "g" | "pg" | "pg-13" | "r";

// Curated public Giphy CDN fallbacks per "vibe" — used when the API is
// unavailable or no key is set, so commands always have something to show.
const FALLBACKS: Record<string, string[]> = {
  ban: [
    "https://media.giphy.com/media/3o7TKsQ8gqVrXnRyFG/giphy.gif",
    "https://media.giphy.com/media/UrHsoaYufuMHK/giphy.gif",
    "https://media.giphy.com/media/3o6MbsRfxr2ofLZRK0/giphy.gif",
  ],
  kick: [
    "https://media.giphy.com/media/Hcw7rjsIsHcmk/giphy.gif",
    "https://media.giphy.com/media/26gsspfbuEfn1jbfO/giphy.gif",
    "https://media.giphy.com/media/3oz8xRF4ZOoCu5UUco/giphy.gif",
  ],
  mute: [
    "https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif",
    "https://media.giphy.com/media/MTclfCr4tVgis/giphy.gif",
    "https://media.giphy.com/media/3oEjI8VMeISGfnV1u0/giphy.gif",
  ],
  warn: [
    "https://media.giphy.com/media/3orif6TfdvYqCGxDjW/giphy.gif",
    "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
  ],
  hug: [
    "https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif",
    "https://media.giphy.com/media/wnsgren9NtITS/giphy.gif",
    "https://media.giphy.com/media/PHZ7v9tfQu0o0/giphy.gif",
  ],
  slap: [
    "https://media.giphy.com/media/Gf3AUz3eBNbTW/giphy.gif",
    "https://media.giphy.com/media/jLeyZWgtwgr2U/giphy.gif",
    "https://media.giphy.com/media/xUNd9HZq1itMkiK652/giphy.gif",
  ],
  kiss: [
    "https://media.giphy.com/media/G3va31oEEnIkM/giphy.gif",
    "https://media.giphy.com/media/bGm9FuBCGg4SY/giphy.gif",
  ],
  pat: [
    "https://media.giphy.com/media/ye7OTQgwmVuVy/giphy.gif",
    "https://media.giphy.com/media/L2z7dnOduqEow/giphy.gif",
  ],
  bonk: [
    "https://media.giphy.com/media/IxmZTchgXxyDe/giphy.gif",
  ],
  welcome: [
    "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
    "https://media.giphy.com/media/26FxsQwgJyU4me9a0/giphy.gif",
  ],
  goodbye: [
    "https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif",
    "https://media.giphy.com/media/jWexnHbcSBO7e/giphy.gif",
  ],
  fire: [
    "https://media.giphy.com/media/26FPJGjhefSJuaRhu/giphy.gif",
    "https://media.giphy.com/media/3og0IO5z8Rd30ktV6g/giphy.gif",
  ],
  void: [
    "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
    "https://media.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.gif",
  ],
  win: [
    "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
    "https://media.giphy.com/media/3oz8xLd9DJq2l2VFtu/giphy.gif",
  ],
  lose: [
    "https://media.giphy.com/media/3o7TKqnN349PBUtGFO/giphy.gif",
    "https://media.giphy.com/media/l0HlOSnXfxjgi6oTu/giphy.gif",
  ],
};

function pickFallback(vibe: string): string | null {
  const list = FALLBACKS[vibe];
  if (!list || list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)] ?? null;
}

export async function searchGif(
  query: string,
  rating: Rating = "pg-13",
): Promise<string | null> {
  const key = process.env.GIPHY_API_KEY;
  if (!key) return pickFallback(query.toLowerCase());

  try {
    const url = `${GIPHY_BASE}/search?api_key=${encodeURIComponent(key)}&q=${encodeURIComponent(query)}&limit=25&rating=${rating}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 7000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return pickFallback(query.toLowerCase());
    const data = (await res.json()) as { data?: Array<{ images?: { original?: { url?: string } } }> };
    const items = data?.data ?? [];
    if (!items.length) return pickFallback(query.toLowerCase());
    const pick = items[Math.floor(Math.random() * items.length)];
    return pick?.images?.original?.url ?? pickFallback(query.toLowerCase());
  } catch (err) {
    logger.warn(`giphy search failed for "${query}": ${err}`);
    return pickFallback(query.toLowerCase());
  }
}

export async function vibeGif(
  vibe: keyof typeof FALLBACKS | string,
  searchQuery?: string,
): Promise<string | null> {
  const found = await searchGif(searchQuery ?? vibe);
  if (found) return found;
  return pickFallback(vibe);
}

export const GIPHY_VIBES = Object.keys(FALLBACKS);
