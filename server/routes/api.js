const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { queryAll, queryGet, queryRun } = require('../db/database');
const { authenticateToken, requireRole, JWT_SECRET } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authenticateToken);

// ==========================================
// 1. HEALTH CHECK & SYSTEM INFO
// ==========================================
router.get('/health', async (req, res) => {
  try {
    const userCount = await queryGet('SELECT COUNT(*) as count FROM users');
    const disasterCount = await queryGet('SELECT COUNT(*) as count FROM disasters');
    res.json({
      status: 'ONLINE',
      system: 'Disaster Management & Emergency Response Platform API',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        users: userCount.count,
        disasters: disasterCount.count,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. AUTHENTICATION & USER ROLES
// ==========================================
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await queryGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'PUBLIC', phone, department } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = await queryGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await queryRun(
      'INSERT INTO users (name, email, password_hash, role, phone, department) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, role.toUpperCase(), phone || '', department || 'General Public']
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.lastID,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/auth/me', (req, res) => {
  res.json({ user: req.user });
});

// ==========================================
// 3. LOCATIONS MODULE
// ==========================================
router.get('/locations', async (req, res) => {
  try {
    const locations = await queryAll('SELECT * FROM locations ORDER BY city ASC');
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. DISASTERS MODULE
// ==========================================
router.get('/disasters', async (req, res) => {
  try {
    const { type, severity, status, search } = req.query;
    let sql = `
      SELECT d.*, l.city, l.state, l.district, l.latitude, l.longitude
      FROM disasters d
      JOIN locations l ON d.location_id = l.id
      WHERE 1=1
    `;
    const params = [];

    if (type && type !== 'ALL') {
      sql += ' AND d.type = ?';
      params.push(type);
    }
    if (severity && severity !== 'ALL') {
      sql += ' AND d.severity = ?';
      params.push(severity);
    }
    if (status && status !== 'ALL') {
      sql += ' AND d.status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (d.name LIKE ? OR d.description LIKE ? OR l.city LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY CASE d.severity WHEN "CRITICAL" THEN 1 WHEN "HIGH" THEN 2 WHEN "MEDIUM" THEN 3 ELSE 4 END, d.start_date DESC';

    const disasters = await queryAll(sql, params);
    res.json(disasters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/disasters/:id', async (req, res) => {
  try {
    const disaster = await queryGet(
      `SELECT d.*, l.city, l.state, l.district, l.latitude, l.longitude
       FROM disasters d
       JOIN locations l ON d.location_id = l.id
       WHERE d.id = ?`,
      [req.params.id]
    );

    if (!disaster) return res.status(404).json({ error: 'Disaster not found' });

    // Fetch related shelters, resources, rescue ops, and emergency contacts
    const shelters = await queryAll('SELECT * FROM shelters WHERE location_id = ?', [disaster.location_id]);
    const resources = await queryAll('SELECT * FROM resources WHERE location_id = ?', [disaster.location_id]);
    const rescueOps = await queryAll('SELECT * FROM rescue_operations WHERE disaster_id = ?', [disaster.id]);
    const contacts = await queryAll('SELECT * FROM emergency_contacts WHERE location_id = ?', [disaster.location_id]);
    const guideline = await queryGet('SELECT * FROM safety_guidelines WHERE disaster_type = ?', [disaster.type]);

    res.json({
      ...disaster,
      shelters,
      resources,
      rescue_operations: rescueOps,
      emergency_contacts: contacts,
      safety_guideline: guideline,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/disasters', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { name, type, location_id, severity, status = 'ACTIVE', affected_population = 0, description, start_date } = req.body;
    if (!name || !type || !location_id || !severity || !description || !start_date) {
      return res.status(400).json({ error: 'Missing required disaster fields.' });
    }

    const result = await queryRun(
      `INSERT INTO disasters (name, type, location_id, severity, status, affected_population, description, start_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, type, location_id, severity, status, affected_population, description, start_date]
    );

    // Create system notification
    await queryRun(
      `INSERT INTO notifications (title, message, type, target_role, disaster_id)
       VALUES (?, ?, ?, 'ALL', ?)`,
      [`NEW DISASTER: ${name}`, `New ${severity} severity ${type} disaster reported. Immediate response initiated.`, 'ALERT', result.lastID]
    );

    res.status(201).json({ message: 'Disaster created successfully', id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/disasters/:id', requireRole(['ADMIN', 'RESPONSE_TEAM']), async (req, res) => {
  try {
    const { name, type, location_id, severity, status, affected_population, description, start_date, end_date } = req.body;
    await queryRun(
      `UPDATE disasters
       SET name = ?, type = ?, location_id = ?, severity = ?, status = ?, affected_population = ?, description = ?, start_date = ?, end_date = ?
       WHERE id = ?`,
      [name, type, location_id, severity, status, affected_population, description, start_date, end_date, req.params.id]
    );
    res.json({ message: 'Disaster updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/disasters/:id', requireRole(['ADMIN']), async (req, res) => {
  try {
    await queryRun('DELETE FROM disasters WHERE id = ?', [req.params.id]);
    res.json({ message: 'Disaster deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. SHELTER FINDER MODULE
// ==========================================
router.get('/shelters', async (req, res) => {
  try {
    const { status, search, location_id } = req.query;
    let sql = `
      SELECT s.*, l.city, l.state, l.district,
             (s.capacity - s.occupied_capacity) as available_capacity
      FROM shelters s
      JOIN locations l ON s.location_id = l.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      sql += ' AND s.status = ?';
      params.push(status);
    }
    if (location_id && location_id !== 'ALL') {
      sql += ' AND s.location_id = ?';
      params.push(location_id);
    }
    if (search) {
      sql += ' AND (s.name LIKE ? OR s.address LIKE ? OR l.city LIKE ? OR s.facilities LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY available_capacity DESC';

    const shelters = await queryAll(sql, params);
    res.json(shelters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/shelters', requireRole(['ADMIN', 'RESPONSE_TEAM']), async (req, res) => {
  try {
    const { name, location_id, address, capacity, occupied_capacity = 0, contact_number, facilities } = req.body;
    if (!name || !location_id || !address || !capacity || !contact_number) {
      return res.status(400).json({ error: 'Missing required shelter fields.' });
    }

    let status = 'AVAILABLE';
    const available = capacity - occupied_capacity;
    if (available <= 0) status = 'FULL';
    else if (available <= capacity * 0.2) status = 'LIMITED';

    const result = await queryRun(
      `INSERT INTO shelters (name, location_id, address, capacity, occupied_capacity, contact_number, status, facilities)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, location_id, address, capacity, occupied_capacity, contact_number, status, facilities || '']
    );

    res.status(201).json({ message: 'Shelter created successfully', id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/shelters/:id', requireRole(['ADMIN', 'RESPONSE_TEAM']), async (req, res) => {
  try {
    const { name, location_id, address, capacity, occupied_capacity, contact_number, facilities } = req.body;
    let status = 'AVAILABLE';
    const available = capacity - occupied_capacity;
    if (available <= 0) status = 'FULL';
    else if (available <= capacity * 0.2) status = 'LIMITED';

    await queryRun(
      `UPDATE shelters
       SET name = ?, location_id = ?, address = ?, capacity = ?, occupied_capacity = ?, contact_number = ?, status = ?, facilities = ?
       WHERE id = ?`,
      [name, location_id, address, capacity, occupied_capacity, contact_number, status, facilities, req.params.id]
    );

    res.json({ message: 'Shelter updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. RESOURCE MANAGEMENT MODULE
// ==========================================
router.get('/resources', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let sql = `
      SELECT r.*, l.city, l.state
      FROM resources r
      JOIN locations l ON r.location_id = l.id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'ALL') {
      sql += ' AND r.category = ?';
      params.push(category);
    }
    if (status && status !== 'ALL') {
      sql += ' AND r.status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (r.name LIKE ? OR l.city LIKE ? OR r.category LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY r.category ASC, r.name ASC';

    const resources = await queryAll(sql, params);
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/resources', requireRole(['ADMIN', 'RESPONSE_TEAM']), async (req, res) => {
  try {
    const { name, category, quantity, unit, location_id } = req.body;
    if (!name || !category || quantity === undefined || !unit || !location_id) {
      return res.status(400).json({ error: 'Missing required resource fields.' });
    }

    let status = 'AVAILABLE';
    if (quantity <= 0) status = 'OUT_OF_STOCK';
    else if (quantity <= 100) status = 'LIMITED';

    const result = await queryRun(
      `INSERT INTO resources (name, category, quantity, unit, location_id, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, category, quantity, unit, location_id, status]
    );

    res.status(201).json({ message: 'Resource added successfully', id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/resources/:id', requireRole(['ADMIN', 'RESPONSE_TEAM']), async (req, res) => {
  try {
    const { name, category, quantity, unit, location_id } = req.body;
    let status = 'AVAILABLE';
    if (quantity <= 0) status = 'OUT_OF_STOCK';
    else if (quantity <= 100) status = 'LIMITED';

    await queryRun(
      `UPDATE resources
       SET name = ?, category = ?, quantity = ?, unit = ?, location_id = ?, status = ?, last_updated = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, category, quantity, unit, location_id, status, req.params.id]
    );

    res.json({ message: 'Resource updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. RESCUE OPERATIONS MODULE
// ==========================================
router.get('/rescue-operations', async (req, res) => {
  try {
    const { status, search } = req.query;
    let sql = `
      SELECT ro.*, d.name as disaster_name, d.severity as disaster_severity, l.city, l.state
      FROM rescue_operations ro
      JOIN disasters d ON ro.disaster_id = d.id
      JOIN locations l ON ro.location_id = l.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      sql += ' AND ro.status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (ro.name LIKE ? OR ro.operation_code LIKE ? OR ro.rescue_team LIKE ? OR l.city LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY ro.start_time DESC';

    const operations = await queryAll(sql, params);
    res.json(operations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/rescue-operations', requireRole(['ADMIN', 'RESPONSE_TEAM']), async (req, res) => {
  try {
    const { name, disaster_id, location_id, rescue_team, start_time, resources_used, status = 'ONGOING', progress = 0 } = req.body;
    const opCode = `RES-2026-${Math.floor(100 + Math.random() * 900)}`;

    const result = await queryRun(
      `INSERT INTO rescue_operations (operation_code, name, disaster_id, location_id, rescue_team, start_time, resources_used, status, progress)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [opCode, name, disaster_id, location_id, rescue_team, start_time || new Date().toISOString(), resources_used || '', status, progress]
    );

    res.status(201).json({ message: 'Rescue operation launched', id: result.lastID, operation_code: opCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/rescue-operations/:id', requireRole(['ADMIN', 'RESPONSE_TEAM']), async (req, res) => {
  try {
    const { name, rescue_team, people_rescued, resources_used, status, progress } = req.body;
    await queryRun(
      `UPDATE rescue_operations
       SET name = ?, rescue_team = ?, people_rescued = ?, resources_used = ?, status = ?, progress = ?
       WHERE id = ?`,
      [name, rescue_team, people_rescued, resources_used, status, progress, req.params.id]
    );
    res.json({ message: 'Rescue operation updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. VICTIM MANAGEMENT MODULE
// ==========================================
router.get('/victims', async (req, res) => {
  try {
    const { rescue_status, priority, search } = req.query;
    let sql = `
      SELECT v.*, d.name as disaster_name, l.city, l.state
      FROM victims v
      JOIN disasters d ON v.disaster_id = d.id
      JOIN locations l ON v.location_id = l.id
      WHERE 1=1
    `;
    const params = [];

    if (rescue_status && rescue_status !== 'ALL') {
      sql += ' AND v.rescue_status = ?';
      params.push(rescue_status);
    }
    if (priority && priority !== 'ALL') {
      sql += ' AND v.priority = ?';
      params.push(priority);
    }
    if (search) {
      sql += ' AND (v.name LIKE ? OR v.victim_code LIKE ? OR v.medical_needs LIKE ? OR l.city LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY CASE v.priority WHEN "CRITICAL" THEN 1 WHEN "HIGH" THEN 2 WHEN "MEDIUM" THEN 3 ELSE 4 END, v.created_at DESC';

    const victims = await queryAll(sql, params);

    // Sanitize contact info for PUBLIC role if needed
    const userRole = (req.headers['x-user-role'] || req.user?.role || 'PUBLIC').toUpperCase();
    const sanitizedVictims = victims.map((v) => {
      if (userRole === 'PUBLIC') {
        return {
          ...v,
          contact_number: v.contact_number ? `${v.contact_number.slice(0, 6)}****` : 'Restricted',
        };
      }
      return v;
    });

    res.json(sanitizedVictims);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/victims', requireRole(['ADMIN', 'RESPONSE_TEAM', 'PUBLIC']), async (req, res) => {
  try {
    const { name, age, gender, location_id, disaster_id, contact_number, medical_needs, rescue_status = 'LOCATED', priority = 'MEDIUM' } = req.body;
    if (!name || !location_id || !disaster_id) {
      return res.status(400).json({ error: 'Name, location, and disaster are required.' });
    }

    const victimCode = `VCT-${Math.floor(8000 + Math.random() * 1000)}`;
    const result = await queryRun(
      `INSERT INTO victims (victim_code, name, age, gender, location_id, disaster_id, contact_number, medical_needs, rescue_status, priority, reporter_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [victimCode, name, age, gender, location_id, disaster_id, contact_number, medical_needs, rescue_status, priority, req.user?.id || 3]
    );

    res.status(201).json({ message: 'Victim record reported successfully', id: result.lastID, victim_code: victimCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/victims/:id', requireRole(['ADMIN', 'RESPONSE_TEAM']), async (req, res) => {
  try {
    const { name, age, gender, rescue_status, priority, medical_needs, contact_number } = req.body;
    await queryRun(
      `UPDATE victims
       SET name = ?, age = ?, gender = ?, rescue_status = ?, priority = ?, medical_needs = ?, contact_number = ?
       WHERE id = ?`,
      [name, age, gender, rescue_status, priority, medical_needs, contact_number, req.params.id]
    );
    res.json({ message: 'Victim status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. RELIEF DISTRIBUTION MODULE
// ==========================================
router.get('/relief-distributions', async (req, res) => {
  try {
    const distributions = await queryAll(
      `SELECT rd.*, d.name as disaster_name, l.city, r.name as resource_name, r.unit, r.category as resource_category, u.name as distributed_by_name
       FROM relief_distributions rd
       JOIN disasters d ON rd.disaster_id = d.id
       JOIN locations l ON rd.location_id = l.id
       JOIN resources r ON rd.resource_id = r.id
       LEFT JOIN users u ON rd.distributed_by_user_id = u.id
       ORDER BY rd.distribution_date DESC`
    );

    const stats = await queryGet(
      `SELECT
        COUNT(*) as total_distributions,
        SUM(quantity) as total_items_distributed
       FROM relief_distributions`
    );

    res.json({
      distributions,
      stats,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/relief-distributions', requireRole(['ADMIN', 'RESPONSE_TEAM']), async (req, res) => {
  try {
    const { disaster_id, location_id, resource_id, quantity, recipient_info } = req.body;
    if (!disaster_id || !location_id || !resource_id || !quantity || !recipient_info) {
      return res.status(400).json({ error: 'Missing required relief distribution fields.' });
    }

    const distCode = `DIS-${Math.floor(700 + Math.random() * 200)}`;

    // Deduct quantity from inventory resource
    const resource = await queryGet('SELECT quantity FROM resources WHERE id = ?', [resource_id]);
    if (resource) {
      const newQty = Math.max(0, resource.quantity - quantity);
      const newStatus = newQty === 0 ? 'OUT_OF_STOCK' : newQty <= 100 ? 'LIMITED' : 'AVAILABLE';
      await queryRun('UPDATE resources SET quantity = ?, status = ? WHERE id = ?', [newQty, newStatus, resource_id]);
    }

    const result = await queryRun(
      `INSERT INTO relief_distributions (distribution_code, disaster_id, location_id, resource_id, quantity, recipient_info, distributed_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [distCode, disaster_id, location_id, resource_id, quantity, recipient_info, req.user?.id || 1]
    );

    res.status(201).json({ message: 'Relief distribution logged', id: result.lastID, distribution_code: distCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. EMERGENCY CONTACTS MODULE
// ==========================================
router.get('/emergency-contacts', async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = `
      SELECT ec.*, l.city, l.state
      FROM emergency_contacts ec
      JOIN locations l ON ec.location_id = l.id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'ALL') {
      sql += ' AND ec.category = ?';
      params.push(category);
    }
    if (search) {
      sql += ' AND (ec.service_name LIKE ? OR ec.phone_number LIKE ? OR l.city LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY ec.category ASC, ec.service_name ASC';

    const contacts = await queryAll(sql, params);
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 11. SAFETY GUIDELINES MODULE
// ==========================================
router.get('/safety-guidelines', async (req, res) => {
  try {
    const { type } = req.query;
    let sql = 'SELECT * FROM safety_guidelines';
    const params = [];

    if (type && type !== 'ALL') {
      sql += ' WHERE disaster_type = ?';
      params.push(type);
    }

    sql += ' ORDER BY id ASC';

    const guidelines = await queryAll(sql, params);
    res.json(guidelines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 12. NOTIFICATIONS & ALERTS
// ==========================================
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await queryAll('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20');
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/notifications/:id/read', async (req, res) => {
  try {
    await queryRun('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 13. DASHBOARD STATISTICS & ANALYTICS
// ==========================================
router.get('/dashboard/stats', async (req, res) => {
  try {
    const activeDisasters = await queryGet('SELECT COUNT(*) as count FROM disasters WHERE status = "ACTIVE"');
    const totalAffected = await queryGet('SELECT SUM(affected_population) as sum FROM disasters WHERE status = "ACTIVE"');
    const activeShelters = await queryGet('SELECT COUNT(*) as count FROM shelters WHERE status != "FULL"');
    const totalCapacity = await queryGet('SELECT SUM(capacity) as cap, SUM(occupied_capacity) as occ FROM shelters');
    const ongoingRescues = await queryGet('SELECT COUNT(*) as count FROM rescue_operations WHERE status = "ONGOING"');
    const totalRescued = await queryGet('SELECT SUM(people_rescued) as sum FROM rescue_operations');
    const totalResources = await queryGet('SELECT COUNT(*) as count FROM resources WHERE status = "AVAILABLE"');
    const totalDistributions = await queryGet('SELECT COUNT(*) as count FROM relief_distributions');

    // Chart 1: Disaster Count by Severity
    const severityChart = await queryAll(
      `SELECT severity, COUNT(*) as count FROM disasters GROUP BY severity`
    );

    // Chart 2: Affected Population by City Location
    const populationByCity = await queryAll(
      `SELECT l.city, SUM(d.affected_population) as total_affected
       FROM disasters d
       JOIN locations l ON d.location_id = l.id
       GROUP BY l.city`
    );

    // Chart 3: Resource Quantities by Category
    const resourceCategories = await queryAll(
      `SELECT category, SUM(quantity) as total_quantity FROM resources GROUP BY category`
    );

    // Chart 4: Rescue Progress Overview
    const rescueProgress = await queryAll(
      `SELECT name, progress, people_rescued, status FROM rescue_operations ORDER BY progress DESC`
    );

    // Recent Live Activity Feed
    const recentActivities = await queryAll(
      `SELECT 'DISASTER' as item_type, name as title, severity as tag, start_date as activity_date FROM disasters
       UNION ALL
       SELECT 'RESCUE' as item_type, name as title, status as tag, start_time as activity_date FROM rescue_operations
       UNION ALL
       SELECT 'RELIEF' as item_type, distribution_code as title, recipient_info as tag, distribution_date as activity_date FROM relief_distributions
       ORDER BY activity_date DESC LIMIT 8`
    );

    res.json({
      kpis: {
        active_disasters: activeDisasters.count || 0,
        affected_people: totalAffected.sum || 0,
        active_shelters: activeShelters.count || 0,
        shelter_capacity: totalCapacity.cap || 0,
        shelter_occupied: totalCapacity.occ || 0,
        ongoing_rescues: ongoingRescues.count || 0,
        total_rescued: totalRescued.sum || 0,
        available_resources: totalResources.count || 0,
        total_relief_distributions: totalDistributions.count || 0,
      },
      charts: {
        severity: severityChart,
        population_by_city: populationByCity,
        resource_categories: resourceCategories,
        rescue_progress: rescueProgress,
      },
      recent_activities: recentActivities,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 14. GLOBAL SEARCH API
// ==========================================
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q ? req.query.q.trim() : '';
    if (!q) {
      return res.json({ query: '', results: { disasters: [], shelters: [], resources: [], rescue_operations: [], victims: [], contacts: [], guidelines: [] } });
    }

    const searchTerm = `%${q}%`;

    const disasters = await queryAll(
      `SELECT d.*, l.city, l.state FROM disasters d JOIN locations l ON d.location_id = l.id
       WHERE d.name LIKE ? OR d.description LIKE ? OR d.type LIKE ? OR l.city LIKE ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );

    const shelters = await queryAll(
      `SELECT s.*, l.city, l.state FROM shelters s JOIN locations l ON s.location_id = l.id
       WHERE s.name LIKE ? OR s.address LIKE ? OR s.facilities LIKE ? OR l.city LIKE ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );

    const resources = await queryAll(
      `SELECT r.*, l.city, l.state FROM resources r JOIN locations l ON r.location_id = l.id
       WHERE r.name LIKE ? OR r.category LIKE ? OR l.city LIKE ?`,
      [searchTerm, searchTerm, searchTerm]
    );

    const rescueOps = await queryAll(
      `SELECT ro.*, l.city, l.state FROM rescue_operations ro JOIN locations l ON ro.location_id = l.id
       WHERE ro.name LIKE ? OR ro.operation_code LIKE ? OR ro.rescue_team LIKE ? OR l.city LIKE ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );

    const victims = await queryAll(
      `SELECT v.*, l.city, l.state FROM victims v JOIN locations l ON v.location_id = l.id
       WHERE v.name LIKE ? OR v.victim_code LIKE ? OR v.medical_needs LIKE ? OR l.city LIKE ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );

    const contacts = await queryAll(
      `SELECT ec.*, l.city, l.state FROM emergency_contacts ec JOIN locations l ON ec.location_id = l.id
       WHERE ec.service_name LIKE ? OR ec.category LIKE ? OR ec.phone_number LIKE ? OR l.city LIKE ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );

    const guidelines = await queryAll(
      `SELECT * FROM safety_guidelines
       WHERE title LIKE ? OR disaster_type LIKE ? OR summary LIKE ? OR before_instructions LIKE ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );

    const totalResults = disasters.length + shelters.length + resources.length + rescueOps.length + victims.length + contacts.length + guidelines.length;

    res.json({
      query: q,
      total_count: totalResults,
      results: {
        disasters,
        shelters,
        resources,
        rescue_operations: rescueOps,
        victims,
        contacts,
        guidelines,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 15. REPORTS MODULE API
// ==========================================
router.get('/reports', async (req, res) => {
  try {
    const disasterSummary = await queryAll(
      `SELECT type, COUNT(*) as total_events, SUM(affected_population) as total_affected
       FROM disasters GROUP BY type`
    );

    const victimSummary = await queryAll(
      `SELECT rescue_status, COUNT(*) as count FROM victims GROUP BY rescue_status`
    );

    const resourceSummary = await queryAll(
      `SELECT category, COUNT(*) as total_items, SUM(quantity) as total_quantity FROM resources GROUP BY category`
    );

    const shelterSummary = await queryAll(
      `SELECT status, COUNT(*) as count, SUM(capacity) as total_cap, SUM(occupied_capacity) as total_occ FROM shelters GROUP BY status`
    );

    res.json({
      generated_at: new Date().toISOString(),
      disaster_summary: disasterSummary,
      victim_summary: victimSummary,
      resource_summary: resourceSummary,
      shelter_summary: shelterSummary,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
