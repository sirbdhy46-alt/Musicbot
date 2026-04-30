import { ChannelType, PermissionFlagsBits } from "discord.js";
import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import {
  setLogChannel,
  setWelcome,
  getSettings,
  setJoinAgeMin,
} from "../../services/settings.ts";
import { GAP, b, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "setup",
  aliases: ["config", "settings"],
  description: "Configure server-side modules: welcome, log channel, account-age guard.",
  category: "util",
  usage: "setup <welcome|log|joinage|view>",
  run: async ({ message, args }) => {
    if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
      await message.reply(`${e("lock")} admin only.`);
      return;
    }
    const sub = (args[0] ?? "view").toLowerCase();
    const guildId = message.guild!.id;

    if (sub === "welcome") {
      const ch = message.mentions.channels.first();
      if (!ch || ch.type !== ChannelType.GuildText) {
        await message.reply("usage — `+setup welcome #channel [message]`");
        return;
      }
      const tmpl = args.slice(2).join(" ").trim() || null;
      setWelcome(guildId, ch.id, tmpl);
      await message.reply(`${e("check")} welcome channel set to ${ch.toString()}.`);
      return;
    }
    if (sub === "log") {
      const ch = message.mentions.channels.first();
      if (!ch || ch.type !== ChannelType.GuildText) {
        await message.reply("usage — `+setup log #channel`");
        return;
      }
      setLogChannel(guildId, ch.id);
      await message.reply(`${e("check")} log channel set to ${ch.toString()}.`);
      return;
    }
    if (sub === "joinage") {
      const days = Math.max(0, Math.floor(Number(args[1] ?? 0)));
      setJoinAgeMin(guildId, days);
      await message.reply(`${e("check")} new accounts under \`${days}d\` will be auto-kicked when anti-raid is on.`);
      return;
    }

    const s = getSettings(guildId);
    const eb = baseEmbed()
      .setColor(Colors.info)
      .setDescription(
        [
          h1(`${e("crown")}\u2003Server Configuration`),
          GAP,
          `${b("Welcome")}\u2003${s.welcome_chan ? `<#${s.welcome_chan}>` : "_unset_"}`,
          `${b("Log")}\u2003${s.log_channel ? `<#${s.log_channel}>` : "_unset_"}`,
          `${b("Anti-Raid")}\u2003${s.antiraid ? "🟢" : "🔴"}\u2003·\u2003${b("Anti-Nuke")}\u2003${s.antinuke ? "🟢" : "🔴"}\u2003·\u2003${b("Auto-Mod")}\u2003${s.automod ? "🟢" : "🔴"}`,
          `${b("Min Join Age")}\u2003\`${s.join_age_min}d\``,
          GAP,
          `change with \`+setup welcome #ch\`, \`+setup log #ch\`, \`+setup joinage <days>\`.`,
        ].join("\n"),
      );
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
