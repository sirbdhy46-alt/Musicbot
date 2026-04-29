import type { Command } from "../types.ts";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { Colors } from "../../config/colors.ts";
import { e, EMOJI_NAMES, ANIMATED_DEFAULTS, setEmoji, type EmojiName } from "../../config/emojis.ts";
import { errorEmbed, successEmbed } from "../../embeds/builder.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACK_DIR = path.resolve(__dirname, "../../../emojis-pack");

// Guard: prevent parallel runs in the same guild (race conditions corrupt the store)
const inFlight = new Set<string>();

const cmd: Command = {
  name: "uploademojis",
  aliases: ["emojisetup"],
  description: "Admin: upload the Aether emoji pack to this server.",
  category: "admin",
  run: async ({ message }) => {
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
      return message.reply({ embeds: [errorEmbed("You need **Manage Expressions** to do that.")] });
    }
    if (!message.guild) return;
    if (inFlight.has(message.guild.id)) {
      return message.reply({
        embeds: [errorEmbed("An emoji upload is already running for this server. Wait for it to finish.")],
      });
    }
    inFlight.add(message.guild.id);

    const status = await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.info)
          .setTitle(`${e("sparkle")} Uploading emoji pack…`)
          .setDescription("This will take a moment. Sit tight."),
      ],
    });

    try {
      let files: string[] = [];
      try {
        files = await fs.readdir(PACK_DIR);
      } catch {
        return status.edit({ embeds: [errorEmbed(`Pack folder not found: \`${PACK_DIR}\``)] });
      }

      const uploaded: string[] = [];
      const skipped: string[] = [];
      const failed: string[] = [];

      // Refresh guild emojis so we can detect existing ones and avoid name collisions
      await message.guild.emojis.fetch().catch(() => undefined);

      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (ext !== ".png" && ext !== ".gif") continue;
        const name = path.basename(file, ext) as EmojiName;
        if (!EMOJI_NAMES.includes(name)) {
          skipped.push(file);
          continue;
        }

        const existing = message.guild.emojis.cache.find((em) => em.name === name);
        if (existing?.id) {
          setEmoji(name, existing.id, existing.animated ?? false);
          uploaded.push(`${name} *(existing)*`);
          continue;
        }

        try {
          const buf = await fs.readFile(path.join(PACK_DIR, file));
          const created = await message.guild.emojis.create({
            attachment: buf,
            name,
          });
          setEmoji(name, created.id, ANIMATED_DEFAULTS.has(name) || ext === ".gif");
          uploaded.push(name);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          failed.push(`${name}: ${msg.slice(0, 60)}`);
        }
      }

      const embed = new EmbedBuilder()
        .setColor(failed.length ? Colors.warn : Colors.success)
        .setTitle(`${e("crown")} Emoji Pack Upload Complete`)
        .addFields(
          {
            name: `${e("check")} Uploaded (${uploaded.length})`,
            value: uploaded.length ? uploaded.join(", ").slice(0, 1000) : "—",
          },
          {
            name: `${e("warning")} Skipped (${skipped.length})`,
            value: skipped.length ? skipped.join(", ").slice(0, 1000) : "—",
          },
          {
            name: `${e("cross")} Failed (${failed.length})`,
            value: failed.length ? failed.join("\n").slice(0, 1000) : "—",
          },
        )
        .setFooter({ text: "Restart the bot if any emoji refuses to render." });

      return status.edit({ embeds: [embed] });
    } finally {
      inFlight.delete(message.guild.id);
    }
  },
};

export default cmd;
