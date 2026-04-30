import { db } from "./db.ts";

export interface GuildSettings {
  guild_id: string;
  antiraid: number;
  antinuke: number;
  automod: number;
  log_channel: string | null;
  welcome_chan: string | null;
  welcome_msg: string | null;
  join_age_min: number;
  raid_join_window: number;
  raid_join_count: number;
}

const insertGS = db.prepare(`INSERT OR IGNORE INTO guild_settings (guild_id) VALUES (?)`);
const selectGS = db.prepare(`SELECT * FROM guild_settings WHERE guild_id = ?`);
const updAntiraid = db.prepare(`UPDATE guild_settings SET antiraid = ? WHERE guild_id = ?`);
const updAntinuke = db.prepare(`UPDATE guild_settings SET antinuke = ? WHERE guild_id = ?`);
const updAutomod = db.prepare(`UPDATE guild_settings SET automod = ? WHERE guild_id = ?`);
const updLogChan = db.prepare(`UPDATE guild_settings SET log_channel = ? WHERE guild_id = ?`);
const updWelChan = db.prepare(`UPDATE guild_settings SET welcome_chan = ?, welcome_msg = ? WHERE guild_id = ?`);
const updJoinAge = db.prepare(`UPDATE guild_settings SET join_age_min = ? WHERE guild_id = ?`);

export function getSettings(guildId: string): GuildSettings {
  insertGS.run(guildId);
  return selectGS.get(guildId) as unknown as GuildSettings;
}
export function setAntiraid(guildId: string, on: boolean): void {
  insertGS.run(guildId);
  updAntiraid.run(on ? 1 : 0, guildId);
}
export function setAntinuke(guildId: string, on: boolean): void {
  insertGS.run(guildId);
  updAntinuke.run(on ? 1 : 0, guildId);
}
export function setAutomod(guildId: string, on: boolean): void {
  insertGS.run(guildId);
  updAutomod.run(on ? 1 : 0, guildId);
}
export function setLogChannel(guildId: string, channelId: string | null): void {
  insertGS.run(guildId);
  updLogChan.run(channelId, guildId);
}
export function setWelcome(guildId: string, channelId: string | null, message: string | null): void {
  insertGS.run(guildId);
  updWelChan.run(channelId, message, guildId);
}
export function setJoinAgeMin(guildId: string, days: number): void {
  insertGS.run(guildId);
  updJoinAge.run(Math.max(0, Math.floor(days)), guildId);
}

const insertWL = db.prepare(`INSERT OR IGNORE INTO antinuke_whitelist (guild_id, user_id) VALUES (?, ?)`);
const removeWL = db.prepare(`DELETE FROM antinuke_whitelist WHERE guild_id = ? AND user_id = ?`);
const listWL = db.prepare(`SELECT user_id FROM antinuke_whitelist WHERE guild_id = ?`);
const checkWL = db.prepare(`SELECT 1 FROM antinuke_whitelist WHERE guild_id = ? AND user_id = ?`);

export function whitelistAdd(guildId: string, userId: string): void { insertWL.run(guildId, userId); }
export function whitelistRemove(guildId: string, userId: string): void { removeWL.run(guildId, userId); }
export function whitelistList(guildId: string): string[] {
  return (listWL.all(guildId) as Array<{ user_id: string }>).map((r) => r.user_id);
}
export function isWhitelisted(guildId: string, userId: string): boolean {
  return !!checkWL.get(guildId, userId);
}
