import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../state/store';

const NavBar = () => {
  const { user, logout } = useAuthStore();
  
  const navVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  const linkVariants = {
    hover: { scale: 1.05, y: -2 },
    tap: { scale: 0.95 }
  };

  return (
    <motion.nav 
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-white/60 shadow-lg"
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/" className="text-xl font-bold gradient-text tracking-tight">
            Canteen Connect
          </Link>
        </motion.div>
        <div className="flex items-center gap-4 text-sm">
          <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
            <NavLink 
              to="/menu" 
              className={({ isActive }) => 
                `font-semibold px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50/50'
                }`
              }
            >
              Menu
            </NavLink>
          </motion.div>
          <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
            <NavLink 
              to="/orders" 
              className={({ isActive }) => 
                `font-semibold px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50/50'
                }`
              }
            >
              Orders
            </NavLink>
          </motion.div>
          {user?.role === 'staff' && (
            <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
              <NavLink 
                to="/staff" 
                className={({ isActive }) => 
                  `font-semibold px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'text-accent-600 bg-accent-50' 
                      : 'text-gray-700 hover:text-accent-600 hover:bg-accent-50/50'
                  }`
                }
              >
                Staff
              </NavLink>
            </motion.div>
          )}
          {user ? (
            <motion.button
              onClick={logout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-sm font-semibold shadow-md transition-all duration-200"
            >
              Logout ({user.name})
            </motion.button>
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <NavLink
                to="/login"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm font-semibold"
              >
                Login
              </NavLink>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default NavBar;

