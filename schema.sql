PRAGMA foreign_keys=ON;
-- کاربران قبلی را حذف نکنید. اگر users از قبل وجود دارد، این دستورها فقط جداول سیزن ۸ را اضافه می‌کنند.
CREATE TABLE IF NOT EXISTS s8_players (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_code TEXT NOT NULL UNIQUE REFERENCES users(code) ON UPDATE CASCADE ON DELETE CASCADE,
 country TEXT NOT NULL UNIQUE,
 dollars INTEGER NOT NULL DEFAULT 10000,
 oil INTEGER NOT NULL DEFAULT 0,
 income_daily INTEGER NOT NULL DEFAULT 0,
 active INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_s8_players_country ON s8_players(country);
CREATE TABLE IF NOT EXISTS s8_assets (
 player_id INTEGER PRIMARY KEY REFERENCES s8_players(id) ON DELETE CASCADE,
 missiles_normal INTEGER NOT NULL DEFAULT 0, missiles_advanced INTEGER NOT NULL DEFAULT 0, missiles_super INTEGER NOT NULL DEFAULT 0, missiles_heavy INTEGER NOT NULL DEFAULT 0, missiles_heavy_advanced INTEGER NOT NULL DEFAULT 0, missiles_long INTEGER NOT NULL DEFAULT 0, missiles_long_advanced INTEGER NOT NULL DEFAULT 0, missiles_very_long INTEGER NOT NULL DEFAULT 0, missiles_very_long_advanced INTEGER NOT NULL DEFAULT 0, missiles_special INTEGER NOT NULL DEFAULT 0,
 military_normal INTEGER NOT NULL DEFAULT 0, military_advanced INTEGER NOT NULL DEFAULT 0, military_special INTEGER NOT NULL DEFAULT 0, military_logistics INTEGER NOT NULL DEFAULT 0, military_heavy INTEGER NOT NULL DEFAULT 0, military_heavy_advanced INTEGER NOT NULL DEFAULT 0, commander INTEGER NOT NULL DEFAULT 0, commander_advanced INTEGER NOT NULL DEFAULT 0, commander_special INTEGER NOT NULL DEFAULT 0, commander_general INTEGER NOT NULL DEFAULT 0,
 defense_normal INTEGER NOT NULL DEFAULT 0, defense_advanced INTEGER NOT NULL DEFAULT 0, defense_super INTEGER NOT NULL DEFAULT 0, defense_short INTEGER NOT NULL DEFAULT 0, defense_short_advanced INTEGER NOT NULL DEFAULT 0, defense_medium INTEGER NOT NULL DEFAULT 0, defense_medium_advanced INTEGER NOT NULL DEFAULT 0, defense_long INTEGER NOT NULL DEFAULT 0, defense_long_advanced INTEGER NOT NULL DEFAULT 0, defense_very_advanced INTEGER NOT NULL DEFAULT 0,
 fighter_normal INTEGER NOT NULL DEFAULT 0, fighter_advanced INTEGER NOT NULL DEFAULT 0, fighter_super INTEGER NOT NULL DEFAULT 0, fighter_light INTEGER NOT NULL DEFAULT 0, fighter_light_advanced INTEGER NOT NULL DEFAULT 0, fighter_heavy INTEGER NOT NULL DEFAULT 0, fighter_heavy_advanced INTEGER NOT NULL DEFAULT 0, fighter_long INTEGER NOT NULL DEFAULT 0, fighter_long_advanced INTEGER NOT NULL DEFAULT 0, fighter_very_advanced INTEGER NOT NULL DEFAULT 0,
 bomber_normal INTEGER NOT NULL DEFAULT 0, bomber_advanced INTEGER NOT NULL DEFAULT 0, bomber_super INTEGER NOT NULL DEFAULT 0, bomber_light INTEGER NOT NULL DEFAULT 0, bomber_light_advanced INTEGER NOT NULL DEFAULT 0, bomber_heavy INTEGER NOT NULL DEFAULT 0, bomber_heavy_advanced INTEGER NOT NULL DEFAULT 0, bomber_long INTEGER NOT NULL DEFAULT 0, bomber_long_advanced INTEGER NOT NULL DEFAULT 0, bomber_very_advanced INTEGER NOT NULL DEFAULT 0,
 ship_normal INTEGER NOT NULL DEFAULT 0, ship_advanced INTEGER NOT NULL DEFAULT 0, ship_super INTEGER NOT NULL DEFAULT 0, ship_light INTEGER NOT NULL DEFAULT 0, ship_light_advanced INTEGER NOT NULL DEFAULT 0, ship_heavy INTEGER NOT NULL DEFAULT 0, ship_heavy_advanced INTEGER NOT NULL DEFAULT 0, ship_long INTEGER NOT NULL DEFAULT 0, ship_long_advanced INTEGER NOT NULL DEFAULT 0, ship_very_advanced INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS s8_income_assets (id INTEGER PRIMARY KEY AUTOINCREMENT,player_id INTEGER NOT NULL REFERENCES s8_players(id) ON DELETE CASCADE,kind TEXT NOT NULL,qty INTEGER NOT NULL DEFAULT 0,UNIQUE(player_id,kind));
CREATE TABLE IF NOT EXISTS s8_transactions (id INTEGER PRIMARY KEY AUTOINCREMENT,tx_code TEXT NOT NULL UNIQUE,player_id INTEGER REFERENCES s8_players(id) ON DELETE SET NULL,user_code TEXT,type TEXT NOT NULL,description TEXT NOT NULL,amount INTEGER NOT NULL DEFAULT 0,quantity INTEGER NOT NULL DEFAULT 0,item_key TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_s8_tx_player ON s8_transactions(player_id,created_at);
CREATE TABLE IF NOT EXISTS s8_transfers (id INTEGER PRIMARY KEY AUTOINCREMENT,tx_code TEXT NOT NULL UNIQUE,sender_player_id INTEGER NOT NULL REFERENCES s8_players(id) ON DELETE CASCADE,receiver_player_id INTEGER NOT NULL REFERENCES s8_players(id) ON DELETE CASCADE,kind TEXT NOT NULL,asset_key TEXT,quantity INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_s8_transfer_sender ON s8_transfers(sender_player_id,created_at);
CREATE TABLE IF NOT EXISTS s8_battles (id INTEGER PRIMARY KEY AUTOINCREMENT,code TEXT NOT NULL UNIQUE,attacker_player_id INTEGER NOT NULL REFERENCES s8_players(id) ON DELETE CASCADE,defender_player_id INTEGER NOT NULL REFERENCES s8_players(id) ON DELETE CASCADE,mode TEXT NOT NULL CHECK(mode IN ('war','defense')),scenario TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,reviewed_at TEXT);
CREATE TABLE IF NOT EXISTS s8_battle_assets (id INTEGER PRIMARY KEY AUTOINCREMENT,battle_id INTEGER NOT NULL REFERENCES s8_battles(id) ON DELETE CASCADE,asset_key TEXT NOT NULL,quantity INTEGER NOT NULL,UNIQUE(battle_id,asset_key));
CREATE TABLE IF NOT EXISTS s8_settings (key TEXT PRIMARY KEY,value TEXT NOT NULL);
INSERT OR IGNORE INTO s8_settings(key,value) VALUES('war_enabled','1');
INSERT OR IGNORE INTO s8_settings(key,value) VALUES('bitcoin_price','120000');
INSERT OR IGNORE INTO s8_settings(key,value) VALUES('last_income_day','');
INSERT OR IGNORE INTO s8_settings(key,value) VALUES('timezone','Asia/Tehran');
