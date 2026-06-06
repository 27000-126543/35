const { getDb, closeDb } = require('./index');

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS gas_stations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  longitude REAL NOT NULL,
  latitude REAL NOT NULL,
  supply_capacity REAL NOT NULL,
  current_output REAL DEFAULT 0,
  methane_content REAL DEFAULT 0,
  calorific_value REAL DEFAULT 0,
  impurity_content REAL DEFAULT 0,
  pressure REAL DEFAULT 0,
  status TEXT DEFAULT 'normal',
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS pipeline_nodes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  longitude REAL NOT NULL,
  latitude REAL NOT NULL,
  pipe_diameter REAL NOT NULL,
  design_pressure REAL NOT NULL,
  current_pressure REAL NOT NULL,
  status TEXT DEFAULT 'normal',
  connected_nodes TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  address TEXT NOT NULL,
  region TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  daily_gas_volume REAL NOT NULL,
  gas_percentage REAL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS dispatch_plans (
  id TEXT PRIMARY KEY,
  plan_date TEXT NOT NULL,
  total_supply REAL NOT NULL,
  weather_forecast TEXT,
  is_holiday INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  storage_usage REAL DEFAULT 0,
  pressure_balance_score REAL DEFAULT 0,
  station_allocations TEXT DEFAULT '[]',
  node_pressure_targets TEXT DEFAULT '[]',
  adjust_reason TEXT,
  approver_id TEXT,
  approved_at TEXT,
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS emergency_alarms (
  id TEXT PRIMARY KEY,
  node_id TEXT NOT NULL,
  node_name TEXT NOT NULL,
  type TEXT NOT NULL,
  level TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  triggered_at TEXT DEFAULT (datetime('now', 'localtime')),
  acknowledged_at TEXT,
  resolved_at TEXT,
  acknowledged_by TEXT,
  resolved_by TEXT,
  resolution_notes TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS repair_orders (
  id TEXT PRIMARY KEY,
  alarm_id TEXT,
  node_id TEXT NOT NULL,
  node_name TEXT NOT NULL,
  description TEXT,
  team_id TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'high',
  dispatched_at TEXT,
  arrived_at TEXT,
  started_at TEXT,
  completed_at TEXT,
  duration_minutes INTEGER DEFAULT 0,
  equipment_used TEXT DEFAULT '[]',
  repair_notes TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS repair_teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  leader TEXT NOT NULL,
  phone TEXT NOT NULL,
  members TEXT DEFAULT '[]',
  equipment TEXT DEFAULT '[]',
  status TEXT DEFAULT 'idle',
  region TEXT,
  current_order_id TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS repair_vehicles (
  id TEXT PRIMARY KEY,
  plate_number TEXT NOT NULL,
  vehicle_type TEXT,
  longitude REAL,
  latitude REAL,
  status TEXT DEFAULT 'idle',
  current_order_id TEXT,
  driver TEXT,
  phone TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS repair_tickets (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_type TEXT,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  description TEXT,
  fault_type TEXT,
  status TEXT DEFAULT 'pending',
  worker_id TEXT,
  dispatched_at TEXT,
  completed_at TEXT,
  result TEXT,
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS maintenance_workers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  region TEXT NOT NULL,
  status TEXT DEFAULT 'idle',
  current_ticket_id TEXT,
  skills TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS daily_gas_records (
  id TEXT PRIMARY KEY,
  record_date TEXT NOT NULL,
  station_id TEXT NOT NULL,
  gas_supply REAL NOT NULL,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS pressure_records (
  id TEXT PRIMARY KEY,
  node_id TEXT NOT NULL,
  pressure REAL NOT NULL,
  status TEXT DEFAULT 'normal',
  recorded_at TEXT DEFAULT (datetime('now', 'localtime'))
);
`;

async function initDb() {
  const db = await getDb();
  db.exec(SCHEMA_SQL);
  console.log('✅ 数据库表结构创建成功');
}

if (require.main === module) {
  (async () => {
    await initDb();
    closeDb();
  })();
}

module.exports = { initDb, SCHEMA_SQL };
