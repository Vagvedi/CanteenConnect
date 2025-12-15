import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CartSidebar = ({ items, onUpdateQty, onRemove }) => {
  const total = items.reduce((sum, i) => sum + i.menuItem.price * i.qty, 0);
  
  const sidebarVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      x: 20,
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.aside 
      className="card p-6 sticky top-24 max-h-[80vh] overflow-y-auto"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h3 
        className="font-bold text-xl mb-4 gradient-text flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span>🛒</span> Your Cart
      </motion.h3>
      
      <AnimatePresence mode="wait">
        {items.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            >
              🛒
            </motion.div>
            <p className="text-gray-500 font-medium">Your cart is empty</p>
            <p className="text-sm text-gray-400 mt-2">Add items from the menu!</p>
          </motion.div>
        ) : (
          <motion.div 
            key="items"
            className="flex flex-col gap-4"
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.menuId}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="border-2 border-gray-100 rounded-xl p-4 bg-gradient-to-br from-white to-gray-50/50 hover:border-primary-300 transition-all duration-200 group"
                  layout
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{item.menuItem.name}</p>
                      <p className="text-xs text-gray-500 mt-1">₹{item.menuItem.price} each</p>
                    </div>
                    <motion.button
                      onClick={() => onRemove(item.menuId)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      ✕
                    </motion.button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 font-medium">Qty</span>
                    <motion.input
                      type="number"
                      className="border-2 border-gray-200 rounded-lg px-3 py-1.5 w-20 text-center focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-all"
                      value={item.qty}
                      onChange={(e) => onUpdateQty(item.menuId, Number(e.target.value))}
                      min={1}
                      whileFocus={{ scale: 1.05 }}
                    />
                    <motion.span 
                      className="ml-auto font-bold text-lg text-primary-600"
                      key={item.menuItem.price * item.qty}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      ₹{item.menuItem.price * item.qty}
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {items.length > 0 && (
        <motion.div 
          className="mt-6 pt-6 border-t-2 border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-lg text-gray-700">Total</span>
            <motion.span 
              className="text-2xl font-bold gradient-text"
              key={total}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              ₹{total}
            </motion.span>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/checkout"
              className="block text-center btn-primary py-3 text-lg font-bold"
            >
              Checkout →
            </Link>
          </motion.div>
        </motion.div>
      )}
    </motion.aside>
  );
};

export default CartSidebar;

