const express = require('express');
const { v4: uuid } = require('uuid');
const { 
  getAllMenuItems, 
  getMenuItemById,
  createOrder, 
  getOrderById,
  getOrdersByUserId, 
  getAllOrders, 
  updateOrderStatus,
  createBill,
  getBillsByUserId,
  getBillByOrderId,
  getUserById,
} = require('../db/mysql');
const { authMiddleware } = require('../auth');

const router = express.Router();

// Helper to enrich order with menu item details
const enrichOrder = async (order) => {
  // Ensure items is an array
  let items = order.items;
  if (!Array.isArray(items)) {
    // Try to parse if it's a string
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        console.error('Error parsing items in enrichOrder:', e);
        items = [];
      }
    } else {
      items = [];
    }
  }
  
  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      if (item.name && item.price) return item;
      const menuItem = await getMenuItemById(item.menuId);
      return {
        ...item,
        name: item.name || menuItem?.name || 'Unknown',
        price: item.price || menuItem?.price || 0,
      };
    })
  );
  return {
    ...order,
    items: enrichedItems,
  };
};

router.post('/cart/checkout', authMiddleware(['student', 'staff']), async (req, res) => {
  const { items = [] } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'items required' });
  }
  
  try {
    // Map items and validate availability
    const mapped = await Promise.all(
      items.map(async ({ menuId, qty }) => {
        const menuItem = await getMenuItemById(menuId);
        if (!menuItem || !menuItem.available) {
          throw new Error(`Item ${menuId} unavailable`);
        }
        return {
          menuId,
          qty: Number(qty) || 1,
          price: menuItem.price,
          name: menuItem.name,
        };
      })
    );
    
    const total = mapped.reduce((acc, cur) => acc + cur.price * cur.qty, 0);
    
    // Get user details for register number
    const user = await getUserById(req.user.id);
    
    // Create order
    const orderId = uuid();
    const tokenNumber = `T-${Date.now().toString().slice(-6)}`;
    const order = await createOrder({
      id: orderId,
      userId: req.user.id,
      customerName: req.user.name,
      tokenNumber,
      items: mapped.map(({ menuId, qty, price, name }) => ({ menuId, qty, price, name })),
      total,
      status: 'placed',
    });
    
    // Create bill
    const billId = uuid();
    const bill = await createBill({
      id: billId,
      orderId: order.id,
      userId: req.user.id,
      customerName: req.user.name,
      registerNumber: user?.register_number || null,
      items: mapped,
      total,
    });
    
    const enriched = await enrichOrder(order);
    req.io?.to('staff').emit('order:new', enriched);
    req.io?.to(req.user.id).emit('bill:new', bill);
    
    return res.status(201).json({ order: enriched, bill });
  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(400).json({ message: err.message || 'Checkout failed' });
  }
});

router.get('/orders', authMiddleware(['student', 'staff']), async (req, res) => {
  try {
    const orders = await getOrdersByUserId(req.user.id);
    const enriched = await Promise.all(orders.map(async (order) => {
      const enrichedOrder = await enrichOrder(order);
      // Get bill for this order if it exists
      const bill = await getBillByOrderId(order.id);
      return { ...enrichedOrder, bill };
    }));
    return res.json(enriched);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

router.get('/orders/all', authMiddleware('admin'), async (req, res) => {
  try {
    const orders = await getAllOrders();
    const enriched = await Promise.all(orders.map(async (order) => {
      const enrichedOrder = await enrichOrder(order);
      // Get bill for this order if it exists
      const bill = await getBillByOrderId(order.id);
      return { ...enrichedOrder, bill };
    }));
    return res.json(enriched);
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

router.patch('/orders/:id/status', authMiddleware('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['placed', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const order = await getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Prevent status changes for completed or cancelled orders
    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot modify completed or cancelled orders' });
    }
    
    const updated = await updateOrderStatus(req.params.id, status);
    const enriched = await enrichOrder(updated);
    
    req.io?.to(order.user_id).emit('order:update', enriched);
    req.io?.to('staff').emit('order:update', enriched);
    
    return res.json(enriched);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

router.get('/bills', authMiddleware(['student', 'staff']), async (req, res) => {
  try {
    const bills = await getBillsByUserId(req.user.id);
    return res.json(bills);
  } catch (err) {
    console.error('Error fetching bills:', err);
    res.status(500).json({ message: 'Failed to fetch bills' });
  }
});

module.exports = router;

