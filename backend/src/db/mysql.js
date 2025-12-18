const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  database: process.env.MYSQL_DATABASE || 'canteen_connect',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'jerlin',
  waitForConnections: true,
  connectionLimit: process.env.MYSQL_CONNECTION_LIMIT || 10,
  queueLimit: 0,
});

// Ensure users table exists
const ensureUsersTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      role ENUM('student', 'staff', 'admin') NOT NULL DEFAULT 'student',
      password VARCHAR(255) NOT NULL,
      register_number VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

// Seed default users if table is empty
const seedDefaultUsers = async () => {
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
  if (rows[0].count > 0) return;

  const defaultUsers = [
    {
      id: 'u1',
      name: 'Alice',
      email: 'alice@uni.edu',
      role: 'student',
      password: bcrypt.hashSync('password', 8),
      registerNumber: 'REG-U1',
    },
    {
      id: 's1',
      name: 'Counter Staff',
      email: 'staff@uni.edu',
      role: 'staff',
      password: bcrypt.hashSync('password', 8),
      registerNumber: null,
    },
    {
      id: 'a1',
      name: 'Admin',
      email: 'admin@uni.edu',
      role: 'admin',
      password: bcrypt.hashSync('password', 8),
      registerNumber: null,
    },
  ];

  for (const user of defaultUsers) {
    await pool.query(
      `INSERT INTO users (id, name, email, role, password, register_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user.id, user.name, user.email, user.role, user.password, user.registerNumber]
    );
  }
};

// Get user by email
const getUserByEmail = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
  return rows[0] || null;
};

// Get user by ID
const getUserById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
};

// Insert new user
const insertUser = async (user) => {
  const { id, name, email, role, password, registerNumber } = user;
  const normalizedEmail = email.trim().toLowerCase();
  await pool.query(
    `INSERT INTO users (id, name, email, role, password, register_number)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, normalizedEmail, role, password, registerNumber || null]
  );
};

// Ensure menu table exists
const ensureMenuTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS menu (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(80) NOT NULL,
      price INT NOT NULL,
      available TINYINT(1) DEFAULT 1,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

// Ensure orders table exists with correct structure
const ensureOrdersTable = async () => {
  // Create table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      token_number VARCHAR(255),
      items JSON NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      status VARCHAR(50) DEFAULT 'placed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  
  // Check and add missing columns if table already existed
  try {
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'orders'
    `);
    const columnNames = columns.map(col => col.COLUMN_NAME);
    
    if (!columnNames.includes('customer_name')) {
      await pool.query(`ALTER TABLE orders ADD COLUMN customer_name VARCHAR(255) DEFAULT '' AFTER user_id`);
      // Update existing rows to have a default customer name
      await pool.query(`UPDATE orders SET customer_name = 'Customer' WHERE customer_name = '' OR customer_name IS NULL`);
      // Now make it NOT NULL
      await pool.query(`ALTER TABLE orders MODIFY COLUMN customer_name VARCHAR(255) NOT NULL`);
    }
    if (!columnNames.includes('token_number')) {
      await pool.query(`ALTER TABLE orders ADD COLUMN token_number VARCHAR(255) AFTER customer_name`);
    }
  } catch (err) {
    console.error('Error checking/updating orders table structure:', err);
  }
};

// Ensure bills table exists with correct structure
const ensureBillsTable = async () => {
  // Create table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bills (
      id VARCHAR(64) PRIMARY KEY,
      bill_number VARCHAR(20) UNIQUE NOT NULL,
      order_id VARCHAR(64) NOT NULL,
      user_id VARCHAR(64) NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      register_number VARCHAR(255),
      items JSON NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      status ENUM('ongoing', 'completed', 'cancelled') DEFAULT 'ongoing',
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      cancelled_at TIMESTAMP NULL,
      cancellation_reason TEXT NULL
    )
  `);
  
  // Check and add missing columns if table already existed
  try {
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'bills'
    `);
    const columnNames = columns.map(col => col.COLUMN_NAME);
    
    if (!columnNames.includes('customer_name')) {
      await pool.query(`ALTER TABLE bills ADD COLUMN customer_name VARCHAR(255) NOT NULL DEFAULT '' AFTER user_id`);
    }
    if (!columnNames.includes('register_number')) {
      await pool.query(`ALTER TABLE bills ADD COLUMN register_number VARCHAR(255) AFTER customer_name`);
    }
    if (!columnNames.includes('expires_at')) {
      await pool.query(`ALTER TABLE bills ADD COLUMN expires_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER total`);
    }
  } catch (err) {
    console.error('Error checking/updating bills table structure:', err);
  }
};

// Seed default menu items if table is empty
const seedDefaultMenu = async () => {
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM menu');
  if (rows[0].count > 0) return;

  const defaultMenu = [
    { id: 'm1', name: 'Veg Burger', category: 'Meals', price: 80, available: true, description: 'Veg patty, lettuce, sauce' },
    { id: 'm2', name: 'Masala Tea', category: 'Drinks', price: 15, available: true, description: 'Strong Indian masala tea' },
    { id: 'm3', name: 'Paneer Wrap', category: 'Meals', price: 90, available: true, description: 'Paneer tikka wrap with veggies' },
    { id: 'm4', name: 'Cold Coffee', category: 'Drinks', price: 60, available: true, description: 'Iced coffee with cream' },
    { id: 'm5', name: 'French Fries', category: 'Snacks', price: 50, available: true, description: 'Crispy fries with ketchup' },
    { id: 'm6', name: 'Veg Puff', category: 'Snacks', price: 25, available: true, description: 'Baked puff pastry with veggies' },
    { id: 'm7', name: 'Veg Thali', category: 'Meals', price: 120, available: true, description: 'Rice, dal, sabzi, roti, salad' },
    { id: 'm8', name: 'Lemon Soda', category: 'Drinks', price: 30, available: true, description: 'Fresh lime soda' },
    { id: 'm9', name: 'Chocolate Donut', category: 'Snacks', price: 40, available: true, description: 'Chocolate glazed donut' },
    { id: 'm10', name: 'Pasta Arrabbiata', category: 'Meals', price: 110, available: true, description: 'Spicy tomato pasta' },
  ];

  for (const item of defaultMenu) {
    await pool.query(
      `INSERT INTO menu (id, name, category, price, available, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [item.id, item.name, item.category, item.price, item.available ? 1 : 0, item.description]
    );
  }
};

// Menu CRUD functions
const getAllMenuItems = async () => {
  const [rows] = await pool.query('SELECT * FROM menu ORDER BY created_at DESC');
  return rows.map(row => ({ ...row, available: Boolean(row.available) }));
};

const getMenuItemById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM menu WHERE id = ?', [id]);
  return rows[0] ? { ...rows[0], available: Boolean(rows[0].available) } : null;
};

const createMenuItem = async (item) => {
  const { id, name, category, price, available = true, description = '' } = item;
  await pool.query(
    `INSERT INTO menu (id, name, category, price, available, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, category, price, available ? 1 : 0, description]
  );
  return getMenuItemById(id);
};

const updateMenuItem = async (id, updates) => {
  const fields = [];
  const values = [];
  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
  if (updates.price !== undefined) { fields.push('price = ?'); values.push(updates.price); }
  if (updates.available !== undefined) { fields.push('available = ?'); values.push(updates.available ? 1 : 0); }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
  
  if (fields.length === 0) return getMenuItemById(id);
  
  values.push(id);
  await pool.query(`UPDATE menu SET ${fields.join(', ')} WHERE id = ?`, values);
  return getMenuItemById(id);
};

const deleteMenuItem = async (id) => {
  await pool.query('DELETE FROM menu WHERE id = ?', [id]);
};

// Helper function to safely parse JSON (handles both string and object)
const safeJsonParse = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') return value; // Already parsed
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error('JSON parse error:', e, 'Value:', value);
      return null;
    }
  }
  return value;
};

// Orders CRUD functions
const createOrder = async (order) => {
  const { id, userId, customerName, tokenNumber, items, total, status = 'placed' } = order;
  await pool.query(
    `INSERT INTO orders (id, user_id, customer_name, token_number, items, total, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, customerName, tokenNumber, JSON.stringify(items), total, status]
  );
  return getOrderById(id);
};

const getOrderById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
  if (!rows[0]) return null;
  return {
    ...rows[0],
    userId: rows[0].user_id,
    customerName: rows[0].customer_name,
    tokenNumber: rows[0].token_number,
    items: safeJsonParse(rows[0].items),
    createdAt: rows[0].created_at,
    updatedAt: rows[0].updated_at,
  };
};

const getOrdersByUserId = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  return rows.map(row => ({
    ...row,
    userId: row.user_id,
    customerName: row.customer_name,
    tokenNumber: row.token_number,
    items: safeJsonParse(row.items),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};

const getAllOrders = async () => {
  const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  return rows.map(row => ({
    ...row,
    userId: row.user_id,
    customerName: row.customer_name,
    tokenNumber: row.token_number,
    items: safeJsonParse(row.items),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};

const updateOrderStatus = async (id, status) => {
  await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
  return getOrderById(id);
};

// Bills CRUD functions
const generateBillNumber = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let billNumber = '';
  // First 3 letters
  for (let i = 0; i < 3; i++) {
    billNumber += letters[Math.floor(Math.random() * letters.length)];
  }
  // Last 2 numbers
  for (let i = 0; i < 2; i++) {
    billNumber += numbers[Math.floor(Math.random() * numbers.length)];
  }
  return billNumber;
};

const createBill = async (bill) => {
  let billNumber = generateBillNumber();
  // Ensure uniqueness
  let exists = true;
  while (exists) {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM bills WHERE bill_number = ?', [billNumber]);
    if (rows[0].count === 0) exists = false;
    else billNumber = generateBillNumber();
  }
  
  const { id, orderId, userId, customerName, registerNumber, items, total } = bill;
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
  
  await pool.query(
    `INSERT INTO bills (id, bill_number, order_id, user_id, customer_name, register_number, items, total, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, billNumber, orderId, userId, customerName, registerNumber || null, JSON.stringify(items), total, expiresAt]
  );
  
  return getBillById(id);
};

const getBillById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM bills WHERE id = ?', [id]);
  if (!rows[0]) return null;
  return {
    ...rows[0],
    billNumber: rows[0].bill_number, // Map bill_number to billNumber
    orderId: rows[0].order_id,
    userId: rows[0].user_id,
    customerName: rows[0].customer_name,
    registerNumber: rows[0].register_number,
    items: safeJsonParse(rows[0].items),
    expiresAt: rows[0].expires_at,
    createdAt: rows[0].created_at,
    cancelledAt: rows[0].cancelled_at,
    cancellationReason: rows[0].cancellation_reason,
  };
};

const getBillsByUserId = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM bills WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  return rows.map(row => ({
    ...row,
    billNumber: row.bill_number, // Map bill_number to billNumber
    orderId: row.order_id,
    userId: row.user_id,
    customerName: row.customer_name,
    registerNumber: row.register_number,
    items: safeJsonParse(row.items),
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    cancelledAt: row.cancelled_at,
    cancellationReason: row.cancellation_reason,
  }));
};

const getBillByOrderId = async (orderId) => {
  const [rows] = await pool.query('SELECT * FROM bills WHERE order_id = ?', [orderId]);
  if (!rows[0]) return null;
  return {
    ...rows[0],
    billNumber: rows[0].bill_number,
    orderId: rows[0].order_id,
    userId: rows[0].user_id,
    customerName: rows[0].customer_name,
    registerNumber: rows[0].register_number,
    items: safeJsonParse(rows[0].items),
    expiresAt: rows[0].expires_at,
    createdAt: rows[0].created_at,
    cancelledAt: rows[0].cancelled_at,
    cancellationReason: rows[0].cancellation_reason,
  };
};

const updateBillStatus = async (id, status, cancellationReason = null) => {
  const updates = ['status = ?'];
  const values = [status];
  
  if (status === 'cancelled' && cancellationReason) {
    updates.push('cancelled_at = NOW()', 'cancellation_reason = ?');
    values.push(cancellationReason);
  }
  
  values.push(id);
  await pool.query(`UPDATE bills SET ${updates.join(', ')} WHERE id = ?`, values);
  return getBillById(id);
};

module.exports = {
  pool,
  ensureUsersTable,
  ensureMenuTable,
  ensureOrdersTable,
  ensureBillsTable,
  seedDefaultUsers,
  seedDefaultMenu,
  getUserByEmail,
  getUserById,
  insertUser,
  // Menu functions
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  // Order functions
  createOrder,
  getOrderById,
  getOrdersByUserId,
  getAllOrders,
  updateOrderStatus,
  // Bill functions
  createBill,
  getBillById,
  getBillsByUserId,
  getBillByOrderId,
  updateBillStatus,
  generateBillNumber,
};

