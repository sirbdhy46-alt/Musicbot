import { PermissionFlagsBits } from "discord.js";
import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { getSettings, setAutomod } from "../../services/settings.ts";
import { GAP, b, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "automod",
  description: "Toggle Aether's built-in automod (invites, mass-mention, caps spam).",
  category: "security",
  usage: "automod <on|off|status>",
  run: async ({ message, args }) => {
    if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
      await message.reply(`${e("lock")} admin only.`);
      return;
    }
    const sub = (args[0] ?? "status").toLowerCase();
    if (sub === "on") setAutomod(message.guild!.id, true);
    else if (sub === "off") setAutomod(message.guild!.id, false);
    const s = getSettings(message.guild!.id);
    const eb = baseEmbed()
      .setColor(s.automod ? Colors.success : Colors.danger)
      .setDescription(
        [
          h1(`${e("warning")}\u2003Auto-Mod`),
          GAP,
          `${b("State")}\u2003${s.automod ? "🟢 active" : "🔴 inactive"}`,
          `${b("Filters")}\u2003invite links · 5+ mentions · ALL CAPS · zalgo`,
        ].join("\n"),
      );
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
