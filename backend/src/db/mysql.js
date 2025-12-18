const mysql = require('mysql2/promise');

if (!process.env.MYSQL_URL) {
  throw new Error('❌ MYSQL_URL is not defined');
}

/* ======================
   POOL
====================== */
const pool = mysql.createPool({
  uri: process.env.MYSQL_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/* ======================
   WAIT FOR DB (Railway-safe)
====================== */
async function waitForDB(retries = 15) {
  while (retries > 0) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ MySQL connected');
      return;
    } catch (err) {
      retries--;
      console.log('⏳ Waiting for MySQL...');
      await new Promise(res => setTimeout(res, 4000));
    }
  }
  throw new Error('❌ MySQL not reachable after retries');
}

/* ======================
   TABLES
====================== */
async function ensureUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL,
      register_number VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function ensureMenuTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS menu (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      price INT,
      available BOOLEAN DEFAULT TRUE
    )
  `);
}

async function ensureOrdersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(36),
      item VARCHAR(100),
      quantity INT,
      status VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function ensureBillsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bills (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT,
      amount INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

/* ======================
   AUTH DB FUNCTIONS (🔥 FIX)
====================== */
async function getUserByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows[0];
}

async function getUserById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
}

async function insertUser(user) {
  const {
    id,
    name,
    email,
    password,
    role,
    register_number,
  } = user;

  await pool.query(
    `INSERT INTO users
     (id, name, email, password, role, register_number)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, email, password, role, register_number]
  );
}

/* ======================
   EXPORTS
====================== */
module.exports = {
  pool,
  waitForDB,
  ensureUsersTable,
  ensureMenuTable,
  ensureOrdersTable,
  ensureBillsTable,
  getUserByEmail,
  getUserById,
  insertUser,
};
