import { db } from "./db.ts";

export interface EconomyAccount {
  user_id: string;
  wallet: number;
  bank: number;
  bank_cap: number;
  last_daily: number;
  last_work: number;
  last_rob: number;
  streak: number;
}

const insertAccount = db.prepare(
  `INSERT OR IGNORE INTO economy (user_id) VALUES (?)`,
);
const selectAccount = db.prepare(
  `SELECT user_id, wallet, bank, bank_cap, last_daily, last_work, last_rob, streak
   FROM economy WHERE user_id = ?`,
);

export function getAccount(userId: string): EconomyAccount {
  insertAccount.run(userId);
  const row = selectAccount.get(userId) as unknown as EconomyAccount;
  return row;
}

const updateWallet = db.prepare(
  `UPDATE economy SET wallet = wallet + ? WHERE user_id = ?`,
);
const updateBank = db.prepare(
  `UPDATE economy SET bank = bank + ? WHERE user_id = ?`,
);
const setLastDaily = db.prepare(
  `UPDATE economy SET last_daily = ?, streak = ? WHERE user_id = ?`,
);
const setLastWork = db.prepare(
  `UPDATE economy SET last_work = ? WHERE user_id = ?`,
);
const setLastRob = db.prepare(
  `UPDATE economy SET last_rob = ? WHERE user_id = ?`,
);

export function addCoins(userId: string, amount: number): void {
  insertAccount.run(userId);
  updateWallet.run(amount, userId);
}
export function takeCoins(userId: string, amount: number): boolean {
  const acc = getAccount(userId);
  if (acc.wallet < amount) return false;
  updateWallet.run(-amount, userId);
  return true;
}
export function deposit(userId: string, amount: number): number {
  const acc = getAccount(userId);
  const room = acc.bank_cap - acc.bank;
  const moved = Math.max(0, Math.min(amount, room, acc.wallet));
  if (moved > 0) {
    updateWallet.run(-moved, userId);
    updateBank.run(moved, userId);
  }
  return moved;
}
export function withdraw(userId: string, amount: number): number {
  const acc = getAccount(userId);
  const moved = Math.max(0, Math.min(amount, acc.bank));
  if (moved > 0) {
    updateBank.run(-moved, userId);
    updateWallet.run(moved, userId);
  }
  return moved;
}

export function claimDaily(userId: string): { ok: true; amount: number; streak: number } | { ok: false; nextAt: number } {
  const acc = getAccount(userId);
  const now = Date.now();
  const ONE_DAY = 22 * 60 * 60 * 1000;
  const TWO_DAY = 48 * 60 * 60 * 1000;
  if (now - acc.last_daily < ONE_DAY) {
    return { ok: false, nextAt: acc.last_daily + ONE_DAY };
  }
  const newStreak = now - acc.last_daily < TWO_DAY ? acc.streak + 1 : 1;
  const base = 250;
  const bonus = Math.min(newStreak * 25, 500);
  const amount = base + bonus;
  setLastDaily.run(now, newStreak, userId);
  updateWallet.run(amount, userId);
  return { ok: true, amount, streak: newStreak };
}

const WORK_LINES = [
  "stacked plates at the void diner",
  "DJed an after-hours at Club Aether",
  "ran samples for a neon producer",
  "wrote ad copy for a synthwave label",
  "ghost-mixed a SoundCloud upload",
  "delivered records on a violet moped",
  "tuned the bass on someone's track",
];

export function work(userId: string): { ok: true; amount: number; line: string } | { ok: false; nextAt: number } {
  const acc = getAccount(userId);
  const now = Date.now();
  const COOL = 45 * 60 * 1000;
  if (now - acc.last_work < COOL) return { ok: false, nextAt: acc.last_work + COOL };
  const amount = 80 + Math.floor(Math.random() * 220);
  const line = WORK_LINES[Math.floor(Math.random() * WORK_LINES.length)] ?? "did the thing";
  setLastWork.run(now, userId);
  updateWallet.run(amount, userId);
  return { ok: true, amount, line };
}

export function tryRob(robberId: string, victimId: string): { ok: true; amount: number } | { ok: false; reason: string; nextAt?: number } {
  if (robberId === victimId) return { ok: false, reason: "you can't rob yourself" };
  const robber = getAccount(robberId);
  const victim = getAccount(victimId);
  const now = Date.now();
  const COOL = 60 * 60 * 1000;
  if (now - robber.last_rob < COOL) return { ok: false, reason: "cooldown", nextAt: robber.last_rob + COOL };
  if (victim.wallet < 100) return { ok: false, reason: "their wallet is too thin" };
  const success = Math.random() < 0.45;
  setLastRob.run(now, robberId);
  if (!success) {
    const fine = Math.min(robber.wallet, 150);
    if (fine > 0) updateWallet.run(-fine, robberId);
    return { ok: false, reason: `caught — lost ${fine}` };
  }
  const stolen = Math.floor(victim.wallet * (0.1 + Math.random() * 0.3));
  updateWallet.run(-stolen, victimId);
  updateWallet.run(stolen, robberId);
  return { ok: true, amount: stolen };
}

const topQuery = db.prepare(
  `SELECT user_id, wallet, bank, (wallet + bank) AS total
   FROM economy ORDER BY total DESC LIMIT ?`,
);

export function leaderboard(limit = 10): Array<{ user_id: string; wallet: number; bank: number; total: number }> {
  return topQuery.all(limit) as Array<{ user_id: string; wallet: number; bank: number; total: number }>;
}

const addItem = db.prepare(
  `INSERT INTO inventory (user_id, item_id, qty) VALUES (?, ?, ?)
   ON CONFLICT(user_id, item_id) DO UPDATE SET qty = qty + excluded.qty`,
);
const getItems = db.prepare(`SELECT item_id, qty FROM inventory WHERE user_id = ?`);

export function grantItem(userId: string, itemId: string, qty = 1): void {
  insertAccount.run(userId);
  addItem.run(userId, itemId, qty);
}
export function inventoryOf(userId: string): Array<{ item_id: string; qty: number }> {
  return getItems.all(userId) as Array<{ item_id: string; qty: number }>;
}
