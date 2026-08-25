-- ====================================================================
-- DISASTER MANAGEMENT & EMERGENCY RESPONSE SYSTEM - RELATIONAL DATABASE SCHEMA
-- Compatible with SQLite and MySQL DBMS
-- ====================================================================

-- 1. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  area_code VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK(role IN ('ADMIN', 'RESPONSE_TEAM', 'PUBLIC')),
  phone VARCHAR(20),
  department VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. DISASTERS TABLE
CREATE TABLE IF NOT EXISTS disasters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK(type IN ('FLOOD', 'EARTHQUAKE', 'CYCLONE', 'FIRE', 'LANDSLIDE', 'TSUNAMI', 'HEATWAVE')),
  location_id INTEGER NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK(severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status VARCHAR(20) NOT NULL CHECK(status IN ('ACTIVE', 'WARNING', 'RESOLVED')),
  affected_population INTEGER DEFAULT 0,
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- 4. SHELTERS TABLE
CREATE TABLE IF NOT EXISTS shelters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(200) NOT NULL,
  location_id INTEGER NOT NULL,
  address TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK(capacity > 0),
  occupied_capacity INTEGER DEFAULT 0 CHECK(occupied_capacity >= 0),
  contact_number VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'LIMITED', 'FULL')),
  facilities TEXT, -- Comma-separated or JSON list (e.g. Medical, Food, Water, Power Backup)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- 5. RESOURCES TABLE
CREATE TABLE IF NOT EXISTS resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK(category IN ('FOOD', 'WATER', 'MEDICAL', 'CLOTHES', 'EQUIPMENT', 'MEDICINE', 'VEHICLE')),
  quantity INTEGER NOT NULL CHECK(quantity >= 0),
  unit VARCHAR(30) NOT NULL,
  location_id INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'LIMITED', 'OUT_OF_STOCK')),
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- 6. RESCUE OPERATIONS TABLE
CREATE TABLE IF NOT EXISTS rescue_operations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  operation_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  disaster_id INTEGER NOT NULL,
  location_id INTEGER NOT NULL,
  rescue_team VARCHAR(150) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  people_rescued INTEGER DEFAULT 0,
  resources_used TEXT,
  status VARCHAR(20) DEFAULT 'ONGOING' CHECK(status IN ('PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED')),
  progress INTEGER DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (disaster_id) REFERENCES disasters(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- 7. VICTIMS TABLE
CREATE TABLE IF NOT EXISTS victims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  victim_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  age INTEGER,
  gender VARCHAR(20),
  location_id INTEGER NOT NULL,
  disaster_id INTEGER NOT NULL,
  contact_number VARCHAR(20),
  medical_needs TEXT,
  rescue_status VARCHAR(30) DEFAULT 'LOCATED' CHECK(rescue_status IN ('MISSING', 'LOCATED', 'RESCUED', 'HOSPITALIZED')),
  priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  reporter_user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  FOREIGN KEY (disaster_id) REFERENCES disasters(id) ON DELETE CASCADE,
  FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 8. RELIEF DISTRIBUTIONS TABLE
CREATE TABLE IF NOT EXISTS relief_distributions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  distribution_code VARCHAR(50) NOT NULL UNIQUE,
  disaster_id INTEGER NOT NULL,
  location_id INTEGER NOT NULL,
  resource_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  recipient_info VARCHAR(200) NOT NULL,
  distributed_by_user_id INTEGER,
  distribution_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (disaster_id) REFERENCES disasters(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  FOREIGN KEY (distributed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 9. EMERGENCY CONTACTS TABLE
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category VARCHAR(50) NOT NULL CHECK(category IN ('POLICE', 'FIRE', 'AMBULANCE', 'DISASTER_RESPONSE', 'HOSPITALS', 'LOCAL_SERVICES')),
  service_name VARCHAR(150) NOT NULL,
  phone_number VARCHAR(30) NOT NULL,
  alternate_phone VARCHAR(30),
  location_id INTEGER NOT NULL,
  address TEXT,
  is_24x7 BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- 10. SAFETY GUIDELINES TABLE
CREATE TABLE IF NOT EXISTS safety_guidelines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  disaster_type VARCHAR(50) NOT NULL CHECK(disaster_type IN ('FLOOD', 'EARTHQUAKE', 'CYCLONE', 'FIRE', 'LANDSLIDE', 'TSUNAMI', 'HEATWAVE')),
  title VARCHAR(200) NOT NULL,
  summary TEXT NOT NULL,
  before_instructions TEXT NOT NULL,
  during_instructions TEXT NOT NULL,
  after_instructions TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(30) DEFAULT 'ALERT' CHECK(type IN ('ALERT', 'RESOURCE', 'RESCUE', 'SHELTER', 'SYSTEM')),
  target_role VARCHAR(30) DEFAULT 'ALL',
  is_read BOOLEAN DEFAULT 0,
  disaster_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (disaster_id) REFERENCES disasters(id) ON DELETE CASCADE
);

-- INDEXES FOR PERFORMANCE OPTIMIZATION
CREATE INDEX IF NOT EXISTS idx_disasters_status ON disasters(status);
CREATE INDEX IF NOT EXISTS idx_disasters_severity ON disasters(severity);
CREATE INDEX IF NOT EXISTS idx_shelters_status ON shelters(status);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_rescue_status ON rescue_operations(status);
CREATE INDEX IF NOT EXISTS idx_victims_rescue_status ON victims(rescue_status);
CREATE INDEX IF NOT EXISTS idx_victims_priority ON victims(priority);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_cat ON emergency_contacts(category);
