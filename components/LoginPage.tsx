'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBuilderStore } from '@/lib/store';
import { Lock, Layers } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useBuilderStore(s => s.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(password);
    if (!ok) setError('Invalid password. Try "admin123"');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Portfolio Builder</h1>
          <p className="text-gray-400 mt-2">Sign in to your admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111] border border-white/10 rounded-2xl p-8 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter admin password"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition"
          >
            Sign In
          </button>
          <p className="text-center text-xs text-gray-600">Default password: admin123</p>
        </form>
      </motion.div>
    </div>
  );
}
