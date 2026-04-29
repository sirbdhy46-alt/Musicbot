import type { Command } from "../types.ts";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  OAuth2Scopes,
  type Message,
} from "discord.js";
import { Colors } from "../../config/colors.ts";
import { e, eObj, type EmojiName } from "../../config/emojis.ts";
import { config } from "../../config/index.ts";
import { commands } from "../index.ts";
import { PERMS } from "../../events/ready.ts";

type CategoryMeta = {
  label: string;
  emojiName: EmojiName;
  blurb: string;
  tagline: string;
  color: number;
  accent: EmojiName;
};

const CATEGORY_META: Record<string, CategoryMeta> = {
  music: {
    label: "Music",
    emojiName: "music_note",
    blurb: "Drop tracks. Run the queue. Own the night.",
    tagline: "Core playback engine — push play, control the chaos.",
    color: Colors.primary,
    accent: "headset",
  },
  filter: {
    label: "Filters",
    emojiName: "sparkle",
    blurb: "Bend the sound. Bassboost. Nightcore. 8D. Slowed.",
    tagline: "Sonic alchemy — twist any track into a new dimension.",
    color: Colors.secondary,
    accent: "bass",
  },
  fun: {
    label: "Fun",
    emojiName: "fire",
    blurb: "Hype, reactions, chaos. Full personality drop.",
    tagline: "Loose & loud — the energy switch for any channel.",
    color: Colors.fire,
    accent: "fire",
  },
  info: {
    label: "Info",
    emojiName: "search",
    blurb: "Bot intel. Invite, ping, command lookups.",
    tagline: "All the metadata — shipped with style.",
    color: Colors.info,
    accent: "disc_glow",
  },
  admin: {
    label: "Admin",
    emojiName: "crown",
    blurb: "Owner tools. Mod-only territory.",
    tagline: "Behind the curtain — server-side controls.",
    color: Colors.gold,
    accent: "lock",
  },
};

const DIVIDER = "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰";

const buildHomeEmbed = (totalCommands: number): EmbedBuilder => {
  const p = config.prefix;
  const moduleLines = Object.entries(CATEGORY_META).map(
    ([_, m]) => `${e(m.emojiName)}  **${m.label.toUpperCase()}**  ·  ${m.blurb}`,
  );

  return new EmbedBuilder()
    .setColor(Colors.primary)
    .setAuthor({ name: "AETHER  //  COMMAND CENTER" })
    .setTitle(`${e("aether_logo")}  **A E T H E R**`)
    .setDescription(
      [
        `> ${e("fire")}  **Dark.  Loud.  In your veins.**`,
        `> ${e("disc_glow")}  Premium-grade music engine for your server.`,
        "",
        `\`\`\`${DIVIDER}\`\`\``,
        `${e("home")}  **Prefix**  ·  \`${p}\``,
        `${e("queue")}  **Commands**  ·  \`${totalCommands}\` loaded`,
        `${e("headset")}  **Sources**  ·  ${e("youtube")} \`YouTube\`  ${e("soundcloud")} \`SoundCloud\`  ${e("spotify")} \`Spotify\``,
        `\`\`\`${DIVIDER}\`\`\``,
      ].join("\n"),
    )
    .addFields(
      {
        name: `${e("sparkle")}  **MODULES**`,
        value: moduleLines.join("\n"),
      },
      {
        name: `${e("dj")}  **QUICK START**`,
        value: [
          `\`${p}play <song or url>\`  —  Drop a track instantly`,
          `\`${p}help <command>\`  —  Deep-dive any command`,
          `\`${p}nowplaying\`  —  See what's spinning`,
        ].join("\n"),
      },
    )
    .setFooter({ text: "AETHER  ·  dark, loud, in your veins" });
};

const buildCategoryEmbed = (cat: string): EmbedBuilder => {
  const p = config.prefix;
  const meta = CATEGORY_META[cat];
  const list = [...commands.values()]
    .filter((c) => c.category === cat && !c.ownerOnly)
    .sort((a, b) => a.name.localeCompare(b.name));

  const embed = new EmbedBuilder()
    .setColor(meta?.color ?? Colors.primary)
    .setAuthor({ name: `AETHER  //  ${meta?.label.toUpperCase() ?? cat.toUpperCase()} MODULE` })
    .setTitle(`${e(meta?.emojiName ?? "music_note")}  **${meta?.label.toUpperCase() ?? cat.toUpperCase()}**`)
    .setDescription(
      [
        `> ${e(meta?.accent ?? "fire")}  *${meta?.tagline ?? ""}*`,
        "",
        `\`\`\`${DIVIDER}\`\`\``,
        `${e("queue")}  **\`${list.length}\`** commands available`,
        `${e("search")}  Tip  ·  \`${p}help <command>\` for full usage`,
        `\`\`\`${DIVIDER}\`\`\``,
      ].join("\n"),
    )
    .setFooter({ text: "AETHER  ·  dark, loud, in your veins" });

  const chunkSize = 8;
  for (let i = 0; i < list.length; i += chunkSize) {
    const chunk = list.slice(i, i + chunkSize);
    embed.addFields({
      name: i === 0 ? `${e("disc_glow")}  **COMMANDS**` : "\u200b",
      value: chunk
        .map((c) => `\`${p}${c.name.padEnd(10, " ")}\`  ·  ${c.description}`)
        .join("\n"),
      inline: false,
    });
  }

  if (list.length === 0) {
    embed.addFields({
      name: `${e("warning")}  **EMPTY**`,
      value: "_No commands in this module yet._",
    });
  }

  return embed;
};

const attachEmoji = (btn: ButtonBuilder, name: EmojiName): ButtonBuilder => {
  const emo = eObj(name);
  if (emo) btn.setEmoji(emo);
  return btn;
};

const buildComponents = (
  inviteUrl: string,
  current: string,
): ActionRowBuilder<ButtonBuilder>[] => {
  // Row 1 — Module buttons (5 max). Active module = Primary, others = Secondary.
  const moduleRow = new ActionRowBuilder<ButtonBuilder>();
  for (const [key, m] of Object.entries(CATEGORY_META)) {
    const btn = new ButtonBuilder()
      .setCustomId(`aether_help_cat_${key}`)
      .setLabel(m.label.toUpperCase())
      .setStyle(current === key ? ButtonStyle.Primary : ButtonStyle.Secondary)
      .setDisabled(current === key);
    attachEmoji(btn, m.emojiName);
    moduleRow.addComponents(btn);
  }

  // Row 2 — Navigation (Home / Refresh / Invite / Close).
  const homeBtn = new ButtonBuilder()
    .setCustomId("aether_help_home")
    .setLabel("HOME")
    .setStyle(current === "home" ? ButtonStyle.Primary : ButtonStyle.Secondary)
    .setDisabled(current === "home");
  attachEmoji(homeBtn, "home");

  const refreshBtn = new ButtonBuilder()
    .setCustomId("aether_help_refresh")
    .setLabel("REFRESH")
    .setStyle(ButtonStyle.Secondary);
  attachEmoji(refreshBtn, "sparkle");

  const inviteBtn = new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setLabel("INVITE")
    .setURL(inviteUrl);
  attachEmoji(inviteBtn, "link_btn");

  const closeBtn = new ButtonBuilder()
    .setCustomId("aether_help_close")
    .setLabel("CLOSE")
    .setStyle(ButtonStyle.Danger);
  attachEmoji(closeBtn, "cross");

  const navRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    homeBtn,
    refreshBtn,
    inviteBtn,
    closeBtn,
  );

  return [moduleRow, navRow];
};

const cmd: Command = {
  name: "help",
  aliases: ["h", "commands", "cmds", "menu"],
  description: "Open the Aether command panel.",
  category: "info",
  usage: "+help [command]",
  run: async ({ message, args }) => {
    const p = config.prefix;

    if (args[0]) {
      const lookup = args[0].toLowerCase();
      const found =
        commands.get(lookup) ??
        [...commands.values()].find((c) => c.aliases?.includes(lookup));
      if (!found) {
        return message.reply(`${e("cross")}  No command called \`${lookup}\`.`);
      }
      const meta = CATEGORY_META[found.category];
      const embed = new EmbedBuilder()
        .setColor(meta?.color ?? Colors.info)
        .setAuthor({ name: `AETHER  //  COMMAND DETAIL` })
        .setTitle(`${e(meta?.emojiName ?? "music_note")}  \`${p}${found.name}\``)
        .setDescription(
          [
            `> ${e("fire")}  **${found.description}**`,
            "",
            `\`\`\`${DIVIDER}\`\`\``,
          ].join("\n"),
        )
        .addFields(
          {
            name: `${e("disc_glow")}  **USAGE**`,
            value: `\`${found.usage ?? p + found.name}\``,
            inline: true,
          },
          {
            name: `${e("sparkle")}  **ALIASES**`,
            value: found.aliases?.length
              ? found.aliases.map((a) => `\`${a}\``).join("  ")
              : "`none`",
            inline: true,
          },
          {
            name: `${e("crown")}  **MODULE**`,
            value: `**${meta?.label ?? found.category}**`,
            inline: true,
          },
        )
        .setFooter({ text: "AETHER  ·  dark, loud, in your veins" });
      return message.reply({ embeds: [embed] });
    }

    const inviteUrl = message.client.generateInvite({
      scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
      permissions: PERMS,
    });

    const sent: Message = await message.reply({
      embeds: [buildHomeEmbed(commands.size)],
      components: buildComponents(inviteUrl, "home"),
    });

    const buttonCollector = sent.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 5 * 60_000,
    });

    const guard = (i: { user: { id: string } }): boolean =>
      i.user.id === message.author.id;

    buttonCollector.on("collect", async (i) => {
      if (!guard(i)) {
        await i.reply({
          content: `${e("lock")}  This panel belongs to ${message.author.toString()}.`,
          ephemeral: true,
        });
        return;
      }

      // Category buttons
      if (i.customId.startsWith("aether_help_cat_")) {
        const cat = i.customId.replace("aether_help_cat_", "");
        await i.update({
          embeds: [buildCategoryEmbed(cat)],
          components: buildComponents(inviteUrl, cat),
        });
        return;
      }

      if (i.customId === "aether_help_home") {
        await i.update({
          embeds: [buildHomeEmbed(commands.size)],
          components: buildComponents(inviteUrl, "home"),
        });
        return;
      }

      if (i.customId === "aether_help_refresh") {
        // Re-render the current view fresh.
        await i.update({
          embeds: [buildHomeEmbed(commands.size)],
          components: buildComponents(inviteUrl, "home"),
        });
        return;
      }

      if (i.customId === "aether_help_close") {
        await i.update({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.outline)
              .setAuthor({ name: "AETHER  //  PANEL CLOSED" })
              .setDescription(
                `${e("check")}  **Panel closed.**  Run \`${p}help\` to reopen.`,
              )
              .setFooter({ text: "AETHER  ·  dark, loud, in your veins" }),
          ],
          components: [],
        });
        buttonCollector.stop();
      }
    });

    buttonCollector.on("end", async () => {
      await sent.edit({ components: [] }).catch(() => {});
    });

    return sent;
  },
};

export default cmd;
