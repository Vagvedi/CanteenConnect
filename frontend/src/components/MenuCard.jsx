import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MenuCard = ({ item, onAdd, index = 0 }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: index * 0.1,
        duration: 0.4,
        ease: 'easeOut'
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)' },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div 
      className="card p-5 flex flex-col gap-4 relative overflow-hidden group"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex justify-between items-start gap-3 relative z-10">
        <div className="space-y-2 flex-1">
          <motion.span 
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 shadow-sm"
            whileHover={{ scale: 1.05 }}
          >
            {item.category}
          </motion.span>
          <h3 className="font-bold text-xl leading-tight text-gray-800">{item.name}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
        </div>
        <div className="text-right">
          <motion.span 
            className="font-bold text-primary-600 text-2xl block"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
          >
            ₹{item.price}
          </motion.span>
          <motion.div 
            className={`text-xs font-semibold mt-1 px-2 py-1 rounded-full inline-block ${
              item.available 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}
            animate={item.available ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {item.available ? '✓ Available' : '✗ Unavailable'}
          </motion.div>
        </div>
      </div>
      
      <div className="flex items-center justify-between gap-3 relative z-10">
        <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
          <Link 
            to={`/menu/${item.id}`} 
            className="text-primary-600 text-sm font-semibold hover:text-primary-700 flex items-center gap-1 group"
          >
            Details
            <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </motion.div>
        <motion.button
          onClick={() => onAdd(item)}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          disabled={!item.available}
        >
          <span className="relative z-10 flex items-center gap-2">
            {item.available ? (
              <>
                <span>Add to cart</span>
                <span className="text-lg">🛒</span>
              </>
            ) : (
              'Unavailable'
            )}
          </span>
          {item.available && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MenuCard;

