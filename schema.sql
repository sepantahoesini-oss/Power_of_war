PRAGMA foreign_keys = ON;

-- =========================================
-- USERS
-- =========================================

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    total_games INTEGER NOT NULL DEFAULT 0,
    victories INTEGER NOT NULL DEFAULT 0,
    loyalty_date TEXT DEFAULT CURRENT_TIMESTAMP,
    blocked_type TEXT NOT NULL DEFAULT 'none',
    blocked_until TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_code
ON users(code);


-- =========================================
-- SEASON 8 PLAYERS
-- =========================================

CREATE TABLE IF NOT EXISTS s8_players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_code TEXT NOT NULL UNIQUE
        REFERENCES users(code)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    country TEXT NOT NULL UNIQUE,

    dollars INTEGER NOT NULL DEFAULT 10000,
    oil INTEGER NOT NULL DEFAULT 0,
    income_daily INTEGER NOT NULL DEFAULT 0,

    active INTEGER NOT NULL DEFAULT 1,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_s8_players_country
ON s8_players(country);

CREATE INDEX IF NOT EXISTS idx_s8_players_user_code
ON s8_players(user_code);


-- =========================================
-- SEASON 8 MILITARY ASSETS
-- =========================================

CREATE TABLE IF NOT EXISTS s8_assets (
    player_id INTEGER PRIMARY KEY
        REFERENCES s8_players(id)
        ON DELETE CASCADE,

    -- MISSILES
    missiles_normal INTEGER NOT NULL DEFAULT 0,
    missiles_advanced INTEGER NOT NULL DEFAULT 0,
    missiles_super INTEGER NOT NULL DEFAULT 0,
    missiles_heavy INTEGER NOT NULL DEFAULT 0,
    missiles_heavy_advanced INTEGER NOT NULL DEFAULT 0,
    missiles_long INTEGER NOT NULL DEFAULT 0,
    missiles_long_advanced INTEGER NOT NULL DEFAULT 0,
    missiles_very_long INTEGER NOT NULL DEFAULT 0,
    missiles_very_long_advanced INTEGER NOT NULL DEFAULT 0,
    missiles_special INTEGER NOT NULL DEFAULT 0,

    -- MILITARY
    military_normal INTEGER NOT NULL DEFAULT 0,
    military_advanced INTEGER NOT NULL DEFAULT 0,
    military_special INTEGER NOT NULL DEFAULT 0,
    military_logistics INTEGER NOT NULL DEFAULT 0,
    military_heavy INTEGER NOT NULL DEFAULT 0,
    military_heavy_advanced INTEGER NOT NULL DEFAULT 0,
    commander INTEGER NOT NULL DEFAULT 0,
    commander_advanced INTEGER NOT NULL DEFAULT 0,
    commander_special INTEGER NOT NULL DEFAULT 0,
    commander_general INTEGER NOT NULL DEFAULT 0,

    -- AIR DEFENSE
    defense_normal INTEGER NOT NULL DEFAULT 0,
    defense_advanced INTEGER NOT NULL DEFAULT 0,
    defense_super INTEGER NOT NULL DEFAULT 0,
    defense_short INTEGER NOT NULL DEFAULT 0,
    defense_short_advanced INTEGER NOT NULL DEFAULT 0,
    defense_medium INTEGER NOT NULL DEFAULT 0,
    defense_medium_advanced INTEGER NOT NULL DEFAULT 0,
    defense_long INTEGER NOT NULL DEFAULT 0,
    defense_long_advanced INTEGER NOT NULL DEFAULT 0,
    defense_very_advanced INTEGER NOT NULL DEFAULT 0,

    -- FIGHTERS
    fighter_normal INTEGER NOT NULL DEFAULT 0,
    fighter_advanced INTEGER NOT NULL DEFAULT 0,
    fighter_super INTEGER NOT NULL DEFAULT 0,
    fighter_light INTEGER NOT NULL DEFAULT 0,
    fighter_light_advanced INTEGER NOT NULL DEFAULT 0,
    fighter_heavy INTEGER NOT NULL DEFAULT 0,
    fighter_heavy_advanced INTEGER NOT NULL DEFAULT 0,
    fighter_long INTEGER NOT NULL DEFAULT 0,
    fighter_long_advanced INTEGER NOT NULL DEFAULT 0,
    fighter_very_advanced INTEGER NOT NULL DEFAULT 0,

    -- BOMBERS
    bomber_normal INTEGER NOT NULL DEFAULT 0,
    bomber_advanced INTEGER NOT NULL DEFAULT 0,
    bomber_super INTEGER NOT NULL DEFAULT 0,
    bomber_light INTEGER NOT NULL DEFAULT 0,
    bomber_light_advanced INTEGER NOT NULL DEFAULT 0,
    bomber_heavy INTEGER NOT NULL DEFAULT 0,
    bomber_heavy_advanced INTEGER NOT NULL DEFAULT 0,
    bomber_long INTEGER NOT NULL DEFAULT 0,
    bomber_long_advanced INTEGER NOT NULL DEFAULT 0,
    bomber_very_advanced INTEGER NOT NULL DEFAULT 0,

    -- SHIPS
    ship_normal INTEGER NOT NULL DEFAULT 0,
    ship_advanced INTEGER NOT NULL DEFAULT 0,
    ship_super INTEGER NOT NULL DEFAULT 0,
    ship_light INTEGER NOT NULL DEFAULT 0,
    ship_light_advanced INTEGER NOT NULL DEFAULT 0,
    ship_heavy INTEGER NOT NULL DEFAULT 0,
    ship_heavy_advanced INTEGER NOT NULL DEFAULT 0,
    ship_long INTEGER NOT NULL DEFAULT 0,
    ship_long_advanced INTEGER NOT NULL DEFAULT 0,
    ship_very_advanced INTEGER NOT NULL DEFAULT 0
);


-- =========================================
-- INCOME ASSETS
-- =========================================

CREATE TABLE IF NOT EXISTS s8_income_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    player_id INTEGER NOT NULL
        REFERENCES s8_players(id)
        ON DELETE CASCADE,

    kind TEXT NOT NULL,
    qty INTEGER NOT NULL DEFAULT 0,

    UNIQUE(player_id, kind)
);

CREATE INDEX IF NOT EXISTS idx_s8_income_assets_player
ON s8_income_assets(player_id);


-- =========================================
-- TRANSACTIONS
-- =========================================

CREATE TABLE IF NOT EXISTS s8_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    tx_code TEXT NOT NULL UNIQUE,

    player_id INTEGER,
    user_code TEXT,

    type TEXT NOT NULL,
    description TEXT NOT NULL,

    amount INTEGER NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 0,

    item_key TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_s8_transactions_player
ON s8_transactions(player_id);

CREATE INDEX IF NOT EXISTS idx_s8_transactions_user
ON s8_transactions(user_code);

CREATE INDEX IF NOT EXISTS idx_s8_transactions_created
ON s8_transactions(created_at);


-- =========================================
-- TRANSFERS
-- =========================================

CREATE TABLE IF NOT EXISTS s8_transfers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    tx_code TEXT NOT NULL UNIQUE,

    sender_player_id INTEGER NOT NULL
        REFERENCES s8_players(id)
        ON DELETE CASCADE,

    receiver_player_id INTEGER NOT NULL
        REFERENCES s8_players(id)
        ON DELETE CASCADE,

    kind TEXT NOT NULL,

    asset_key TEXT,

    quantity INTEGER NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_s8_transfers_sender
ON s8_transfers(sender_player_id);

CREATE INDEX IF NOT EXISTS idx_s8_transfers_receiver
ON s8_transfers(receiver_player_id);

CREATE INDEX IF NOT EXISTS idx_s8_transfers_created
ON s8_transfers(created_at);


-- =========================================
-- BATTLES / WAR
-- =========================================

CREATE TABLE IF NOT EXISTS s8_battles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    code TEXT NOT NULL UNIQUE,

    attacker_player_id INTEGER NOT NULL
        REFERENCES s8_players(id)
        ON DELETE CASCADE,

    defender_player_id INTEGER NOT NULL
        REFERENCES s8_players(id)
        ON DELETE CASCADE,

    mode TEXT NOT NULL,

    scenario TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'pending',

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    reviewed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_s8_battles_attacker
ON s8_battles(attacker_player_id);

CREATE INDEX IF NOT EXISTS idx_s8_battles_defender
ON s8_battles(defender_player_id);

CREATE INDEX IF NOT EXISTS idx_s8_battles_status
ON s8_battles(status);


-- =========================================
-- BATTLE ASSETS
-- =========================================

CREATE TABLE IF NOT EXISTS s8_battle_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    battle_id INTEGER NOT NULL
        REFERENCES s8_battles(id)
        ON DELETE CASCADE,

    asset_key TEXT NOT NULL,

    quantity INTEGER NOT NULL,

    UNIQUE(battle_id, asset_key)
);

CREATE INDEX IF NOT EXISTS idx_s8_battle_assets_battle
ON s8_battle_assets(battle_id);


-- =========================================
-- SETTINGS
-- =========================================

CREATE TABLE IF NOT EXISTS s8_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT OR IGNORE INTO s8_settings(key, value)
VALUES ('war_enabled', '1');

INSERT OR IGNORE INTO s8_settings(key, value)
VALUES ('bitcoin_price', '120000');

INSERT OR IGNORE INTO s8_settings(key, value)
VALUES ('last_income_day', '');

INSERT OR IGNORE INTO s8_settings(key, value)
VALUES ('timezone', 'Asia/Tehran');
