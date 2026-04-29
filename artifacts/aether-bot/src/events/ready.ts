import { ActivityType, Client, OAuth2Scopes, PermissionFlagsBits } from "discord.js";
import { logger } from "../utils/logger.ts";
import { config } from "../config/index.ts";

export const PERMS =
  PermissionFlagsBits.ViewChannel |
  PermissionFlagsBits.SendMessages |
  PermissionFlagsBits.EmbedLinks |
  PermissionFlagsBits.AttachFiles |
  PermissionFlagsBits.ReadMessageHistory |
  PermissionFlagsBits.UseExternalEmojis |
  PermissionFlagsBits.AddReactions |
  PermissionFlagsBits.Connect |
  PermissionFlagsBits.Speak |
  PermissionFlagsBits.UseVAD |
  PermissionFlagsBits.ManageGuildExpressions;

export const handleReady = (client: Client): void => {
  if (!client.user) return;
  logger.ready(`Logged in as ${client.user.tag}`);
  logger.ready(`Serving ${client.guilds.cache.size} guild(s)`);
  const invite = client.generateInvite({
    scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
    permissions: PERMS,
  });
  logger.ready(`Invite URL: ${invite}`);

  const presences = [
    `${config.prefix}help • dark loud music`,
    `${config.prefix}play • drop a track`,
    "vibes loaded for the night",
  ];
  let i = 0;
  const cycle = (): void => {
    client.user?.setPresence({
      activities: [{ name: presences[i % presences.length]!, type: ActivityType.Listening }],
      status: "online",
    });
    i++;
  };
  cycle();
  setInterval(cycle, 60_000);
};
