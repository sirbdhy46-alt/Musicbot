import { ChannelType, type Message } from "discord.js";
import type { DisTube } from "distube";
import { config } from "../config/index.ts";
import { resolveCommand } from "../commands/index.ts";
import { errorEmbed, warnEmbed } from "../embeds/builder.ts";
import { logger } from "../utils/logger.ts";

export const handleMessage = async (
  message: Message,
  distube: DisTube,
): Promise<void> => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;
  if (message.channel.type === ChannelType.DM) return;
  if (!message.guild || !message.member) return;

  const stripped = message.content.slice(config.prefix.length).trim();
  if (!stripped) return;

  const tokens = stripped.split(/\s+/);
  const cmdName = tokens[0]!.toLowerCase();
  const args = tokens.slice(1);
  const raw = stripped.slice(cmdName.length).trim();

  const cmd = resolveCommand(cmdName);
  if (!cmd) return;

  if (cmd.voiceOnly && !message.member.voice.channel) {
    await message.reply({ embeds: [errorEmbed("Hop in a voice channel first.")] });
    return;
  }

  if (cmd.queueOnly && !distube.getQueue(message.guildId!)) {
    await message.reply({ embeds: [errorEmbed("Nothing playing right now.")] });
    return;
  }

  if (cmd.ownerOnly && message.author.id !== config.ownerId) {
    await message.reply({ embeds: [warnEmbed("Owner-only command.")] });
    return;
  }

  try {
    await cmd.run({
      message: message as Message<true>,
      args,
      raw,
      distube,
    });
  } catch (err) {
    logger.error(`Command "${cmd.name}" crashed`, err);
    await message
      .reply({ embeds: [errorEmbed("Something exploded running that. It's been logged.")] })
      .catch(() => {});
  }
};
