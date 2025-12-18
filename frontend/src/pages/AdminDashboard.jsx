import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMenu, getAllOrders, updateOrderStatus } from '../api/client';
import { useAuthStore } from '../state/store';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('menu');
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: '', price: '', description: '', available: true });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [menuData, ordersData] = await Promise.all([fetchMenu(), getAllOrders()]);
      setMenu(menuData);
      setOrders(ordersData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
        },
        body: JSON.stringify({
          name: newItem.name,
          category: newItem.category,
          price: Number(newItem.price),
          description: newItem.description,
          available: newItem.available,
        }),
      });
      if (response.ok) {
        await loadData();
        setShowAddForm(false);
        setNewItem({ name: '', category: '', price: '', description: '', available: true });
      }
    } catch (err) {
      console.error('Error adding item:', err);
    }
  };

  const handleUpdateItem = async (id, updates) => {
    try {
      const response = await fetch(`http://localhost:4000/api/menu/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
        },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        await loadData();
        setEditingItem(null);
      }
    } catch (err) {
      console.error('Error updating item:', err);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const response = await fetch(`http://localhost:4000/api/menu/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
        },
      });
      if (response.ok) {
        await loadData();
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const handleOrderStatusChange = async (orderId, status) => {
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const ongoingOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'completed');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6 rounded-2xl shadow-xl"
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage menu items and orders</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-4 border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'menu'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-primary-600'
          }`}
        >
          Menu Management
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'orders'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-primary-600'
          }`}
        >
          Orders Management
        </button>
      </div>

      {/* Menu Tab */}
      {activeTab === 'menu' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Menu Items</h2>
            <motion.button
              onClick={() => setShowAddForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary flex items-center gap-2"
            >
              ➕ Add New Item
            </motion.button>
          </div>

          {/* Add Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass p-6 rounded-xl"
              >
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      className="border-2 border-gray-200 rounded-lg px-4 py-2"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      className="border-2 border-gray-200 rounded-lg px-4 py-2"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      className="border-2 border-gray-200 rounded-lg px-4 py-2"
                      required
                    />
                    <textarea
                      placeholder="Description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className="border-2 border-gray-200 rounded-lg px-4 py-2"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newItem.available}
                        onChange={(e) => setNewItem({ ...newItem, available: e.target.checked })}
                      />
                      Available
                    </label>
                    <div className="flex gap-2">
                      <button type="submit" className="btn-primary flex items-center gap-2">
                        ✓ Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false);
                          setNewItem({ name: '', category: '', price: '', description: '', available: true });
                        }}
                        className="btn-secondary flex items-center gap-2"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Menu Items List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menu.map((item) => (
              <motion.div
                key={item.id}
                className="glass p-4 rounded-xl shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {editingItem === item.id ? (
                  <EditItemForm
                    item={item}
                    onSave={(updates) => handleUpdateItem(item.id, updates)}
                    onCancel={() => setEditingItem(null)}
                  />
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                      <span className="font-bold text-primary-600">₹{item.price}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs ${item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingItem(item.id)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Ongoing Orders */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Ongoing Orders ({ongoingOrders.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {ongoingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleOrderStatusChange}
                  canEdit={true}
                />
              ))}
            </div>
            {ongoingOrders.length === 0 && (
              <p className="text-gray-500 text-center py-8">No ongoing orders</p>
            )}
          </div>

          {/* Completed Orders */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Completed Orders ({completedOrders.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {completedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleOrderStatusChange}
                  canEdit={false}
                />
              ))}
            </div>
          </div>

          {/* Cancelled Orders */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Cancelled Orders ({cancelledOrders.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {cancelledOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleOrderStatusChange}
                  canEdit={false}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const EditItemForm = ({ item, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: item.name,
    category: item.category,
    price: item.price,
    description: item.description || '',
    available: item.available,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2"
        required
      />
      <input
        type="text"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2"
        required
      />
      <input
        type="number"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2"
        required
      />
      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2"
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.available}
          onChange={(e) => setForm({ ...form, available: e.target.checked })}
        />
        Available
      </label>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1 text-sm py-2">
          Save
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1 text-sm py-2">
          Cancel
        </button>
      </div>
    </form>
  );
};

const OrderCard = ({ order, onStatusChange, canEdit }) => {
  const [status, setStatus] = useState(order.status);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    onStatusChange(order.id, newStatus);
  };

  return (
    <motion.div
      className="glass p-4 rounded-xl shadow-lg"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-lg">{order.customerName}</p>
          <p className="text-sm text-gray-600">Token: {order.tokenNumber}</p>
          <p className="text-sm text-gray-600">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          order.status === 'completed' ? 'bg-green-100 text-green-700' :
          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {order.status}
        </span>
      </div>
      <div className="mb-3">
        <p className="text-sm font-semibold mb-1">Items:</p>
        <ul className="space-y-1">
          {order.items?.map((item, idx) => (
            <li key={idx} className="text-sm text-gray-700">
              {item.name} x {item.qty} - ₹{item.price * item.qty}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
        <span className="font-bold text-lg">Total: ₹{order.total}</span>
        {canEdit && (
          <select
            value={status}
            onChange={handleStatusChange}
            className="border-2 border-gray-200 rounded-lg px-3 py-1 text-sm"
          >
            <option value="placed">Placed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        )}
      </div>
    </motion.div>
  );
};

export default AdminDashboard;

