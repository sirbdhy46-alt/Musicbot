export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  desc: string;
  category: "boost" | "cosmetic" | "tool" | "rare";
}

export const SHOP: ShopItem[] = [
  { id: "neon_pass",      name: "Neon Pass",        emoji: "🪩", price: 1500,  desc: "skip line at Club Aether — +1 daily streak slot", category: "boost"   },
  { id: "void_potion",    name: "Void Potion",      emoji: "🧪", price: 750,   desc: "doubles your next work payout",                  category: "boost"   },
  { id: "static_charm",   name: "Static Charm",     emoji: "⚡", price: 600,   desc: "60% rob-protection for 24h",                     category: "tool"    },
  { id: "violet_visor",   name: "Violet Visor",     emoji: "🕶️", price: 1200, desc: "cosmetic — appears next to your name in /profile", category: "cosmetic" },
  { id: "bass_pendant",   name: "Bass Pendant",     emoji: "💎", price: 2200,  desc: "boosts xp gain by +25% for 12h",                  category: "boost"   },
  { id: "midnight_card",  name: "Midnight Card",    emoji: "🎴", price: 3000,  desc: "raises bank cap by +5,000",                       category: "tool"    },
  { id: "ghost_mic",      name: "Ghost Mic",        emoji: "🎙️", price: 1800, desc: "lets you bypass slowmode once per hour",          category: "tool"    },
  { id: "fire_sigil",     name: "Fire Sigil",       emoji: "🔥", price: 900,   desc: "your messages glow on `+profile`",               category: "cosmetic" },
  { id: "iridium_disc",   name: "Iridium Disc",     emoji: "💿", price: 4500,  desc: "rare — limited edition flex piece",              category: "rare"    },
  { id: "starless_crown", name: "Starless Crown",   emoji: "👑", price: 8000,  desc: "rare — top of the leaderboard cosmetic",         category: "rare"    },
  { id: "phantom_key",    name: "Phantom Key",      emoji: "🗝️", price: 5000, desc: "rare — unlocks the hidden command tier",         category: "rare"    },
];

export function findItem(query: string): ShopItem | undefined {
  const q = query.toLowerCase().replace(/\s+/g, "_");
  return SHOP.find((s) => s.id === q || s.name.toLowerCase() === query.toLowerCase());
}
