import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const DIMS = [
  { key: 'emergency', label: 'Emergency', color: '#f59e0b' },
  { key: 'insurance', label: 'Insurance', color: '#3b82f6' },
  { key: 'investments', label: 'Investments', color: '#8b5cf6' },
  { key: 'debt', label: 'Debt Health', color: '#ec4899' },
  { key: 'tax', label: 'Tax', color: '#06b6d4' },
  { key: 'retirement', label: 'Retirement', color: '#13b88e' },
]

function CircularProgress({ score, tierColor, size = 200 }) {
  const [animated, setAnimated] = useState(0)
  const radius = (size - 24) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animated / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0
      const step = score / 60
      const interval = setInterval(() => {
        start += step
        if (start >= score) { setAnimated(score); clearInterval(interval) }
        else setAnimated(Math.round(start))
      }, 16)
      return () => clearInterval(interval)
    }, 300)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="score-ring -rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#21262d" strokeWidth={12} />
        <circle
          cx={size/2} cy={size/2} r={radius}
          fill="none"
          stroke={tierColor || '#13b88e'}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold" style={{ color: tierColor || '#13b88e' }}>{animated}</span>
        <span className="text-xs text-[#8b949e] mt-0.5">out of 100</span>
      </div>
    </div>
  )
}

function DimensionBar({ label, value, color, delay = 0 }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay + 400)
    return () => clearTimeout(t)
  }, [value, delay])

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#8b949e]">{label}</span>
        <span className="font-semibold" style={{ color }}>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[#21262d] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, background: color, boxShadow: `0 0 8px ${color}60` }}
        />
      </div>
    </div>
  )
}

export default function ScoreCard({ scoreData }) {
  if (!scoreData) return null
  const { total, tier, tier_color, dimensions } = scoreData

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card card-glow max-w-xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Bharat Money Score</h2>
          <p className="text-sm text-[#8b949e] mt-0.5">Your financial health report</p>
        </div>
        <span
          className="text-xs font-semibold px-3 py-1.5 rounded-full border"
          style={{ color: tier_color, borderColor: `${tier_color}40`, background: `${tier_color}15` }}
        >
          {tier}
        </span>
      </div>

      {/* Main score ring */}
      <div className="flex justify-center mb-6">
        <CircularProgress score={total} tierColor={tier_color} size={180} />
      </div>

      {/* Dimension bars */}
      <div className="mt-4">
        {DIMS.map(({ key, label, color }, i) => (
          <DimensionBar
            key={key}
            label={label}
            value={dimensions?.[key] ?? 0}
            color={color}
            delay={i * 80}
          />
        ))}
      </div>
    </motion.div>
  )
}
