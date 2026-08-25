const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbFilePath = path.resolve(__dirname, 'disaster_management_store.json');

// In-memory relational database store
let store = {
  locations: [],
  users: [],
  disasters: [],
  shelters: [],
  resources: [],
  rescue_operations: [],
  victims: [],
  relief_distributions: [],
  emergency_contacts: [],
  safety_guidelines: [],
  notifications: [],
  counters: {
    locations: 1,
    users: 1,
    disasters: 1,
    shelters: 1,
    resources: 1,
    rescue_operations: 1,
    victims: 1,
    relief_distributions: 1,
    emergency_contacts: 1,
    safety_guidelines: 1,
    notifications: 1,
  },
};

function saveStore() {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving store to disk:', err);
  }
}

function loadStore() {
  try {
    if (fs.existsSync(dbFilePath)) {
      const data = fs.readFileSync(dbFilePath, 'utf8');
      store = JSON.parse(data);
      console.log('Loaded persisted database store from disk.');
    }
  } catch (err) {
    console.error('Error loading store from disk:', err);
  }
}

// Relational query engine helper
async function queryAll(sql, params = []) {
  const cleanSql = sql.trim().toLowerCase();

  // 1. HEALTH / COUNTS
  if (cleanSql.startsWith('select count(*)')) {
    const table = cleanSql.split('from ')[1].split(' ')[0].trim();
    return [{ count: store[table] ? store[table].length : 0 }];
  }

  // 2. DISASTERS WITH LOCATIONS
  if (cleanSql.includes('from disasters') && cleanSql.includes('join locations')) {
    let list = store.disasters.map((d) => {
      const loc = store.locations.find((l) => l.id === d.location_id) || {};
      return {
        ...d,
        city: loc.city || '',
        state: loc.state || '',
        district: loc.district || '',
        latitude: loc.latitude || 0,
        longitude: loc.longitude || 0,
      };
    });

    // Filtering
    if (params.length > 0) {
      if (cleanSql.includes('d.type = ?')) {
        const typeVal = params.shift();
        if (typeVal) list = list.filter((d) => d.type === typeVal);
      }
      if (cleanSql.includes('d.severity = ?')) {
        const sevVal = params.shift();
        if (sevVal) list = list.filter((d) => d.severity === sevVal);
      }
      if (cleanSql.includes('d.status = ?')) {
        const statVal = params.shift();
        if (statVal) list = list.filter((d) => d.status === statVal);
      }
      if (cleanSql.includes('d.name like ?')) {
        const term = params[0] ? params[0].replace(/%/g, '').toLowerCase() : '';
        params.shift();
        params.shift();
        params.shift();
        if (term) {
          list = list.filter(
            (d) =>
              d.name.toLowerCase().includes(term) ||
              d.description.toLowerCase().includes(term) ||
              d.city.toLowerCase().includes(term)
          );
        }
      }
    }
    return list;
  }

  // 3. SHELTERS WITH LOCATIONS
  if (cleanSql.includes('from shelters') && cleanSql.includes('join locations')) {
    let list = store.shelters.map((s) => {
      const loc = store.locations.find((l) => l.id === s.location_id) || {};
      return {
        ...s,
        city: loc.city || '',
        state: loc.state || '',
        district: loc.district || '',
        available_capacity: Math.max(0, s.capacity - s.occupied_capacity),
      };
    });

    if (cleanSql.includes('s.status = ?')) {
      const statusVal = params.shift();
      list = list.filter((s) => s.status === statusVal);
    }
    if (cleanSql.includes('s.location_id = ?')) {
      const locId = parseInt(params.shift());
      list = list.filter((s) => s.location_id === locId);
    }
    if (cleanSql.includes('s.name like ?')) {
      const term = params[0] ? params[0].replace(/%/g, '').toLowerCase() : '';
      params.shift();
      params.shift();
      params.shift();
      params.shift();
      if (term) {
        list = list.filter(
          (s) =>
            s.name.toLowerCase().includes(term) ||
            s.address.toLowerCase().includes(term) ||
            s.city.toLowerCase().includes(term) ||
            s.facilities.toLowerCase().includes(term)
        );
      }
    }
    return list;
  }

  // 4. RESOURCES WITH LOCATIONS
  if (cleanSql.includes('from resources') && cleanSql.includes('join locations')) {
    let list = store.resources.map((r) => {
      const loc = store.locations.find((l) => l.id === r.location_id) || {};
      return {
        ...r,
        city: loc.city || '',
        state: loc.state || '',
      };
    });

    if (cleanSql.includes('r.category = ?')) {
      const cat = params.shift();
      list = list.filter((r) => r.category === cat);
    }
    if (cleanSql.includes('r.status = ?')) {
      const stat = params.shift();
      list = list.filter((r) => r.status === stat);
    }
    if (cleanSql.includes('r.name like ?')) {
      const term = params[0] ? params[0].replace(/%/g, '').toLowerCase() : '';
      params.shift();
      params.shift();
      params.shift();
      if (term) {
        list = list.filter(
          (r) =>
            r.name.toLowerCase().includes(term) ||
            r.category.toLowerCase().includes(term) ||
            r.city.toLowerCase().includes(term)
        );
      }
    }
    return list;
  }

  // 5. RESCUE OPERATIONS WITH DISASTERS & LOCATIONS
  if (cleanSql.includes('from rescue_operations') && cleanSql.includes('join disasters')) {
    let list = store.rescue_operations.map((ro) => {
      const dis = store.disasters.find((d) => d.id === ro.disaster_id) || {};
      const loc = store.locations.find((l) => l.id === ro.location_id) || {};
      return {
        ...ro,
        disaster_name: dis.name || '',
        disaster_severity: dis.severity || '',
        city: loc.city || '',
        state: loc.state || '',
      };
    });

    if (cleanSql.includes('ro.status = ?')) {
      const stat = params.shift();
      list = list.filter((ro) => ro.status === stat);
    }
    if (cleanSql.includes('ro.name like ?')) {
      const term = params[0] ? params[0].replace(/%/g, '').toLowerCase() : '';
      params.shift();
      params.shift();
      params.shift();
      params.shift();
      if (term) {
        list = list.filter(
          (ro) =>
            ro.name.toLowerCase().includes(term) ||
            ro.operation_code.toLowerCase().includes(term) ||
            ro.rescue_team.toLowerCase().includes(term) ||
            ro.city.toLowerCase().includes(term)
        );
      }
    }
    return list;
  }

  // 6. VICTIMS WITH DISASTERS & LOCATIONS
  if (cleanSql.includes('from victims') && cleanSql.includes('join disasters')) {
    let list = store.victims.map((v) => {
      const dis = store.disasters.find((d) => d.id === v.disaster_id) || {};
      const loc = store.locations.find((l) => l.id === v.location_id) || {};
      return {
        ...v,
        disaster_name: dis.name || '',
        city: loc.city || '',
        state: loc.state || '',
      };
    });

    if (cleanSql.includes('v.rescue_status = ?')) {
      const stat = params.shift();
      list = list.filter((v) => v.rescue_status === stat);
    }
    if (cleanSql.includes('v.priority = ?')) {
      const prio = params.shift();
      list = list.filter((v) => v.priority === prio);
    }
    if (cleanSql.includes('v.name like ?')) {
      const term = params[0] ? params[0].replace(/%/g, '').toLowerCase() : '';
      params.shift();
      params.shift();
      params.shift();
      params.shift();
      if (term) {
        list = list.filter(
          (v) =>
            v.name.toLowerCase().includes(term) ||
            v.victim_code.toLowerCase().includes(term) ||
            (v.medical_needs && v.medical_needs.toLowerCase().includes(term)) ||
            v.city.toLowerCase().includes(term)
        );
      }
    }
    return list;
  }

  // 7. RELIEF DISTRIBUTIONS
  if (cleanSql.includes('from relief_distributions')) {
    return store.relief_distributions.map((rd) => {
      const dis = store.disasters.find((d) => d.id === rd.disaster_id) || {};
      const loc = store.locations.find((l) => l.id === rd.location_id) || {};
      const res = store.resources.find((r) => r.id === rd.resource_id) || {};
      const usr = store.users.find((u) => u.id === rd.distributed_by_user_id) || {};
      return {
        ...rd,
        disaster_name: dis.name || '',
        city: loc.city || '',
        resource_name: res.name || '',
        unit: res.unit || '',
        resource_category: res.category || '',
        distributed_by_name: usr.name || 'Emergency Admin',
      };
    });
  }

  // 8. EMERGENCY CONTACTS WITH LOCATIONS
  if (cleanSql.includes('from emergency_contacts') && cleanSql.includes('join locations')) {
    let list = store.emergency_contacts.map((ec) => {
      const loc = store.locations.find((l) => l.id === ec.location_id) || {};
      return {
        ...ec,
        city: loc.city || '',
        state: loc.state || '',
      };
    });

    if (cleanSql.includes('ec.category = ?')) {
      const cat = params.shift();
      list = list.filter((ec) => ec.category === cat);
    }
    if (cleanSql.includes('ec.service_name like ?')) {
      const term = params[0] ? params[0].replace(/%/g, '').toLowerCase() : '';
      params.shift();
      params.shift();
      params.shift();
      if (term) {
        list = list.filter(
          (ec) =>
            ec.service_name.toLowerCase().includes(term) ||
            ec.phone_number.includes(term) ||
            ec.city.toLowerCase().includes(term)
        );
      }
    }
    return list;
  }

  // 9. SAFETY GUIDELINES
  if (cleanSql.includes('from safety_guidelines')) {
    let list = [...store.safety_guidelines];
    if (cleanSql.includes('disaster_type = ?')) {
      const dt = params.shift();
      list = list.filter((g) => g.disaster_type === dt);
    }
    return list;
  }

  // 10. NOTIFICATIONS
  if (cleanSql.includes('from notifications')) {
    return [...store.notifications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // 11. LOCATIONS
  if (cleanSql.includes('from locations')) {
    return [...store.locations];
  }

  // 12. SHELTERS
  if (cleanSql.includes('from shelters')) {
    const locId = params[0];
    if (locId) return store.shelters.filter((s) => s.location_id === parseInt(locId));
    return store.shelters;
  }

  // 13. RESOURCES
  if (cleanSql.includes('from resources')) {
    const locId = params[0];
    if (locId) return store.resources.filter((r) => r.location_id === parseInt(locId));
    return store.resources;
  }

  // 14. RESCUE OPERATIONS BY DISASTER
  if (cleanSql.includes('from rescue_operations')) {
    const disId = params[0];
    if (disId) return store.rescue_operations.filter((ro) => ro.disaster_id === parseInt(disId));
    return store.rescue_operations;
  }

  // 15. EMERGENCY CONTACTS BY LOCATION
  if (cleanSql.includes('from emergency_contacts')) {
    const locId = params[0];
    if (locId) return store.emergency_contacts.filter((ec) => ec.location_id === parseInt(locId));
    return store.emergency_contacts;
  }

  // CHARTS & STATS QUERIES
  if (cleanSql.includes('severity, count(*) as count from disasters')) {
    const counts = {};
    store.disasters.forEach((d) => (counts[d.severity] = (counts[d.severity] || 0) + 1));
    return Object.keys(counts).map((k) => ({ severity: k, count: counts[k] }));
  }

  if (cleanSql.includes('sum(d.affected_population) as total_affected')) {
    const cityMap = {};
    store.disasters.forEach((d) => {
      const loc = store.locations.find((l) => l.id === d.location_id);
      if (loc) {
        cityMap[loc.city] = (cityMap[loc.city] || 0) + d.affected_population;
      }
    });
    return Object.keys(cityMap).map((city) => ({ city, total_affected: cityMap[city] }));
  }

  if (cleanSql.includes('sum(quantity) as total_quantity from resources')) {
    const catMap = {};
    store.resources.forEach((r) => (catMap[r.category] = (catMap[r.category] || 0) + r.quantity));
    return Object.keys(catMap).map((category) => ({ category, total_quantity: catMap[category] }));
  }

  if (cleanSql.includes('from rescue_operations order by progress desc')) {
    return store.rescue_operations.map((ro) => ({
      name: ro.name,
      progress: ro.progress,
      people_rescued: ro.people_rescued,
      status: ro.status,
    }));
  }

  if (cleanSql.includes('disaster summary') || cleanSql.includes('group by type')) {
    const typeMap = {};
    store.disasters.forEach((d) => {
      if (!typeMap[d.type]) typeMap[d.type] = { type: d.type, total_events: 0, total_affected: 0 };
      typeMap[d.type].total_events += 1;
      typeMap[d.type].total_affected += d.affected_population;
    });
    return Object.values(typeMap);
  }

  if (cleanSql.includes('group by rescue_status')) {
    const statMap = {};
    store.victims.forEach((v) => (statMap[v.rescue_status] = (statMap[v.rescue_status] || 0) + 1));
    return Object.keys(statMap).map((k) => ({ rescue_status: k, count: statMap[k] }));
  }

  return [];
}

async function queryGet(sql, params = []) {
  const cleanSql = sql.trim().toLowerCase();

  if (cleanSql.includes('select count(*) as count from users')) {
    return { count: store.users.length };
  }
  if (cleanSql.includes('select count(*) as count from disasters')) {
    return { count: store.disasters.length };
  }
  if (cleanSql.includes('from users where email = ?')) {
    const user = store.users.find((u) => u.email.toLowerCase() === params[0].toLowerCase());
    return user || null;
  }
  if (cleanSql.includes('select id from users where email = ?')) {
    const user = store.users.find((u) => u.email.toLowerCase() === params[0].toLowerCase());
    return user ? { id: user.id } : null;
  }
  if (cleanSql.includes('from disasters d') && cleanSql.includes('where d.id = ?')) {
    const id = parseInt(params[0]);
    const d = store.disasters.find((item) => item.id === id);
    if (!d) return null;
    const loc = store.locations.find((l) => l.id === d.location_id) || {};
    return {
      ...d,
      city: loc.city || '',
      state: loc.state || '',
      district: loc.district || '',
      latitude: loc.latitude || 0,
      longitude: loc.longitude || 0,
    };
  }
  if (cleanSql.includes('from safety_guidelines where disaster_type = ?')) {
    return store.safety_guidelines.find((g) => g.disaster_type === params[0]) || null;
  }

  // Dashboard Aggregates
  if (cleanSql.includes('where status = "active"') && cleanSql.includes('count(*) as count from disasters')) {
    const active = store.disasters.filter((d) => d.status === 'ACTIVE');
    return { count: active.length };
  }
  if (cleanSql.includes('sum(affected_population) as sum from disasters')) {
    const sum = store.disasters.filter((d) => d.status === 'ACTIVE').reduce((acc, d) => acc + d.affected_population, 0);
    return { sum };
  }
  if (cleanSql.includes('count(*) as count from shelters where status != "full"')) {
    return { count: store.shelters.filter((s) => s.status !== 'FULL').length };
  }
  if (cleanSql.includes('sum(capacity) as cap, sum(occupied_capacity) as occ from shelters')) {
    const cap = store.shelters.reduce((acc, s) => acc + s.capacity, 0);
    const occ = store.shelters.reduce((acc, s) => acc + s.occupied_capacity, 0);
    return { cap, occ };
  }
  if (cleanSql.includes('count(*) as count from rescue_operations where status = "ongoing"')) {
    return { count: store.rescue_operations.filter((ro) => ro.status === 'ONGOING').length };
  }
  if (cleanSql.includes('sum(people_rescued) as sum from rescue_operations')) {
    const sum = store.rescue_operations.reduce((acc, ro) => acc + (ro.people_rescued || 0), 0);
    return { sum };
  }
  if (cleanSql.includes('count(*) as count from resources where status = "available"')) {
    return { count: store.resources.filter((r) => r.status === 'AVAILABLE').length };
  }
  if (cleanSql.includes('count(*) as count from relief_distributions')) {
    return { count: store.relief_distributions.length };
  }
  if (cleanSql.includes('sum(quantity) as total_items_distributed')) {
    const total_items = store.relief_distributions.reduce((acc, rd) => acc + rd.quantity, 0);
    return { total_distributions: store.relief_distributions.length, total_items_distributed: total_items };
  }
  if (cleanSql.includes('select quantity from resources where id = ?')) {
    const r = store.resources.find((res) => res.id === parseInt(params[0]));
    return r ? { quantity: r.quantity } : null;
  }

  return null;
}

async function queryRun(sql, params = []) {
  const cleanSql = sql.trim().toLowerCase();

  // 1. INSERT USERS
  if (cleanSql.startsWith('insert into users')) {
    const id = store.counters.users++;
    const [name, email, password_hash, role, phone, department] = params;
    const user = { id, name, email, password_hash, role, phone, department, created_at: new Date().toISOString() };
    store.users.push(user);
    saveStore();
    return { lastID: id, changes: 1 };
  }

  // 2. INSERT DISASTERS
  if (cleanSql.startsWith('insert into disasters')) {
    const id = store.counters.disasters++;
    const [name, type, location_id, severity, status, affected_population, description, start_date] = params;
    const disaster = {
      id,
      name,
      type,
      location_id: parseInt(location_id),
      severity,
      status,
      affected_population: parseInt(affected_population),
      description,
      start_date,
      created_at: new Date().toISOString(),
    };
    store.disasters.push(disaster);
    saveStore();
    return { lastID: id, changes: 1 };
  }

  // 3. UPDATE DISASTERS
  if (cleanSql.startsWith('update disasters')) {
    const id = parseInt(params[params.length - 1]);
    const d = store.disasters.find((item) => item.id === id);
    if (d) {
      const [name, type, location_id, severity, status, affected_population, description, start_date, end_date] = params;
      d.name = name;
      d.type = type;
      d.location_id = parseInt(location_id);
      d.severity = severity;
      d.status = status;
      d.affected_population = parseInt(affected_population);
      d.description = description;
      d.start_date = start_date;
      d.end_date = end_date;
      saveStore();
    }
    return { changes: 1 };
  }

  // 4. DELETE DISASTERS
  if (cleanSql.startsWith('delete from disasters')) {
    const id = parseInt(params[0]);
    store.disasters = store.disasters.filter((d) => d.id !== id);
    saveStore();
    return { changes: 1 };
  }

  // 5. INSERT SHELTERS
  if (cleanSql.startsWith('insert into shelters')) {
    const id = store.counters.shelters++;
    const [name, location_id, address, capacity, occupied_capacity, contact_number, status, facilities] = params;
    const shelter = {
      id,
      name,
      location_id: parseInt(location_id),
      address,
      capacity: parseInt(capacity),
      occupied_capacity: parseInt(occupied_capacity),
      contact_number,
      status,
      facilities,
      created_at: new Date().toISOString(),
    };
    store.shelters.push(shelter);
    saveStore();
    return { lastID: id, changes: 1 };
  }

  // 6. UPDATE SHELTERS
  if (cleanSql.startsWith('update shelters')) {
    const id = parseInt(params[params.length - 1]);
    const s = store.shelters.find((item) => item.id === id);
    if (s) {
      const [name, location_id, address, capacity, occupied_capacity, contact_number, status, facilities] = params;
      s.name = name;
      s.location_id = parseInt(location_id);
      s.address = address;
      s.capacity = parseInt(capacity);
      s.occupied_capacity = parseInt(occupied_capacity);
      s.contact_number = contact_number;
      s.status = status;
      s.facilities = facilities;
      saveStore();
    }
    return { changes: 1 };
  }

  // 7. INSERT RESOURCES
  if (cleanSql.startsWith('insert into resources')) {
    const id = store.counters.resources++;
    const [name, category, quantity, unit, location_id, status] = params;
    const res = {
      id,
      name,
      category,
      quantity: parseInt(quantity),
      unit,
      location_id: parseInt(location_id),
      status,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    store.resources.push(res);
    saveStore();
    return { lastID: id, changes: 1 };
  }

  // 8. UPDATE RESOURCES
  if (cleanSql.startsWith('update resources')) {
    if (cleanSql.includes('set quantity = ?, status = ? where id = ?')) {
      const [qty, status, id] = params;
      const r = store.resources.find((item) => item.id === parseInt(id));
      if (r) {
        r.quantity = parseInt(qty);
        r.status = status;
        r.last_updated = new Date().toISOString();
        saveStore();
      }
      return { changes: 1 };
    }
    const id = parseInt(params[params.length - 1]);
    const r = store.resources.find((item) => item.id === id);
    if (r) {
      const [name, category, quantity, unit, location_id, status] = params;
      r.name = name;
      r.category = category;
      r.quantity = parseInt(quantity);
      r.unit = unit;
      r.location_id = parseInt(location_id);
      r.status = status;
      r.last_updated = new Date().toISOString();
      saveStore();
    }
    return { changes: 1 };
  }

  // 9. INSERT RESCUE OPERATIONS
  if (cleanSql.startsWith('insert into rescue_operations')) {
    const id = store.counters.rescue_operations++;
    const [operation_code, name, disaster_id, location_id, rescue_team, start_time, resources_used, status, progress] = params;
    const ro = {
      id,
      operation_code,
      name,
      disaster_id: parseInt(disaster_id),
      location_id: parseInt(location_id),
      rescue_team,
      start_time,
      people_rescued: 0,
      resources_used,
      status,
      progress: parseInt(progress),
      created_at: new Date().toISOString(),
    };
    store.rescue_operations.push(ro);
    saveStore();
    return { lastID: id, changes: 1 };
  }

  // 10. UPDATE RESCUE OPERATIONS
  if (cleanSql.startsWith('update rescue_operations')) {
    const id = parseInt(params[params.length - 1]);
    const ro = store.rescue_operations.find((item) => item.id === id);
    if (ro) {
      const [name, rescue_team, people_rescued, resources_used, status, progress] = params;
      ro.name = name;
      ro.rescue_team = rescue_team;
      ro.people_rescued = parseInt(people_rescued);
      ro.resources_used = resources_used;
      ro.status = status;
      ro.progress = parseInt(progress);
      saveStore();
    }
    return { changes: 1 };
  }

  // 11. INSERT VICTIMS
  if (cleanSql.startsWith('insert into victims')) {
    const id = store.counters.victims++;
    const [victim_code, name, age, gender, location_id, disaster_id, contact_number, medical_needs, rescue_status, priority, reporter_user_id] = params;
    const v = {
      id,
      victim_code,
      name,
      age: parseInt(age),
      gender,
      location_id: parseInt(location_id),
      disaster_id: parseInt(disaster_id),
      contact_number,
      medical_needs,
      rescue_status,
      priority,
      reporter_user_id: parseInt(reporter_user_id),
      created_at: new Date().toISOString(),
    };
    store.victims.push(v);
    saveStore();
    return { lastID: id, changes: 1 };
  }

  // 12. UPDATE VICTIMS
  if (cleanSql.startsWith('update victims')) {
    const id = parseInt(params[params.length - 1]);
    const v = store.victims.find((item) => item.id === id);
    if (v) {
      const [name, age, gender, rescue_status, priority, medical_needs, contact_number] = params;
      v.name = name;
      v.age = parseInt(age);
      v.gender = gender;
      v.rescue_status = rescue_status;
      v.priority = priority;
      v.medical_needs = medical_needs;
      v.contact_number = contact_number;
      saveStore();
    }
    return { changes: 1 };
  }

  // 13. INSERT RELIEF DISTRIBUTIONS
  if (cleanSql.startsWith('insert into relief_distributions')) {
    const id = store.counters.relief_distributions++;
    const [distribution_code, disaster_id, location_id, resource_id, quantity, recipient_info, distributed_by_user_id] = params;
    const rd = {
      id,
      distribution_code,
      disaster_id: parseInt(disaster_id),
      location_id: parseInt(location_id),
      resource_id: parseInt(resource_id),
      quantity: parseInt(quantity),
      recipient_info,
      distributed_by_user_id: parseInt(distributed_by_user_id),
      distribution_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    store.relief_distributions.push(rd);
    saveStore();
    return { lastID: id, changes: 1 };
  }

  // 14. INSERT NOTIFICATIONS
  if (cleanSql.startsWith('insert into notifications')) {
    const id = store.counters.notifications++;
    const [title, message, type, target_role, disaster_id] = params;
    const n = {
      id,
      title,
      message,
      type,
      target_role,
      is_read: false,
      disaster_id: disaster_id ? parseInt(disaster_id) : null,
      created_at: new Date().toISOString(),
    };
    store.notifications.push(n);
    saveStore();
    return { lastID: id, changes: 1 };
  }

  // 15. UPDATE NOTIFICATIONS
  if (cleanSql.startsWith('update notifications set is_read = 1')) {
    const id = parseInt(params[0]);
    const n = store.notifications.find((item) => item.id === id);
    if (n) n.is_read = true;
    saveStore();
    return { changes: 1 };
  }

  return { lastID: 1, changes: 1 };
}

async function initializeDatabase() {
  console.log('Initializing Database Engine...');
  loadStore();

  if (store.users.length === 0) {
    console.log('Populating initial DBMS Seed Data...');
    await seedDatabase();
  }
}

async function seedDatabase() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  const responsePassHash = await bcrypt.hash('response123', 10);
  const publicPassHash = await bcrypt.hash('public123', 10);

  // LOCATIONS
  store.locations = [
    { id: 1, city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', latitude: 13.0827, longitude: 80.2707, area_code: '600001' },
    { id: 2, city: 'Wayanad', state: 'Kerala', district: 'Wayanad', latitude: 11.6854, longitude: 76.1320, area_code: '673121' },
    { id: 3, city: 'Kolkata', state: 'West Bengal', district: 'Kolkata', latitude: 22.5726, longitude: 88.3639, area_code: '700001' },
    { id: 4, city: 'Shimla', state: 'Himachal Pradesh', district: 'Shimla', latitude: 31.1048, longitude: 77.1734, area_code: '171001' },
    { id: 5, city: 'Bhuj', state: 'Gujarat', district: 'Kutch', latitude: 23.2420, longitude: 69.6669, area_code: '370001' },
    { id: 6, city: 'Visakhapatnam', state: 'Andhra Pradesh', district: 'Visakhapatnam', latitude: 17.6868, longitude: 83.2185, area_code: '530001' },
  ];
  store.counters.locations = 7;

  // USERS
  store.users = [
    { id: 1, name: 'Dr. K. Swaminathan', email: 'admin@disaster.gov.in', password_hash: passwordHash, role: 'ADMIN', phone: '+91 9876543210', department: 'National Disaster Management Authority' },
    { id: 2, name: 'Captain Rajesh Kumar', email: 'captain.rajesh@ndrf.gov.in', password_hash: responsePassHash, role: 'RESPONSE_TEAM', phone: '+91 9876543211', department: 'NDRF 4th Battalion Command' },
    { id: 3, name: 'Priya Sundaram', email: 'citizen.priya@gmail.com', password_hash: publicPassHash, role: 'PUBLIC', phone: '+91 9876543212', department: 'General Public Citizen' },
  ];
  store.counters.users = 4;

  // DISASTERS
  store.disasters = [
    { id: 1, name: 'Chennai Metro Heavy Monsoon Inundation', type: 'FLOOD', location_id: 1, severity: 'CRITICAL', status: 'ACTIVE', affected_population: 450000, description: 'Unprecedented rainfall causing acute urban flooding across Velachery, Tambaram, and Adyar basin. Rapid water rescue and shelter management underway.', start_date: '2026-08-20' },
    { id: 2, name: 'Wayanad Western Ghats Slope Instability', type: 'LANDSLIDE', location_id: 2, severity: 'HIGH', status: 'ACTIVE', affected_population: 28000, description: 'Torrential downpours triggering major mudslides along Meppadi hill roads. Debris clearing and survivor rescue active.', start_date: '2026-08-22' },
    { id: 3, name: 'Super Cyclone Amphan Coastal Impact', type: 'CYCLONE', location_id: 3, severity: 'CRITICAL', status: 'RESOLVED', affected_population: 1200000, description: 'Severe cyclonic storm landfall near Sundarbans resulting in power grid outage and coastal embankment breaches.', start_date: '2026-08-10' },
    { id: 4, name: 'Pine Forest Wildfire & Smoke Surge', type: 'FIRE', location_id: 4, severity: 'MEDIUM', status: 'WARNING', affected_population: 1200, description: 'Dry forest fire spreading towards outer Shimla residential sectors. Forestry firefighting units deployed.', start_date: '2026-08-24' },
    { id: 5, name: 'Kutch Rift Zone Seismic Tremors', type: 'EARTHQUAKE', location_id: 5, severity: 'LOW', status: 'WARNING', affected_population: 45000, description: 'Series of minor tremors (4.2 Richter scale) recorded. Structural safety audits in progress.', start_date: '2026-08-25' },
    { id: 6, name: 'Vizag Coastal Heatwave & Chemical Alert', type: 'HEATWAVE', location_id: 6, severity: 'HIGH', status: 'ACTIVE', affected_population: 85000, description: 'Extreme temperature surge (44°C) combined with localized ammonia tank thermal expansion alert near harbor.', start_date: '2026-08-23' },
  ];
  store.counters.disasters = 7;

  // SHELTERS
  store.shelters = [
    { id: 1, name: 'St. Bede Emergency Relief Centre', location_id: 1, address: 'San Thome High Road, Mylapore, Chennai', capacity: 800, occupied_capacity: 520, contact_number: '+91 44 2498 1234', status: 'AVAILABLE', facilities: 'Medical Clinic, Community Kitchen, Clean Water, Generators, Childcare' },
    { id: 2, name: 'Salt Lake Stadium Refuge Camp', location_id: 3, address: 'Gate 3, Salt Lake Sector III, Kolkata', capacity: 1500, occupied_capacity: 1480, contact_number: '+91 33 2335 9000', status: 'LIMITED', facilities: 'Full Hospital Wing, Food Distribution, Power Backup, Security Guards' },
    { id: 3, name: 'Meppadi Government School Relief Shelter', location_id: 2, address: 'Main Road, Meppadi, Wayanad', capacity: 400, occupied_capacity: 180, contact_number: '+91 4936 280111', status: 'AVAILABLE', facilities: 'Clean Water, Cots, Blanket Depots, First Aid Desk' },
    { id: 4, name: 'Shimla Municipal Indoor Sports Complex Shelter', location_id: 4, address: 'Mall Road, Shimla', capacity: 300, occupied_capacity: 300, contact_number: '+91 177 2658100', status: 'FULL', facilities: 'Heated Hall, Meals, Oxygen Support' },
    { id: 5, name: 'Vizag Port Community Hall Shelter', location_id: 6, address: 'Beach Road, Visakhapatnam', capacity: 1000, occupied_capacity: 410, contact_number: '+91 891 2564321', status: 'AVAILABLE', facilities: 'Air Conditioned, Doctor on Call, Sanitation Facilities' },
  ];
  store.counters.shelters = 6;

  // RESOURCES
  store.resources = [
    { id: 1, name: 'Ration Meal Kits (7-Day Supply)', category: 'FOOD', quantity: 4500, unit: 'Kits', location_id: 1, status: 'AVAILABLE', last_updated: new Date().toISOString() },
    { id: 2, name: 'Purified Drinking Water Cans (20L)', category: 'WATER', quantity: 12000, unit: 'Cans', location_id: 1, status: 'AVAILABLE', last_updated: new Date().toISOString() },
    { id: 3, name: 'Trauma & Trauma Care Medical Kits', category: 'MEDICAL', quantity: 85, unit: 'Units', location_id: 1, status: 'LIMITED', last_updated: new Date().toISOString() },
    { id: 4, name: 'Thermal Insulated Woolen Blankets', category: 'CLOTHES', quantity: 3200, unit: 'Units', location_id: 2, status: 'AVAILABLE', last_updated: new Date().toISOString() },
    { id: 5, name: 'High-Output Submersible Water Pumps', category: 'EQUIPMENT', quantity: 45, unit: 'Machines', location_id: 1, status: 'AVAILABLE', last_updated: new Date().toISOString() },
    { id: 6, name: 'Inflatable Heavy Duty Motor Boats', category: 'EQUIPMENT', quantity: 30, unit: 'Boats', location_id: 1, status: 'LIMITED', last_updated: new Date().toISOString() },
    { id: 7, name: 'Broad-Spectrum Antibiotics & IV Fluids', category: 'MEDICINE', quantity: 1500, unit: 'Doses', location_id: 3, status: 'AVAILABLE', last_updated: new Date().toISOString() },
    { id: 8, name: 'All-Terrain Emergency Rescue Vehicles', category: 'VEHICLE', quantity: 18, unit: 'Trucks', location_id: 2, status: 'AVAILABLE', last_updated: new Date().toISOString() },
  ];
  store.counters.resources = 9;

  // RESCUE OPERATIONS
  store.rescue_operations = [
    { id: 1, operation_code: 'RES-2026-001', name: 'Operation Jal Suraksha (Velachery Basin)', disaster_id: 1, location_id: 1, rescue_team: 'NDRF 4th Battalion & Indian Navy Divers', start_time: '2026-08-21 06:00:00', people_rescued: 340, resources_used: '12 Motorboats, 50 Life Jackets, 2 Helicopters', status: 'ONGOING', progress: 75 },
    { id: 2, operation_code: 'RES-2026-002', name: 'Operation Malabar Slope Clearance', disaster_id: 2, location_id: 2, rescue_team: 'Kerala State Fire Force & Army Engineers', start_time: '2026-08-22 08:30:00', people_rescued: 120, resources_used: '4 Excavators, 20 Sniffer Dog Teams', status: 'ONGOING', progress: 45 },
    { id: 3, operation_code: 'RES-2026-003', name: 'Operation Forest Shield (Pine Belt)', disaster_id: 4, location_id: 4, rescue_team: 'Forestry Emergency Wing & IAF Helicopters', start_time: '2026-08-24 11:00:00', people_rescued: 85, resources_used: '3 Water Dropper Choppers, 15 Fire Tenders', status: 'ONGOING', progress: 85 },
    { id: 4, operation_code: 'RES-2026-004', name: 'Operation Cyclone Evac (Kolkata Delta)', disaster_id: 3, location_id: 3, rescue_team: 'West Bengal SDRF & Civil Defence', start_time: '2026-08-11 04:00:00', people_rescued: 1450, resources_used: '45 Buses, 200 Emergency Workers', status: 'COMPLETED', progress: 100 },
  ];
  store.counters.rescue_operations = 5;

  // VICTIMS
  store.victims = [
    { id: 1, victim_code: 'VCT-8901', name: 'Arunkumar M', age: 34, gender: 'Male', location_id: 1, disaster_id: 1, contact_number: '+91 94441 22334', medical_needs: 'Fractured right tibia, high fever, requires IV antibiotics', rescue_status: 'HOSPITALIZED', priority: 'HIGH', reporter_user_id: 2 },
    { id: 2, victim_code: 'VCT-8902', name: 'Lakshmi Sundaram', age: 68, gender: 'Female', location_id: 1, disaster_id: 1, contact_number: '+91 98400 11223', medical_needs: 'Type 1 Diabetes - Urgent Insulin and cardiac monitor needed', rescue_status: 'RESCUED', priority: 'CRITICAL', reporter_user_id: 2 },
    { id: 3, victim_code: 'VCT-8903', name: 'Rahul Verma', age: 12, gender: 'Male', location_id: 2, disaster_id: 2, contact_number: '+91 97455 33445', medical_needs: 'Severe dehydration and head abrasions from landslide debris', rescue_status: 'LOCATED', priority: 'HIGH', reporter_user_id: 2 },
    { id: 4, victim_code: 'VCT-8904', name: 'Ananya Sen', age: 29, gender: 'Female', location_id: 3, disaster_id: 3, contact_number: '+91 98310 44556', medical_needs: 'Minor contusions, stable mental condition', rescue_status: 'RESCUED', priority: 'LOW', reporter_user_id: 1 },
    { id: 5, victim_code: 'VCT-8905', name: 'Rajesh Goud', age: 45, gender: 'Male', location_id: 6, disaster_id: 6, contact_number: '+91 98490 66778', medical_needs: 'Inhaled chemical fumes, missing since heatwave surge', rescue_status: 'MISSING', priority: 'CRITICAL', reporter_user_id: 3 },
  ];
  store.counters.victims = 6;

  // RELIEF DISTRIBUTIONS
  store.relief_distributions = [
    { id: 1, distribution_code: 'DIS-701', disaster_id: 1, location_id: 1, resource_id: 1, quantity: 1200, recipient_info: '450 Flood Affected Families in Velachery Ward 150', distributed_by_user_id: 1, distribution_date: '2026-08-21 14:00:00' },
    { id: 2, distribution_code: 'DIS-702', disaster_id: 1, location_id: 1, resource_id: 2, quantity: 3500, recipient_info: 'Emergency Water Distribution across San Thome Relief Camp', distributed_by_user_id: 2, distribution_date: '2026-08-22 10:00:00' },
    { id: 3, distribution_code: 'DIS-703', disaster_id: 2, location_id: 2, resource_id: 4, quantity: 250, recipient_info: 'Landslide Evacuees at Meppadi Community School', distributed_by_user_id: 2, distribution_date: '2026-08-23 16:30:00' },
    { id: 4, distribution_code: 'DIS-704', disaster_id: 3, location_id: 3, resource_id: 7, quantity: 500, recipient_info: 'Kolkata Delta Field Hospitals & Health Camps', distributed_by_user_id: 1, distribution_date: '2026-08-12 11:00:00' },
  ];
  store.counters.relief_distributions = 5;

  // EMERGENCY CONTACTS
  store.emergency_contacts = [
    { id: 1, category: 'POLICE', service_name: 'State Police Central Command & Control', phone_number: '112', alternate_phone: '100', location_id: 1, address: 'Police Headquarters, Mylapore, Chennai', is_24x7: 1 },
    { id: 2, category: 'FIRE', service_name: 'State Fire & Rescue Emergency Services', phone_number: '101', alternate_phone: '+91 44 2855 4011', location_id: 1, address: 'Fire Station HQ, Egmore, Chennai', is_24x7: 1 },
    { id: 3, category: 'AMBULANCE', service_name: 'National Emergency Ambulance Service (EMRI)', phone_number: '108', alternate_phone: '102', location_id: 1, address: 'State Control Room, Guindy, Chennai', is_24x7: 1 },
    { id: 4, category: 'DISASTER_RESPONSE', service_name: 'National Disaster Response Force (NDRF) Hotline', phone_number: '1078', alternate_phone: '+91 11 2436 3260', location_id: 1, address: 'NDRF HQ, New Delhi & Arakkonam Base', is_24x7: 1 },
    { id: 5, category: 'HOSPITALS', service_name: 'Rajiv Gandhi Government General Hospital', phone_number: '044-25305000', alternate_phone: '044-25305111', location_id: 1, address: 'EVR Periyar Salai, Park Town, Chennai', is_24x7: 1 },
    { id: 6, category: 'LOCAL_SERVICES', service_name: 'Greater Chennai Corporation Flood Control Room', phone_number: '1913', alternate_phone: '+91 44 2561 9200', location_id: 1, address: 'Ripon Building, Chennai', is_24x7: 1 },
    { id: 7, category: 'DISASTER_RESPONSE', service_name: 'Kerala State Disaster Management Authority', phone_number: '1070', alternate_phone: '+91 471 2331645', location_id: 2, address: 'Vikas Bhavan, Thiruvananthapuram', is_24x7: 1 },
    { id: 8, category: 'FIRE', service_name: 'Shimla Mountain Forest Fire Control Desk', phone_number: '1090', alternate_phone: '+91 177 2621811', location_id: 4, address: 'Forest Complex, Talland, Shimla', is_24x7: 1 },
  ];
  store.counters.emergency_contacts = 9;

  // SAFETY GUIDELINES
  store.safety_guidelines = [
    {
      id: 1,
      disaster_type: 'FLOOD',
      title: 'Monsoon & Flash Flood Safety Guide',
      summary: 'Critical survival protocol during rapid urban inundation and river overspills.',
      before_instructions: '• Keep emergency kit ready with dry food, torch, battery radio, clean water, and documents.\n• Elevate electrical appliances and clear drainage paths.\n• Identify nearest government shelter location.',
      during_instructions: '• Do not walk or drive through moving flood water.\n• Disconnect main power grid and gas supplies.\n• Move to upper floors or rooftop if trapped; call 112 / 1078.',
      after_instructions: '• Do not drink tap water without boiling for 10 minutes.\n• Avoid fallen powerlines and flooded electrical boxes.\n• Spray disinfectant to prevent waterborne disease outbreak.',
    },
    {
      id: 2,
      disaster_type: 'EARTHQUAKE',
      title: 'Seismic Shaking & Tremor Survival Protocol',
      summary: 'Essential actions to prevent structural injury during sudden ground motion.',
      before_instructions: '• Secure heavy furniture, water heaters, and wall hangings to studs.\n• Prepare a go-bag with first-aid, whistle, flashlight, and sturdy shoes.\n• Conduct Drop, Cover, and Hold On family drills.',
      during_instructions: '• DROP to hands and knees.\n• COVER your head and neck under a sturdy desk or table.\n• HOLD ON until shaking stops. If outdoors, move away from buildings, wires, and streetlights.',
      after_instructions: '• Expect aftershocks; stay out of damaged buildings.\n• Inspect utility lines for gas leaks or electrical fraying.\n• Use text messages instead of phone calls to keep emergency networks clear.',
    },
    {
      id: 3,
      disaster_type: 'CYCLONE',
      title: 'Tropical Storm & High Wind Defense Plan',
      summary: 'Precautionary measures against destructive storm surges and gale force winds.',
      before_instructions: '• Board up glass windows and trim overhanging tree branches.\n• Store 3 days of non-perishable food and 4 liters of water per person per day.\n• Charge all cellphones, powerbanks, and emergency lights.',
      during_instructions: '• Remain indoors away from windows, skylights, and glass doors.\n• Stay in a windowless interior room or hallway on the lowest floor.\n• Do not step outside during the "eye" of the cyclone; winds will return abruptly from opposite direction.',
      after_instructions: '• Wait for official government clearance before returning outdoors.\n• Avoid loose hanging wires and flooded roads.\n• Report downed utility poles to emergency services immediately.',
    },
    {
      id: 4,
      disaster_type: 'FIRE',
      title: 'Structure & Wildfire Evacuation Protocol',
      summary: 'Immediate response actions during urban structure fires or spreading wildfires.',
      before_instructions: '• Install smoke alarms on every level of home; test monthly.\n• Plan 2 escape routes out of every room.\n• Keep fire extinguishers accessible near kitchen and exits.',
      during_instructions: '• Crawl low under smoke to stay below toxic fumes.\n• Feel door handles with back of hand before opening; if hot, use alternate exit.\n• If clothes catch fire: STOP, DROP, and ROLL.',
      after_instructions: '• Once outside, NEVER re-enter a burning building for any reason.\n• Call 101 or 112 immediately.\n• Seek medical attention for smoke inhalation or burns.',
    },
    {
      id: 5,
      disaster_type: 'LANDSLIDE',
      title: 'Slope Failure & Debris Flow Safety Protocol',
      summary: 'Precautionary steps for hilly and mountainous regions during heavy rains.',
      before_instructions: '• Monitor local weather warnings and rainfall thresholds in landslide-prone hills.\n• Watch for new cracks in plaster, foundations, or retaining walls.\n• Plant deep-rooted vegetation on slopes to bind soil.',
      during_instructions: '• If sudden rumbling or cracking trees are heard, evacuate downhill or laterally off the slope immediately.\n• Curl into a tight ball and protect your head if escape is impossible.',
      after_instructions: '• Stay away from the slide area; secondary slides may follow.\n• Report broken utility lines and damaged bridges.\n• Check for trapped or injured persons without entering unstable terrain.',
    },
    {
      id: 6,
      disaster_type: 'TSUNAMI',
      title: 'Coastal Surge & Seismic Wave Evacuation Plan',
      summary: 'Life-saving directives when strong coastal shaking or unusual ocean retreat occurs.',
      before_instructions: '• Know your local coastal evacuation routes and tsunami hazard zones.\n• Practice moving to high ground (at least 30 meters above sea level or 2 km inland).',
      during_instructions: '• If ocean water recedes rapidly exposing sea floor, run to high ground IMMEDIATELY; do not wait for official sirens.\n• Abandon personal belongings; speed is critical.',
      after_instructions: '• Stay on high ground for at least 3-4 hours after initial wave; tsunamis consist of multiple waves over several hours.\n• Listen to official emergency broadcasts before returning to shore.',
    },
    {
      id: 7,
      disaster_type: 'HEATWAVE',
      title: 'Extreme Thermal Surge & Sunstroke Prevention',
      summary: 'Health preservation guidelines during extreme summer heatwaves and humidity.',
      before_instructions: '• Cover windows exposed to direct sunlight with drapes or thermal blinds.\n• Keep hydration supplies, ORS packets, and cool towels at home.',
      during_instructions: '• Drink water frequently even if not thirsty; avoid alcohol and caffeine.\n• Limit outdoor activity between 11:00 AM and 4:00 PM.\n• Wear lightweight, light-colored, loose cotton clothing.',
      after_instructions: '• Treat heatstroke signs (dizziness, nausea, absence of sweat) as medical emergency.\n• Move affected person to shade, apply wet cloths, and call 108.',
    },
  ];
  store.counters.safety_guidelines = 8;

  // NOTIFICATIONS
  store.notifications = [
    { id: 1, title: 'CRITICAL ALERT: Chennai Floods Inundation', message: 'Red alert issued for Velachery and Adyar basin. NDRF rescue operations in progress. Move to nearest shelter.', type: 'ALERT', target_role: 'ALL', is_read: false, disaster_id: 1, created_at: new Date().toISOString() },
    { id: 2, title: 'RESOURCE WARNING: Low Medical Kit Inventory', message: 'Medical Kits at Chennai Main Depot dropped to LIMITED (85 units remaining). Replenishment required.', type: 'RESOURCE', target_role: 'RESPONSE_TEAM', is_read: false, disaster_id: 1, created_at: new Date().toISOString() },
    { id: 3, title: 'SHELTER ALERT: Salt Lake Stadium 98% Full', message: 'Refuge Camp at Salt Lake, Kolkata has reached near full capacity (1480/1500 occupied). Redirecting evacuees.', type: 'SHELTER', target_role: 'ALL', is_read: false, disaster_id: 3, created_at: new Date().toISOString() },
    { id: 4, title: 'RESCUE UPDATE: Operation Jal Suraksha 75% Complete', message: '340 citizens safely evacuated from Velachery flood zones by NDRF & Navy teams.', type: 'RESCUE', target_role: 'ALL', is_read: false, disaster_id: 1, created_at: new Date().toISOString() },
  ];
  store.counters.notifications = 5;

  saveStore();
  console.log('DBMS Seed Data initialized successfully!');
}

module.exports = {
  queryAll,
  queryGet,
  queryRun,
  initializeDatabase,
};
