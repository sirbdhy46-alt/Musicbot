import type { Command } from "../types.ts";
import { EmbedBuilder } from "discord.js";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { config } from "../../config/index.ts";

const cmd: Command = {
  name: "about",
  aliases: ["info", "bot"],
  description: "About Aether.",
  category: "info",
  run: async ({ message }) => {
    const c = message.client;
    const guilds = c.guilds.cache.size;
    const users = c.guilds.cache.reduce((a, g) => a + (g.memberCount ?? 0), 0);
    const uptimeMs = c.uptime ?? 0;
    const h = Math.floor(uptimeMs / 3_600_000);
    const m = Math.floor((uptimeMs % 3_600_000) / 60_000);

    const embed = new EmbedBuilder()
      .setColor(Colors.primary)
      .setAuthor({ name: c.user?.username ?? "Aether", iconURL: c.user?.displayAvatarURL() })
      .setTitle(`${e("aether_logo")} Aether`)
      .setDescription(
        [
          "Dark, loud, premium-grade music for your server.",
          `${e("youtube")} YouTube  ${e("soundcloud")} SoundCloud  ${e("spotify")} Spotify  ${e("applemusic")} Apple Music ${e("crown")} *(premium)*`,
          "",
          "Built different. Built for vibes.",
        ].join("\n"),
      )
      .addFields(
        { name: "Servers", value: `\`${guilds}\``, inline: true },
        { name: "Users", value: `\`${users.toLocaleString()}\``, inline: true },
        { name: "Uptime", value: `\`${h}h ${m}m\``, inline: true },
        { name: "Prefix", value: `\`${config.prefix}\``, inline: true },
        { name: "Library", value: "`discord.js + DisTube`", inline: true },
        { name: "Node", value: `\`${process.version}\``, inline: true },
      )
      .setFooter({ text: "Aether • dark, loud, in your veins" });

    return message.reply({ embeds: [embed] });
  },
};

export default cmd;
