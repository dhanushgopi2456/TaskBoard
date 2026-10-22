import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm"
        />

        {/* 3D Confirmation Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="relative w-full max-w-md glass-card p-6 z-10 rounded-2xl shadow-2xl border border-rose-500/20 bg-white/95 dark:bg-slate-900/95"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Are you sure?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                You are about to delete <span className="font-semibold text-slate-700 dark:text-slate-200">"{taskTitle}"</span>. This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-5 py-2 rounded-xl font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
