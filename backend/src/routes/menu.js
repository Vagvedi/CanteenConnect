const express = require('express');
const { v4: uuid } = require('uuid');
const { getAllMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem } = require('../db/mysql');
const { authMiddleware } = require('../auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let items = await getAllMenuItems();
    if (category) {
      items = items.filter((m) => m.category === category);
    }
    res.json(items);
  } catch (err) {
    console.error('Error fetching menu:', err);
    res.status(500).json({ message: 'Failed to fetch menu' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await getMenuItemById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    return res.json(item);
  } catch (err) {
    console.error('Error fetching menu item:', err);
    res.status(500).json({ message: 'Failed to fetch menu item' });
  }
});

router.patch('/:id', authMiddleware('admin'), async (req, res) => {
  try {
    const item = await getMenuItemById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    const updated = await updateMenuItem(req.params.id, req.body);
    return res.json(updated);
  } catch (err) {
    console.error('Error updating menu item:', err);
    res.status(500).json({ message: 'Failed to update menu item' });
  }
});

router.post('/', authMiddleware('admin'), async (req, res) => {
  try {
    const { name, category, price, available = true, description = '' } = req.body;
    if (!name || !category || !price) {
      return res.status(400).json({ message: 'name, category, price required' });
    }
    const item = {
      id: uuid(),
      name,
      category,
      price,
      available,
      description,
    };
    const created = await createMenuItem(item);
    return res.status(201).json(created);
  } catch (err) {
    console.error('Error creating menu item:', err);
    res.status(500).json({ message: 'Failed to create menu item' });
  }
});

router.delete('/:id', authMiddleware('admin'), async (req, res) => {
  try {
    const item = await getMenuItemById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    await deleteMenuItem(req.params.id);
    return res.json({ message: 'Menu item deleted' });
  } catch (err) {
    console.error('Error deleting menu item:', err);
    res.status(500).json({ message: 'Failed to delete menu item' });
  }
});

module.exports = router;

