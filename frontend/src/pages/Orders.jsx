import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOrders, getAllOrders, updateOrderStatus, getSocket } from '../api/client';
import OrderStatusBadge from '../components/OrderStatusBadge';
import StaffOrderCard from '../components/StaffOrderCard';
import { useAuthStore } from '../state/store';

const Orders = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = user?.role === 'staff' ? getAllOrders : getOrders;
    fetch()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    const socket = getSocket();
    socket.on('order:update', (order) => {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    });
    socket.on('order:new', (order) => setOrders((prev) => [order, ...prev]));
    return () => {
      socket.off('order:update');
      socket.off('order:new');
    };
  }, []);

  const handleStatus = async (id, status) => {
    const updated = await updateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  if (!user) {
    return (
      <motion.div 
        className="p-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-gray-600 text-lg">Login to view orders.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="max-w-5xl mx-auto px-4 py-8 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold gradient-text mb-2">Orders</h1>
        <p className="text-gray-600 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live updates via sockets
        </p>
      </motion.div>
      
      {loading ? (
        <motion.div
          className="grid md:grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </motion.div>
      ) : orders.length === 0 ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          >
            📦
          </motion.div>
          <p className="text-gray-500 text-lg font-medium">No orders yet.</p>
        </motion.div>
      ) : user.role === 'staff' ? (
        <motion.div 
          className="grid md:grid-cols-2 gap-4"
          variants={containerVariants}
        >
          <AnimatePresence>
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                variants={itemVariants}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <StaffOrderCard order={order} onStatusChange={handleStatus} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div 
          className="space-y-4"
          variants={containerVariants}
        >
          <AnimatePresence>
            {orders.map((order) => (
              <motion.div
                key={order.id}
                variants={itemVariants}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="card p-5 hover:shadow-xl transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Order #{order.id.slice(0, 6)} ·{' '}
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Token: <span className="text-primary-600">{order.tokenNumber}</span>
                    </p>
                    <p className="text-lg font-bold text-gray-800">Total: ₹{order.total}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <ul className="space-y-2 pt-4 border-t border-gray-200">
                  {order.items.map((i) => (
                    <li key={i.menuId} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {i.name || i.menuId} <span className="text-gray-500">x{i.qty}</span>
                      </span>
                      <span className="font-semibold text-gray-800">₹{(i.price || 0) * i.qty}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Orders;

