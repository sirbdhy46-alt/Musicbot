import type { Command } from "../types.ts";
import {
  joinVoiceChannel,
  VoiceConnectionStatus,
  entersState,
  generateDependencyReport,
} from "@discordjs/voice";
import { errorEmbed, successEmbed } from "../../embeds/builder.ts";
import { logger } from "../../utils/logger.ts";

const cmd: Command = {
  name: "voicedebug",
  aliases: ["vdebug"],
  description: "Admin: low-level voice connection diagnostic.",
  category: "admin",
  ownerOnly: false,
  run: async ({ message }) => {
    const voice = message.member?.voice.channel;
    if (!voice || !message.guild) {
      return message.reply({ embeds: [errorEmbed("Join a voice channel first.")] });
    }

    logger.info("[vdebug] Dependency report:\n" + generateDependencyReport());
    logger.info(`[vdebug] Joining ${voice.id} in guild ${message.guild.id}…`);

    const conn = joinVoiceChannel({
      channelId: voice.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: false,
      debug: true,
    });

    for (const status of Object.values(VoiceConnectionStatus)) {
      conn.on(status, (oldS, newS) => {
        logger.info(`[vdebug] -> ${status} (from=${oldS?.status} to=${newS?.status})`);
      });
    }
    conn.on("error", (err) => logger.error("[vdebug] connection error", err));
    conn.on("debug", (msg) => logger.info(`[vdebug] debug: ${msg}`));
    conn.on("stateChange", (oldS, newS) => {
      logger.info(`[vdebug] stateChange ${oldS.status} -> ${newS.status}`);
    });

    try {
      await entersState(conn, VoiceConnectionStatus.Ready, 25_000);
      conn.destroy();
      return message.reply({
        embeds: [successEmbed("Voice handshake reached **Ready**. Voice works.")],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const finalState = conn.state.status;
      conn.destroy();
      return message.reply({
        embeds: [
          errorEmbed(
            [
              `**Voice failed.**`,
              `> Final state: \`${finalState}\``,
              `> Error: \`${msg.slice(0, 300)}\``,
            ].join("\n"),
          ),
        ],
      });
    }
  },
};

export default cmd;
