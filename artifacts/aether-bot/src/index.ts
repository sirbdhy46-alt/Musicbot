import path from "node:path";
import { fileURLToPath } from "node:url";

// Configure yt-dlp to use our pre-installed standalone binary (avoids slow first-run download)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const YTDLP_BIN_DIR = path.resolve(__dirname, "..", "bin");
process.env.YTDLP_DIR = YTDLP_BIN_DIR;
process.env.YTDLP_FILENAME = "yt-dlp";
process.env.YTDLP_DISABLE_DOWNLOAD = "1";

import { Client, GatewayIntentBits, Partials } from "discord.js";
import { config } from "./config/index.ts";
import { createDistube } from "./music/distube.ts";
import { loadCommands } from "./commands/index.ts";
import { handleReady } from "./events/ready.ts";
import { handleMessage } from "./events/messageCreate.ts";
import { wireDistubeEvents } from "./events/distubeEvents.ts";
import { logger } from "./utils/logger.ts";

const main = async (): Promise<void> => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Channel, Partials.Message],
  });

  const distube = createDistube(client);
  wireDistubeEvents(distube);

  await loadCommands();

  client.once("clientReady", () => handleReady(client));
  client.on("messageCreate", (msg) => {
    void handleMessage(msg, distube);
  });

  client.on("error", (err) => logger.error("Client error", err));
  client.on("warn", (msg) => logger.warn(msg));
  process.on("unhandledRejection", (err) => logger.error("Unhandled rejection", err));
  process.on("uncaughtException", (err) => logger.error("Uncaught exception", err));

  await client.login(config.token);
};

main().catch((err) => {
  logger.error("Fatal startup error", err);
  process.exit(1);
});
