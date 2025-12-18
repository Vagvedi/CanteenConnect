import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../state/store';

const Bill = ({ bill, onClick }) => {
  const { user } = useAuthStore();
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!bill?.expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expires = new Date(bill.expiresAt).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
      setIsExpired(false);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [bill?.expiresAt]);

  const handleClick = () => {
    if (onClick) {
      onClick(bill);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const formatTime = (time) => {
    if (!time) return '00:00:00';
    const { hours, minutes, seconds } = time;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <motion.div
      className={`glass p-6 rounded-2xl shadow-xl cursor-pointer transition-all duration-300 ${
        isExpired ? 'opacity-60 border-2 border-red-300' : 'hover:shadow-2xl hover:scale-[1.02]'
      }`}
      onClick={handleClick}
      whileHover={{ scale: isExpired ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Bill Number - Top Center, Bold, Bigger */}
      <div className="text-center mb-4">
        <motion.div
          className={`text-4xl font-bold gradient-text ${isExpired ? 'line-through text-red-500' : ''}`}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          {bill?.billNumber || 'N/A'}
        </motion.div>
        {isExpired && (
          <motion.p
            className="text-red-600 font-semibold mt-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            EXPIRED
          </motion.p>
        )}
      </div>

      {/* Timer */}
      {!isExpired && timeRemaining && (
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full">
            <span className="text-lg">⏱️</span>
            <span className="font-mono font-bold text-primary-700 text-lg">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </motion.div>
      )}

      {/* Summary View */}
      {!isExpanded && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Customer:</span>
            <span className="font-semibold">{bill?.customerName || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Date:</span>
            <span className="font-semibold">
              {bill?.createdAt ? new Date(bill.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Items:</span>
            <span className="font-semibold">{bill?.items?.length || 0} item(s)</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-lg font-bold text-gray-700">Total:</span>
            <span className="text-2xl font-bold gradient-text">₹{bill?.total || 0}</span>
          </div>
        </div>
      )}

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t-2 border-gray-200 space-y-3"
          >
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Bill Number:</span>
                <span className="font-bold text-lg">{bill?.billNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Name:</span>
                <span className="font-semibold">{bill?.customerName}</span>
              </div>
              {bill?.registerNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration Number:</span>
                  <span className="font-semibold">{bill.registerNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-semibold">
                  {bill?.createdAt ? new Date(bill.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              {bill?.expiresAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Expires At:</span>
                  <span className="font-semibold">
                    {new Date(bill.expiresAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-200">
              <h4 className="font-bold text-gray-700 mb-2">Items:</h4>
              <ul className="space-y-2">
                {bill?.items?.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    <span className="text-gray-700">
                      {item.name} <span className="text-gray-500">x {item.qty}</span>
                    </span>
                    <span className="font-semibold">₹{item.price * item.qty}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t-2 border-gray-300">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-700">Total Amount:</span>
                <span className="text-3xl font-bold gradient-text">₹{bill?.total || 0}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Bill;

