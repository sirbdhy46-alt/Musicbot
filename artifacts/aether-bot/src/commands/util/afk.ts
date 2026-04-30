import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { db } from "../../services/db.ts";
import { GAP, b, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const setAfk = db.prepare(
  `INSERT INTO afk (user_id, reason, since) VALUES (?, ?, ?)
   ON CONFLICT(user_id) DO UPDATE SET reason = excluded.reason, since = excluded.since`,
);

const cmd: Command = {
  name: "afk",
  description: "Mark yourself as away. Aether will reply when others ping you.",
  category: "util",
  usage: "afk [reason]",
  run: async ({ message, args }) => {
    const reason = args.join(" ").trim() || "afk";
    setAfk.run(message.author.id, reason, Date.now());
    const eb = baseEmbed()
      .setColor(Colors.info)
      .setDescription(
        [
          h1(`${e("warning")}\u2003You're AFK`),
          GAP,
          `${b("Reason")}\u2003${reason}`,
          `we'll let people know.`,
        ].join("\n"),
      );
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
