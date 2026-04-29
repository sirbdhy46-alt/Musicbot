import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_PATH = path.resolve(__dirname, "../../emojis.json");

export const EMOJI_NAMES = [
  "play", "pause", "skip", "prev", "stop", "loop", "shuffle", "autoplay",
  "volup", "voldown", "queue", "search", "fire", "sparkle", "crown",
  "check", "cross", "warning", "lock", "like",
  "mood_chill", "mood_hype", "mood_sad", "mood_dreamy",
  "youtube", "soundcloud", "spotify", "applemusic",
  "music_note", "aether_logo", "playing", "dj",
  "home", "headset", "bass", "mic", "disc_glow", "link_btn", "loading",
] as const;

export type EmojiName = (typeof EMOJI_NAMES)[number];

const TEXT_FALLBACK: Record<EmojiName, string> = {
  play: "`>`", pause: "`||`", skip: "`>>`", prev: "`<<`", stop: "`[]`",
  loop: "`(o)`", shuffle: "`<>`", autoplay: "`AUTO`", volup: "`VOL+`", voldown: "`VOL-`",
  queue: "`Q`", search: "`?`", fire: "`*`", sparkle: "`+`", crown: "`//`",
  check: "`OK`", cross: "`X`", warning: "`!`", lock: "`#`", like: "`<3`",
  mood_chill: "`~`", mood_hype: "`!!`", mood_sad: "`..`", mood_dreamy: "`zZ`",
  youtube: "`[YT]`", soundcloud: "`[SC]`", spotify: "`[SP]`", applemusic: "`[AM]`",
  music_note: "`~`", aether_logo: "`AE`", playing: "`>`", dj: "`DJ`",
  home: "`HOME`", headset: "`HS`", bass: "`BASS`", mic: "`MIC`",
  disc_glow: "`DISC`", link_btn: "`LINK`", loading: "`...`",
};

export const ANIMATED_DEFAULTS: ReadonlySet<EmojiName> = new Set(["playing", "loading"]);

type Store = Partial<Record<EmojiName, { id: string; animated?: boolean }>>;

let store: Store = {};
try {
  if (fs.existsSync(STORE_PATH)) {
    store = JSON.parse(fs.readFileSync(STORE_PATH, "utf8")) as Store;
  }
} catch {
  store = {};
}

export const saveEmojiStore = (next: Store): void => {
  store = next;
  fs.writeFileSync(STORE_PATH, JSON.stringify(next, null, 2));
};

export const getEmojiStore = (): Store => ({ ...store });

export const e = (name: EmojiName): string => {
  const entry = store[name];
  if (entry?.id) {
    return entry.animated
      ? `<a:${name}:${entry.id}>`
      : `<:${name}:${entry.id}>`;
  }
  return TEXT_FALLBACK[name] ?? "";
};

/** Returns a Discord component-friendly emoji descriptor (for buttons/select menus). */
export const eObj = (
  name: EmojiName,
): { id: string; name: string; animated: boolean } | undefined => {
  const entry = store[name];
  if (!entry?.id) return undefined;
  return { id: entry.id, name, animated: entry.animated ?? false };
};

export const setEmoji = (
  name: EmojiName,
  id: string,
  animated = false,
): void => {
  store[name] = { id, animated };
  saveEmojiStore(store);
};
