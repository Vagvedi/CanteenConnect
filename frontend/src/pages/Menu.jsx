import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMenu } from '../api/client';
import MenuCard from '../components/MenuCard';
import CartSidebar from '../components/CartSidebar';
import { useCartStore } from '../state/store';

const Menu = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const { items, addItem, updateQty, removeItem } = useCartStore();

  useEffect(() => {
    fetchMenu()
      .then(setMenu)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...new Set(menu.map((m) => m.category))];
  const filtered = category === 'all' ? menu : menu.filter((m) => m.category === category);

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const statCardVariants = {
    hover: {
      scale: 1.05,
      y: -5,
      transition: { duration: 0.2 }
    }
  };

  const categoryVariants = {
    hover: { scale: 1.05, y: -2 },
    tap: { scale: 0.95 }
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <motion.div 
          className="glass p-8 rounded-2xl shadow-xl space-y-4 relative overflow-hidden"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-200/30 to-accent-200/30 rounded-full blur-3xl -z-0" />
          <div className="relative z-10">
            <motion.p 
              className="text-xs uppercase tracking-[0.3em] text-primary-600 font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Menu
            </motion.p>
            <motion.h1 
              className="text-4xl font-bold leading-tight gradient-text"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              Fresh, fast, and student-priced.
            </motion.h1>
            <motion.p 
              className="text-gray-600 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Browse by category, add items quickly, and checkout in a few taps. Everything stays in
              sync with your cart.
            </motion.p>
            <motion.div 
              className="grid sm:grid-cols-3 gap-4 mt-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="card p-4 relative overflow-hidden group"
                variants={statCardVariants}
                whileHover="hover"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-xs text-gray-500 font-semibold mb-1">Categories</p>
                <p className="font-bold text-2xl text-primary-600">{categories.length - 1 || 0}</p>
              </motion.div>
              <motion.div 
                className="card p-4 relative overflow-hidden group"
                variants={statCardVariants}
                whileHover="hover"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-xs text-gray-500 font-semibold mb-1">Menu items</p>
                <p className="font-bold text-2xl text-accent-600">{menu.length}</p>
              </motion.div>
              <motion.div 
                className="card p-4 relative overflow-hidden group"
                variants={statCardVariants}
                whileHover="hover"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-xs text-gray-500 font-semibold mb-1">Cart items</p>
                <p className="font-bold text-2xl text-secondary-600">{items.length}</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          className="flex flex-wrap gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {categories.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setCategory(cat)}
              variants={categoryVariants}
              whileHover="hover"
              whileTap="tap"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${
                category === cat
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                  : 'bg-white/90 border-2 border-gray-200 hover:border-primary-400 hover:text-primary-600 shadow-md'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="card p-5 space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3 animate-pulse" />
                <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3 animate-pulse" />
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full animate-pulse" />
                <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
              </motion.div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={category}
              className="grid sm:grid-cols-2 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filtered.map((item, index) => (
                <MenuCard key={item.id} item={item} onAdd={addItem} index={index} />
              ))}
              {filtered.length === 0 && (
                <motion.div 
                  className="card p-8 col-span-2 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <p className="text-gray-600 text-lg">No items in this category yet.</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      <CartSidebar items={items} onUpdateQty={updateQty} onRemove={removeItem} />
    </div>
  );
};

export default Menu;

