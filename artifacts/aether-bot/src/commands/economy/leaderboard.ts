import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { leaderboard } from "../../services/economy.ts";
import { GAP, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const MEDAL = ["🥇", "🥈", "🥉"];

const cmd: Command = {
  name: "leaderboard",
  aliases: ["lb", "top", "rich"],
  description: "Top earners in the Aether economy.",
  category: "economy",
  run: async ({ message }) => {
    const top = leaderboard(10);
    if (!top.length) {
      await message.reply("nobody has stacked anything yet.");
      return;
    }

    const lines = await Promise.all(
      top.map(async (row, i) => {
        const u = await message.client.users.fetch(row.user_id).catch(() => null);
        const tag = u?.username ?? "unknown";
        const badge = MEDAL[i] ?? `\`#${String(i + 1).padStart(2, "0")}\``;
        return `${badge}\u2003**${tag}**\u2003·\u2003\`${row.total.toLocaleString("en-US")}\``;
      }),
    );

    const eb = baseEmbed()
      .setColor(Colors.gold)
      .setDescription(
        [
          h1(`${e("crown")}\u2003Coffer Leaderboard`),
          GAP,
          ...lines,
        ].join("\n"),
      );
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
