import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { inventoryOf } from "../../services/economy.ts";
import { SHOP } from "../../services/shop.ts";
import { GAP, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "inventory",
  aliases: ["inv", "items", "bag"],
  description: "See what you've collected from the shop.",
  category: "economy",
  run: async ({ message }) => {
    const items = inventoryOf(message.author.id);
    if (!items.length) {
      await message.reply(`${e("warning")} your bag is empty. browse with \`+shop\`.`);
      return;
    }
    const lines = items
      .map((i) => {
        const item = SHOP.find((s) => s.id === i.item_id);
        if (!item) return null;
        return `${item.emoji}\u2003**${item.name}**\u2003·\u2003\`x${i.qty}\``;
      })
      .filter(Boolean) as string[];

    const eb = baseEmbed()
      .setColor(Colors.info)
      .setDescription([h1(`${e("crown")}\u2003Inventory`), GAP, ...lines].join("\n"));
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
