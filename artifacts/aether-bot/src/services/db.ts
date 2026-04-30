import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { logger } from "../utils/logger.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, "aether.db");

export const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
  CREATE TABLE IF NOT EXISTS economy (
    user_id    TEXT PRIMARY KEY,
    wallet     INTEGER NOT NULL DEFAULT 0,
    bank       INTEGER NOT NULL DEFAULT 0,
    bank_cap   INTEGER NOT NULL DEFAULT 5000,
    last_daily INTEGER NOT NULL DEFAULT 0,
    last_work  INTEGER NOT NULL DEFAULT 0,
    last_rob   INTEGER NOT NULL DEFAULT 0,
    streak     INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS inventory (
    user_id  TEXT NOT NULL,
    item_id  TEXT NOT NULL,
    qty      INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, item_id)
  );

  CREATE TABLE IF NOT EXISTS levels (
    guild_id TEXT NOT NULL,
    user_id  TEXT NOT NULL,
    xp       INTEGER NOT NULL DEFAULT 0,
    level    INTEGER NOT NULL DEFAULT 0,
    last_msg INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS warns (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id  TEXT NOT NULL,
    user_id   TEXT NOT NULL,
    mod_id    TEXT NOT NULL,
    reason    TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS warns_user_idx ON warns (guild_id, user_id);

  CREATE TABLE IF NOT EXISTS afk (
    user_id   TEXT PRIMARY KEY,
    reason    TEXT NOT NULL,
    since     INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id     TEXT PRIMARY KEY,
    antiraid     INTEGER NOT NULL DEFAULT 0,
    antinuke     INTEGER NOT NULL DEFAULT 0,
    automod      INTEGER NOT NULL DEFAULT 0,
    log_channel  TEXT,
    welcome_chan TEXT,
    welcome_msg  TEXT,
    join_age_min INTEGER NOT NULL DEFAULT 0,
    raid_join_window INTEGER NOT NULL DEFAULT 10,
    raid_join_count  INTEGER NOT NULL DEFAULT 6
  );

  CREATE TABLE IF NOT EXISTS antinuke_whitelist (
    guild_id TEXT NOT NULL,
    user_id  TEXT NOT NULL,
    PRIMARY KEY (guild_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS snipes (
    guild_id   TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    author_id  TEXT NOT NULL,
    content    TEXT NOT NULL,
    deleted_at INTEGER NOT NULL,
    PRIMARY KEY (channel_id)
  );
`);

logger.ready(`SQLite ready @ ${DB_PATH}`);
