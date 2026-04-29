import { DisTube, Events } from "distube";
import { SoundCloudPlugin } from "@distube/soundcloud";
import { SpotifyPlugin } from "@distube/spotify";
import { YtDlpPlugin } from "@distube/yt-dlp";
import type { Client } from "discord.js";
import { config } from "../config/index.ts";
import { logger } from "../utils/logger.ts";

export const createDistube = (client: Client): DisTube => {
  const distube = new DisTube(client, {
    emitNewSongOnly: true,
    savePreviousSongs: true,
    nsfw: false,
    plugins: [
      // SoundCloud + Spotify first so their URLs route to the right resolver.
      new SoundCloudPlugin(),
      new SpotifyPlugin(),
      // yt-dlp catches everything else (YouTube + 1000+ sites + ytsearch:)
      // and is way more reliable than @distube/ytdl-core in 2026.
      new YtDlpPlugin({ update: false }),
    ],
  });

  distube.setMaxListeners(50);
  return distube;
};

export const setDefaultVolume = async (
  distube: DisTube,
  guildId: string,
): Promise<void> => {
  const queue = distube.getQueue(guildId);
  if (queue) await queue.setVolume(config.defaultVolume);
};

export const wireMusicLogging = (distube: DisTube): void => {
  distube.on(Events.ERROR, (err, queue) => {
    logger.error(`DisTube error in guild ${queue?.id ?? "?"}`, err);
  });
};
