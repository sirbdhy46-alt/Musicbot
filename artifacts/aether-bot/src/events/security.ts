import {
  AuditLogEvent,
  type AuditLogChange,
  type Client,
  type GuildAuditLogsEntry,
  type GuildMember,
} from "discord.js";
import { logger } from "../utils/logger.ts";
import { getSettings, isWhitelisted } from "../services/settings.ts";
import { db } from "../services/db.ts";

// ------ Anti-Raid ------
const recentJoins = new Map<string, number[]>();

function recordJoin(guildId: string, window: number, count: number): boolean {
  const now = Date.now();
  const arr = recentJoins.get(guildId) ?? [];
  const fresh = arr.filter((t) => now - t < window * 1000);
  fresh.push(now);
  recentJoins.set(guildId, fresh);
  return fresh.length >= count;
}

async function handleJoin(member: GuildMember): Promise<void> {
  const s = getSettings(member.guild.id);
  if (!s.antiraid) return;

  // Account-age guard
  if (s.join_age_min > 0) {
    const ageDays = (Date.now() - member.user.createdTimestamp) / 86_400_000;
    if (ageDays < s.join_age_min && member.kickable) {
      await member.kick(`anti-raid: account younger than ${s.join_age_min}d`).catch(() => null);
      logger.warn(`anti-raid kicked young account ${member.user.tag} in ${member.guild.id}`);
      return;
    }
  }

  // Burst guard
  if (recordJoin(member.guild.id, s.raid_join_window, s.raid_join_count)) {
    if (member.kickable) {
      await member.kick("anti-raid: join-flood").catch(() => null);
      logger.warn(`anti-raid kicked ${member.user.tag} (join-flood) in ${member.guild.id}`);
    }
  }
}

// ------ Anti-Nuke ------
async function maybePunish(
  guildId: string,
  executorId: string | null,
  reason: string,
): Promise<void> {
  if (!executorId) return;
  const s = getSettings(guildId);
  if (!s.antinuke) return;
  if (isWhitelisted(guildId, executorId)) return;
  const guild = (globalThis as { __ae_client?: Client }).__ae_client?.guilds.cache.get(guildId);
  if (!guild) return;
  if (executorId === guild.ownerId) return;

  const member = await guild.members.fetch(executorId).catch(() => null);
  if (!member) return;

  // Strip dangerous perms by removing all manageable roles, then ban.
  try {
    if (member.bannable) {
      await member.ban({ reason: `anti-nuke: ${reason}`, deleteMessageSeconds: 0 });
      logger.warn(`anti-nuke banned ${member.user.tag} in ${guildId}: ${reason}`);
    } else {
      await member.roles.set([], `anti-nuke: ${reason}`);
      logger.warn(`anti-nuke stripped roles from ${member.user.tag} in ${guildId}: ${reason}`);
    }
  } catch (err) {
    logger.warn(`anti-nuke action failed: ${err}`);
  }
}

// ------ Auto-Mod ------
const INVITE_RE = /(discord\.gg\/|discord(?:app)?\.com\/invite\/)\S+/i;
const ZALGO_RE = /[\u0300-\u036f]{4,}/;

async function handleAutomod(client: Client): Promise<void> {
  client.on("messageCreate", async (msg) => {
    try {
      if (!msg.guild || msg.author.bot) return;
      const s = getSettings(msg.guild.id);
      if (!s.automod) return;
      if (msg.member?.permissions.has("ManageMessages")) return;

      const content = msg.content;
      let bad: string | null = null;
      if (INVITE_RE.test(content)) bad = "invite link";
      else if (msg.mentions.users.size + msg.mentions.roles.size >= 5) bad = "mass mention";
      else if (content.length > 12 && content.replace(/[^A-Z]/g, "").length / content.length > 0.7) bad = "caps spam";
      else if (ZALGO_RE.test(content)) bad = "zalgo text";
      if (!bad) return;

      await msg.delete().catch(() => null);
      const warn = await msg.channel.send({
        content: `<@${msg.author.id}> ${`\u2003`}\`automod\`${`\u2003`}**${bad}** isn't allowed here.`,
      });
      setTimeout(() => warn.delete().catch(() => null), 5000);
    } catch (err) {
      logger.warn(`automod error: ${err}`);
    }
  });
}

// ------ Snipe (delete cache) ------
const upsertSnipe = db.prepare(`
  INSERT INTO snipes (guild_id, channel_id, author_id, content, deleted_at)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(channel_id) DO UPDATE SET
    author_id = excluded.author_id,
    content = excluded.content,
    deleted_at = excluded.deleted_at,
    guild_id = excluded.guild_id
`);

export function registerSecurity(client: Client): void {
  (globalThis as { __ae_client?: Client }).__ae_client = client;

  client.on("guildMemberAdd", (member) => {
    void handleJoin(member);
  });

  client.on("messageDelete", (msg) => {
    if (!msg.guild || msg.author?.bot) return;
    if (!msg.content) return;
    upsertSnipe.run(msg.guild.id, msg.channelId, msg.author?.id ?? "?", msg.content, Date.now());
  });

  void handleAutomod(client);

  // Anti-nuke triggers via audit log entries
  client.on("guildAuditLogEntryCreate", (entry: GuildAuditLogsEntry, guild) => {
    const action = entry.action;
    const exec = entry.executorId;
    let reason: string | null = null;
    if (action === AuditLogEvent.ChannelDelete) reason = "channel delete";
    else if (action === AuditLogEvent.RoleDelete) reason = "role delete";
    else if (action === AuditLogEvent.MemberBanAdd) reason = "ban (audit)";
    else if (action === AuditLogEvent.WebhookCreate) reason = "webhook create";
    else if (action === AuditLogEvent.GuildUpdate) {
      const changes = (entry.changes ?? []) as AuditLogChange[];
      if (changes.some((c) => String(c.key) === "name" || String(c.key) === "icon")) reason = "guild edit";
    }
    if (reason) void maybePunish(guild.id, exec, reason);
  });
}
