import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* 3D Confirmation Card */}
          <motion.div
            key="modal-card"
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: 'spring', visualDuration: 0.28, bounce: 0.15 }}
            className="relative w-full max-w-md glass-card p-6 z-10 rounded-3xl shadow-2xl border border-rose-500/30 bg-white/95 dark:bg-slate-900/95"
          >
            <div className="flex items-start gap-4">
              <motion.div
                initial={{ rotate: -15, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.3 }}
                className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 flex-shrink-0 shadow-sm"
              >
                <AlertTriangle className="w-6 h-6" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Delete this task?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  You are about to delete <span className="font-semibold text-slate-800 dark:text-slate-200">"{taskTitle}"</span>. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={onConfirm}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
