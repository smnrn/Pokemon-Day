import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                fontFamily: 'Exo 2, sans-serif',
                fontWeight: 600,
                fontSize: '13px',
                maxWidth: '320px',
                border: '1px solid',
                backdropFilter: 'blur(16px)',
                background: toast.type === 'success'
                  ? 'rgba(6, 214, 160, 0.15)'
                  : toast.type === 'error'
                  ? 'rgba(230, 57, 70, 0.15)'
                  : toast.type === 'warning'
                  ? 'rgba(255, 214, 10, 0.15)'
                  : 'rgba(67, 97, 238, 0.15)',
                borderColor: toast.type === 'success' ? '#06d6a0'
                  : toast.type === 'error' ? '#e63946'
                  : toast.type === 'warning' ? '#ffd60a'
                  : '#4361ee',
                color: toast.type === 'success' ? '#06d6a0'
                  : toast.type === 'error' ? '#e63946'
                  : toast.type === 'warning' ? '#ffd60a'
                  : '#8899ff',
              }}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
