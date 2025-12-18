const mysql = require('mysql2/promise');

if (!process.env.MYSQL_URL) {
  throw new Error('❌ MYSQL_URL is not defined');
}

const pool = mysql.createPool({
  uri: process.env.MYSQL_URL,
  waitForConnections: true,
  connectionLimit: 10,
});

/* ======================
   WAIT FOR DB
====================== */
async function waitForDB(retries = 10) {
  while (retries--) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ MySQL connected');
      return;
    } catch {
      console.log('⏳ Waiting for MySQL...');
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  throw new Error('❌ MySQL not reachable');
}

/* ======================
   USERS
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
  const { id, name, email, password, role, register_number } = user;
  await pool.query(
    `INSERT INTO users
     (id, name, email, password, role, register_number)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, email, password, role, register_number]
  );
}

/* ======================
   MENU
====================== */
async function getAllMenuItems() {
  const [rows] = await pool.query('SELECT * FROM menu');
  return rows;
}

async function getMenuItemById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM menu WHERE id = ?',
    [id]
  );
  return rows[0];
}

async function createMenuItem(item) {
  const { id, name, category, price, available, description } = item;
  await pool.query(
    `INSERT INTO menu
     (id, name, category, price, available, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, category, price, available, description]
  );
  return getMenuItemById(id);
}

async function updateMenuItem(id, data) {
  const fields = [];
  const values = [];

  for (const key of ['name', 'category', 'price', 'available', 'description']) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }

  if (!fields.length) return getMenuItemById(id);

  await pool.query(
    `UPDATE menu SET ${fields.join(', ')} WHERE id = ?`,
    [...values, id]
  );

  return getMenuItemById(id);
}

async function deleteMenuItem(id) {
  await pool.query('DELETE FROM menu WHERE id = ?', [id]);
}

/* ======================
   ORDERS
====================== */
async function createOrder(order) {
  const { id, userId, customerName, tokenNumber, items, total, status } = order;
  await pool.query(
    `INSERT INTO orders
     (id, user_id, customer_name, token_number, items, total, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, customerName, tokenNumber, JSON.stringify(items), total, status]
  );
  return getOrderById(id);
}

async function getOrderById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM orders WHERE id = ?',
    [id]
  );
  return rows[0];
}

async function getOrdersByUserId(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
}

async function getAllOrders() {
  const [rows] = await pool.query(
    'SELECT * FROM orders ORDER BY created_at DESC'
  );
  return rows;
}

async function updateOrderStatus(id, status) {
  await pool.query(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, id]
  );
  return getOrderById(id);
}

/* ======================
   BILLS
====================== */
async function createBill(bill) {
  const {
    id,
    orderId,
    userId,
    customerName,
    registerNumber,
    items,
    total,
  } = bill;

  const billNumber = `B-${Date.now().toString().slice(-6)}`;
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await pool.query(
    `INSERT INTO bills
     (id, bill_number, order_id, user_id, customer_name,
      register_number, items, total, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      billNumber,
      orderId,
      userId,
      customerName,
      registerNumber,
      JSON.stringify(items),
      total,
      expiresAt,
    ]
  );

  return getBillByOrderId(orderId);
}

async function getBillsByUserId(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM bills WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
}

async function getBillByOrderId(orderId) {
  const [rows] = await pool.query(
    'SELECT * FROM bills WHERE order_id = ?',
    [orderId]
  );
  return rows[0];
}

/* ======================
   EXPORTS
====================== */
module.exports = {
  pool,
  waitForDB,

  // users
  getUserByEmail,
  getUserById,
  insertUser,

  // menu
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,

  // orders
  createOrder,
  getOrderById,
  getOrdersByUserId,
  getAllOrders,
  updateOrderStatus,

  // bills
  createBill,
  getBillsByUserId,
  getBillByOrderId,
};
