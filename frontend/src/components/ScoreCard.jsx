import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

const DIMS = [
  { key: 'emergency', label: 'Emergency', color: '#f59e0b' },
  { key: 'insurance', label: 'Insurance', color: '#3b82f6' },
  { key: 'investments', label: 'Investments', color: '#8b5cf6' },
  { key: 'debt', label: 'Debt Health', color: '#ec4899' },
  { key: 'tax', label: 'Tax', color: '#06b6d4' },
  { key: 'retirement', label: 'Retirement', color: '#13b88e' },
]

function useConfetti() {
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const [showCanvas, setShowCanvas] = useState(false)

  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  const fire = useCallback(() => {
    setShowCanvas(true)
    // Wait for React to mount the canvas
    requestAnimationFrame(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const particles = []
      const colors = ['#13b88e', '#5de8c3', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#22c55e', '#ffffff']
      for (let i = 0; i < 150; i++) {
        particles.push({
          x: canvas.width / 2 + (Math.random() - 0.5) * 200,
          y: Math.max(0, canvas.height / 2 - 100),
          vx: (Math.random() - 0.5) * 20,
          vy: -Math.random() * 18 - 5,
          size: Math.random() * 8 + 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          vr: (Math.random() - 0.5) * 12,
          gravity: 0.4,
          opacity: 1,
          shape: Math.random() > 0.5 ? 'rect' : 'circle',
        })
      }
      let frame = 0
      const maxFrames = 120
      function animate() {
        if (frame > maxFrames) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          setShowCanvas(false)
          return
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        for (const p of particles) {
          p.x += p.vx
          p.vy += p.gravity
          p.y += p.vy
          p.rotation += p.vr
          p.opacity = Math.max(0, 1 - frame / maxFrames)
          p.vx *= 0.98
          ctx.save()
          ctx.globalAlpha = p.opacity
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rotation * Math.PI) / 180)
          ctx.fillStyle = p.color
          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
          } else {
            ctx.beginPath()
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.restore()
        }
        frame++
        animationFrameRef.current = requestAnimationFrame(animate)
      }
      stop() // stop any existing
      animate()
    })
  }, [stop])

  return { canvasRef, fire, showCanvas }
}

function CircularProgress({ score, tierColor, size = 200 }) {
  const [animated, setAnimated] = useState(0)
  const [showGlow, setShowGlow] = useState(false)
  const radius = (size - 24) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animated / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0
      const step = Math.max(score / 60, 0.5)
      const interval = setInterval(() => {
        start += step
        if (start >= score) {
          setAnimated(score)
          clearInterval(interval)
          setShowGlow(true)
        } else {
          setAnimated(Math.round(start))
        }
      }, 16)
      return () => clearInterval(interval)
    }, 300)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {showGlow && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1.3 }}
          transition={{ duration: 1 }}
          className="absolute rounded-full"
          style={{
            width: size * 0.8, height: size * 0.8,
            background: `radial-gradient(circle, ${tierColor}40, transparent 70%)`,
            filter: 'blur(20px)',
          }}
        />
      )}
      <svg width={size} height={size} className="score-ring -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#21262d" strokeWidth={12} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={tierColor || '#13b88e'} strokeWidth={12} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          key={animated}
          className="text-4xl font-bold"
          style={{ color: tierColor || '#13b88e' }}
          initial={animated === score ? { scale: 1.3 } : {}}
          animate={animated === score ? { scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {animated}
        </motion.span>
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
        <motion.span
          className="font-semibold" style={{ color }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: delay / 1000 + 0.4 }}
        >
          {value}
        </motion.span>
      </div>
      <div className="h-2.5 rounded-full bg-[#21262d] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: `0 0 12px ${color}60`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.8, delay: delay / 1000 + 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default function ScoreCard({ scoreData }) {
  const { canvasRef, fire, showCanvas } = useConfetti()
  const hasFired = useRef(false)

  const total = scoreData?.total ?? 0
  const tier = scoreData?.tier ?? ''
  const tier_color = scoreData?.tier_color ?? '#13b88e'
  const dimensions = scoreData?.dimensions ?? {}

  useEffect(() => {
    if (total >= 60 && !hasFired.current) {
      hasFired.current = true
      setTimeout(() => fire(), 1200)
    }
  }, [total, fire])

  if (!scoreData) return null

  const isLowScore = total < 40

  return (
    <>
      {/* Canvas is always mounted but hidden securely via CSS to avoid ref race conditions */}
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ${showCanvas ? 'opacity-100 z-[100]' : 'opacity-0 -z-50 invisible'}`}
        width={typeof window !== 'undefined' ? window.innerWidth : 1200}
        height={typeof window !== 'undefined' ? window.innerHeight : 800}
        style={{ width: '100vw', height: '100vh', background: 'transparent' }}
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1, x: isLowScore ? [0, -4, 4, -3, 3, -1, 1, 0] : 0 }}
        transition={{ duration: 0.6 }}
        className="card card-glow max-w-xl mx-auto relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-6 relative">
          <div>
            <h2 className="text-xl font-bold text-white">Bharat Money Score</h2>
            <p className="text-sm text-[#8b949e] mt-0.5">Your financial health report</p>
          </div>
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, type: 'spring', stiffness: 200 }}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border"
            style={{ color: tier_color, borderColor: `${tier_color}40`, background: `${tier_color}15` }}
          >
            {tier}
          </motion.span>
        </div>

        <div className="flex justify-center mb-6 relative">
          <CircularProgress score={total} tierColor={tier_color} size={180} />
        </div>

        <div className="mt-4 relative">
          {DIMS.map(({ key, label, color }, i) => (
            <DimensionBar
              key={key}
              label={label}
              value={dimensions[key] ?? 0}
              color={color}
              delay={i * 80}
            />
          ))}
        </div>
      </motion.div>
    </>
  )
}
