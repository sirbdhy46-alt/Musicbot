import type { Client } from "discord.js";
import { db } from "../services/db.ts";
import { e } from "../config/emojis.ts";

const get = db.prepare(`SELECT user_id, reason, since FROM afk WHERE user_id = ?`);
const del = db.prepare(`DELETE FROM afk WHERE user_id = ?`);

export function registerAfk(client: Client): void {
  client.on("messageCreate", async (msg) => {
    if (!msg.guild || msg.author.bot) return;

    // Returning user — clear their AFK
    const own = get.get(msg.author.id) as { user_id: string; reason: string; since: number } | undefined;
    if (own) {
      del.run(msg.author.id);
      const back = await msg.reply(`${e("check")} welcome back. cleared your AFK.`);
      setTimeout(() => back.delete().catch(() => null), 4500);
    }

    // Mentioned someone who's AFK
    for (const user of msg.mentions.users.values()) {
      const row = get.get(user.id) as { user_id: string; reason: string; since: number } | undefined;
      if (!row) continue;
      await msg.reply({
        content: `${e("warning")}\u2003**${user.username}** is AFK\u2003·\u2003*${row.reason}*\u2003·\u2003<t:${Math.floor(row.since / 1000)}:R>`,
        allowedMentions: { repliedUser: false },
      });
      break; // only one notice per message
    }
  });
}
