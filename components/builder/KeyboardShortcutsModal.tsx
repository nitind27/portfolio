'use client';
import { motion } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['Ctrl', 'Z'], desc: 'Undo' },
  { keys: ['Ctrl', 'Y'], desc: 'Redo' },
  { keys: ['Ctrl', 'Shift', 'Z'], desc: 'Redo (alt)' },
  { keys: ['Ctrl', 'P'], desc: 'Toggle Preview' },
  { keys: ['?'], desc: 'Show / hide shortcuts' },
  { keys: ['Esc'], desc: 'Close modal / deselect' },
];

export default function KeyboardShortcutsModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Keyboard Shortcuts</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {SHORTCUTS.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-sm text-gray-400">{s.desc}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, j) => (
                  <span key={j} className="px-2 py-0.5 bg-white/10 rounded text-xs font-mono text-gray-300 border border-white/10">{k}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-4 text-center">Press <span className="font-mono bg-white/5 px-1 rounded">?</span> anytime to toggle this</p>
      </motion.div>
    </motion.div>
  );
}
