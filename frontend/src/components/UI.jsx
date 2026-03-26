import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function Spinner({ size = 24, color = '#13b88e' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" strokeOpacity="0.2" />
      <motion.circle
        cx="12" cy="12" r="10"
        stroke={color} strokeWidth="2"
        strokeDasharray="62.83"
        strokeDashoffset="47"
        strokeLinecap="round"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '12px 12px' }}
      />
    </svg>
  )
}

export function LoadingScreen({ message = 'SmartSaathi is thinking...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shadow-glow-green"
      >
        <Sparkles size={24} className="text-white" />
      </motion.div>
      <p className="text-sm text-[#8b949e] animate-pulse">{message}</p>
    </div>
  )
}

export function Skeleton({ className = '', lines = 1 }) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded bg-[#21262d] shimmer-line mb-2"
          style={{ width: i === lines - 1 ? '65%' : '100%' }}
        />
      ))}
    </div>
  )
}

export function ResultCard({ title, value, sub, color = '#13b88e', icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card flex flex-col gap-1 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at 80% 20%, ${color}, transparent 60%)` }} />
      {Icon && <Icon size={18} className="mb-1" style={{ color }} />}
      <p className="text-xs text-[#8b949e] uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-[#484f58]">{sub}</p>}
    </motion.div>
  )
}
