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

const SPACE = "\u2003"; // em space — wider, gives breathing room
const GAP = "\n\u200b\n"; // visible vertical gap between sections

const buildHomeEmbed = (totalCommands: number): EmbedBuilder => {
  const p = config.prefix;
  const moduleLines = Object.entries(CATEGORY_META).map(
    ([_, m]) => `${e(m.emojiName)}${SPACE}**${m.label}**${SPACE}·${SPACE}${m.blurb}`,
  );

  return new EmbedBuilder()
    .setColor(Colors.primary)
    .setAuthor({ name: "AETHER  //  COMMAND CENTER" })
    .setDescription(
      [
        `# ${e("aether_logo")}${SPACE}**Aether**`,
        `### ${e("fire")}${SPACE}**Dark${SPACE}·${SPACE}Loud${SPACE}·${SPACE}In Your Veins**`,
        "",
        `> ${e("disc_glow")}${SPACE}**Premium-grade music engine for your server.**`,
        GAP,
        `## ${e("home")}${SPACE}**The Basics**`,
        "",
        `${e("sparkle")}${SPACE}**Prefix**${SPACE}·${SPACE}\`${p}\``,
        `${e("queue")}${SPACE}**Commands**${SPACE}·${SPACE}\`${totalCommands}\`${SPACE}loaded`,
        `${e("headset")}${SPACE}**Sources**${SPACE}·${SPACE}${e("youtube")} \`YouTube\`${SPACE}${e("soundcloud")} \`SoundCloud\`${SPACE}${e("spotify")} \`Spotify\``,
        GAP,
        `## ${e("sparkle")}${SPACE}**Modules**`,
        "",
        moduleLines.join("\n"),
        GAP,
        `## ${e("dj")}${SPACE}**Quick Start**`,
        "",
        `\`${p}play <song or url>\`${SPACE}—${SPACE}**Drop a track instantly**`,
        `\`${p}help <command>\`${SPACE}—${SPACE}**Deep-dive any command**`,
        `\`${p}nowplaying\`${SPACE}—${SPACE}**See what's spinning**`,
        "",
        `-# AETHER${SPACE}·${SPACE}dark, loud, in your veins`,
      ].join("\n"),
    );
};

const buildCategoryEmbed = (cat: string): EmbedBuilder => {
  const p = config.prefix;
  const meta = CATEGORY_META[cat];
  const list = [...commands.values()]
    .filter((c) => c.category === cat && !c.ownerOnly)
    .sort((a, b) => a.name.localeCompare(b.name));

  const header = [
    `# ${e(meta?.emojiName ?? "music_note")}${SPACE}**${meta?.label ?? cat}**`,
    `### ${e(meta?.accent ?? "fire")}${SPACE}**${meta?.tagline ?? ""}**`,
    "",
    `> ${e("queue")}${SPACE}**\`${list.length}\`** commands available`,
    `> ${e("search")}${SPACE}Tip${SPACE}·${SPACE}\`${p}help <command>\` for full usage`,
    GAP,
    `## ${e("disc_glow")}${SPACE}**Commands**`,
    "",
  ].join("\n");

  const body = list.length
    ? list
        .map(
          (c) =>
            `${e(meta?.emojiName ?? "music_note")}${SPACE}\`${p}${c.name}\`${SPACE}—${SPACE}**${c.description}**`,
        )
        .join("\n")
    : `${e("warning")}${SPACE}*No commands in this module yet.*`;

  return new EmbedBuilder()
    .setColor(meta?.color ?? Colors.primary)
    .setAuthor({ name: `AETHER  //  ${meta?.label.toUpperCase() ?? cat.toUpperCase()} MODULE` })
    .setDescription(`${header}${body}\n\n-# AETHER${SPACE}·${SPACE}dark, loud, in your veins`);
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
      const aliases = found.aliases?.length
        ? found.aliases.map((a) => `\`${a}\``).join(`${SPACE}`)
        : "`none`";
      const embed = new EmbedBuilder()
        .setColor(meta?.color ?? Colors.info)
        .setAuthor({ name: `AETHER  //  COMMAND DETAIL` })
        .setDescription(
          [
            `# ${e(meta?.emojiName ?? "music_note")}${SPACE}**${found.name}**`,
            `### ${e("fire")}${SPACE}**${found.description}**`,
            GAP,
            `## ${e("disc_glow")}${SPACE}**Usage**`,
            "",
            `\`${found.usage ?? p + found.name}\``,
            GAP,
            `## ${e("sparkle")}${SPACE}**Aliases**`,
            "",
            aliases,
            GAP,
            `## ${e("crown")}${SPACE}**Module**`,
            "",
            `**${meta?.label ?? found.category}**`,
            "",
            `-# Aether${SPACE}·${SPACE}dark, loud, in your veins`,
          ].join("\n"),
        );
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
