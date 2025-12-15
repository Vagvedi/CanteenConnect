import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { register as apiRegister } from '../api/client';
import { useAuthStore } from '../state/store';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { user, token } = await apiRegister(form);
      login(user, token);
      navigate('/menu');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <motion.div 
        className="max-w-md w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="glass p-8 rounded-2xl shadow-2xl relative overflow-hidden"
          variants={itemVariants}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent-300/20 to-primary-300/20 rounded-full blur-3xl -z-0" />
          <div className="relative z-10">
            <motion.h1 
              className="text-4xl font-bold mb-2 gradient-text"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              Create Account
            </motion.h1>
            <p className="text-gray-600 mb-6">Join Canteen Connect today</p>
            
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: error ? 1 : 0, height: error ? 'auto' : 0 }}
              className="mb-4 overflow-hidden"
            >
              {error && (
                <motion.div 
                  className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-medium"
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                >
                  {error}
                </motion.div>
              )}
            </motion.div>

            <form className="space-y-4" onSubmit={submit}>
              <motion.div variants={itemVariants}>
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <select
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-all duration-200 bg-white"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                </select>
              </motion.div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-secondary py-3 text-lg font-bold"
              >
                Create account
              </motion.button>
            </form>

            <motion.p 
              className="text-sm text-gray-600 mt-6 text-center"
              variants={itemVariants}
            >
              Already registered?{' '}
              <Link 
                to="/login" 
                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                Login here
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;

