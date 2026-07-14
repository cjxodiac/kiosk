export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_sec INTEGER,
  mode TEXT,
  used_accessibility INTEGER DEFAULT 0,
  accessibility_options TEXT,
  completed INTEGER DEFAULT 0,
  abandoned_at_screen TEXT,
  order_id INTEGER,
  click_count INTEGER DEFAULT 0,
  store_type TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  event_type TEXT NOT NULL,
  screen TEXT,
  payload TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  order_number INTEGER NOT NULL,
  order_date TEXT NOT NULL,
  items_json TEXT NOT NULL,
  item_count INTEGER,
  total INTEGER NOT NULL,
  payment_method TEXT,
  payment_json TEXT,
  mode TEXT,
  used_accessibility INTEGER DEFAULT 0,
  member_id INTEGER,
  points_earned INTEGER DEFAULT 0,
  points_used INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  ice_only INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  unit TEXT NOT NULL,
  stock REAL NOT NULL DEFAULT 0,
  low_stock_threshold REAL DEFAULT 10,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS menus (
  id INTEGER PRIMARY KEY,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  image_path TEXT,
  description TEXT,
  is_sold_out_manual INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS recipes (
  menu_id INTEGER NOT NULL,
  ingredient_id INTEGER NOT NULL,
  quantity REAL NOT NULL,
  PRIMARY KEY (menu_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS option_recipes (
  option_name TEXT PRIMARY KEY,
  ingredient_id INTEGER NOT NULL,
  quantity REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  points INTEGER DEFAULT 0,
  joined_at TEXT NOT NULL,
  last_visited_at TEXT
);

CREATE TABLE IF NOT EXISTS point_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  order_id INTEGER,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
`