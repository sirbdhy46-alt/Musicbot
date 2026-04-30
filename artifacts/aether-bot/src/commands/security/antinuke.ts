import { PermissionFlagsBits } from "discord.js";
import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import {
  getSettings,
  isWhitelisted,
  setAntinuke,
  whitelistAdd,
  whitelistList,
  whitelistRemove,
} from "../../services/settings.ts";
import { GAP, b, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "antinuke",
  description: "Configure anti-nuke (channel/role wipe protection).",
  category: "security",
  usage: "antinuke <on|off|status|whitelist add @user|whitelist remove @user|whitelist list>",
  run: async ({ message, args }) => {
    if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
      await message.reply(`${e("lock")} admin only.`);
      return;
    }
    const sub = (args[0] ?? "status").toLowerCase();
    const guildId = message.guild!.id;

    if (sub === "on") setAntinuke(guildId, true);
    else if (sub === "off") setAntinuke(guildId, false);
    else if (sub === "whitelist" || sub === "wl") {
      const action = (args[1] ?? "list").toLowerCase();
      if (action === "add") {
        const u = message.mentions.users.first();
        if (!u) { await message.reply("usage — `+antinuke whitelist add @user`"); return; }
        whitelistAdd(guildId, u.id);
        await message.reply(`${e("check")} added **${u.tag}** to whitelist.`);
        return;
      }
      if (action === "remove" || action === "rm") {
        const u = message.mentions.users.first();
        if (!u) { await message.reply("usage — `+antinuke whitelist remove @user`"); return; }
        whitelistRemove(guildId, u.id);
        await message.reply(`${e("check")} removed **${u.tag}** from whitelist.`);
        return;
      }
      const ids = whitelistList(guildId);
      const lines = ids.length
        ? ids.map((id) => `\u2003·\u2003<@${id}>${isWhitelisted(guildId, id) ? "" : ""}`).join("\n")
        : "_(empty)_";
      const eb = baseEmbed()
        .setColor(Colors.info)
        .setDescription([h1(`${e("crown")}\u2003Anti-Nuke Whitelist`), GAP, lines].join("\n"));
      await message.reply({ embeds: [eb] });
      return;
    }

    const s = getSettings(guildId);
    const eb = baseEmbed()
      .setColor(s.antinuke ? Colors.success : Colors.danger)
      .setDescription(
        [
          h1(`${e("lock")}\u2003Anti-Nuke`),
          GAP,
          `${b("State")}\u2003${s.antinuke ? "🟢 active" : "🔴 inactive"}`,
          `${b("Watching")}\u2003channel deletes, role deletes, ban floods, webhook spam`,
          GAP,
          `whitelist with \`+antinuke whitelist add @user\``,
        ].join("\n"),
      );
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
