import { motion } from 'framer-motion';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    },
    hover: {
      scale: 1.05,
      y: -5,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.div 
      className="max-w-5xl mx-auto px-4 py-12 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header className="text-center space-y-4" variants={itemVariants}>
        <motion.h1 
          className="text-5xl font-bold gradient-text"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          Welcome to Canteen Connect
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-600 max-w-2xl mx-auto"
          variants={itemVariants}
        >
          Browse the daily menu, place orders, and track status in real-time.
        </motion.p>
      </motion.header>
      <motion.div 
        className="grid md:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        <motion.div 
          className="card p-6 relative overflow-hidden group"
          variants={cardVariants}
          whileHover="hover"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              🎓
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-800">Students</h3>
            <p className="text-sm text-gray-600">Add items to cart and checkout quickly.</p>
          </div>
        </motion.div>
        <motion.div 
          className="card p-6 relative overflow-hidden group"
          variants={cardVariants}
          whileHover="hover"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              👨‍🍳
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-800">Staff</h3>
            <p className="text-sm text-gray-600">See incoming orders and update status.</p>
          </div>
        </motion.div>
        <motion.div 
          className="card p-6 relative overflow-hidden group"
          variants={cardVariants}
          whileHover="hover"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-secondary-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-400 to-secondary-600 mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              ⚡
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-800">Live updates</h3>
            <p className="text-sm text-gray-600">Sockets notify when orders move forward.</p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Home;

