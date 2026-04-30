import { PermissionFlagsBits } from "discord.js";
import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { getSettings, setAntiraid } from "../../services/settings.ts";
import { GAP, b, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "antiraid",
  description: "Toggle anti-raid protection (kicks suspicious join floods).",
  category: "security",
  usage: "antiraid <on|off|status>",
  run: async ({ message, args }) => {
    if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
      await message.reply(`${e("lock")} admin only.`);
      return;
    }
    const sub = (args[0] ?? "status").toLowerCase();
    const cur = getSettings(message.guild!.id);
    if (sub === "on") setAntiraid(message.guild!.id, true);
    else if (sub === "off") setAntiraid(message.guild!.id, false);
    const s = getSettings(message.guild!.id);
    const eb = baseEmbed()
      .setColor(s.antiraid ? Colors.success : Colors.danger)
      .setDescription(
        [
          h1(`${e("lock")}\u2003Anti-Raid`),
          GAP,
          `${b("State")}\u2003${s.antiraid ? "🟢 active" : "🔴 inactive"}`,
          `${b("Join window")}\u2003\`${s.raid_join_window}s\`\u2003·\u2003${b("Threshold")}\u2003\`${s.raid_join_count}\` joins`,
          `${b("Min account age")}\u2003\`${s.join_age_min}\` days`,
          GAP,
          `_was ${cur.antiraid ? "on" : "off"}, now ${s.antiraid ? "on" : "off"}._`,
        ].join("\n"),
      );
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
