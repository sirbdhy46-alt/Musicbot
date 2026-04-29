export const formatDuration = (seconds: number): string => {
  if (!seconds || !isFinite(seconds) || seconds < 0) return "LIVE";
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const pad = (n: number): string => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

export const progressBar = (
  current: number,
  total: number,
  width = 18,
): string => {
  if (!total || !isFinite(total)) return "▰".repeat(width);
  const ratio = Math.min(Math.max(current / total, 0), 1);
  const filled = Math.round(ratio * width);
  return "▰".repeat(filled) + "▱".repeat(width - filled);
};

export const trunc = (text: string, max: number): string =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text;

export const detectSource = (
  url: string,
): "youtube" | "soundcloud" | "spotify" | "applemusic" | "other" => {
  const u = url.toLowerCase();
  if (u.includes("spotify.com")) return "spotify";
  if (u.includes("soundcloud.com")) return "soundcloud";
  if (u.includes("music.apple.com") || u.includes("itunes.apple.com")) {
    return "applemusic";
  }
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  return "other";
};
