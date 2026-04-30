import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { SHOP } from "../../services/shop.ts";
import { GAP, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "shop",
  aliases: ["store", "market"],
  description: "Browse the Aether shop. Drip with intent.",
  category: "economy",
  run: async ({ message }) => {
    const grouped: Record<string, typeof SHOP> = {};
    for (const item of SHOP) {
      (grouped[item.category] ??= []).push(item);
    }

    const sectionTitles: Record<string, string> = {
      boost: `${e("fire")}\u2003Boosts`,
      cosmetic: `${e("sparkle")}\u2003Cosmetics`,
      tool: `${e("crown")}\u2003Tools`,
      rare: `${e("crown")}\u2003Rare`,
    };

    const lines: string[] = [h1(`${e("crown")}\u2003Aether Shop`), GAP];
    for (const [cat, items] of Object.entries(grouped)) {
      lines.push(`## ${sectionTitles[cat] ?? cat}`);
      for (const it of items) {
        lines.push(
          `${it.emoji}\u2003**${it.name}**\u2003·\u2003\`${it.price.toLocaleString("en-US")}\``,
        );
        lines.push(`\u2003\u2003*${it.desc}*`);
      }
      lines.push("");
    }
    lines.push(`buy with \`+buy <item name>\``);

    const eb = baseEmbed().setColor(Colors.gold).setDescription(lines.join("\n"));
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
