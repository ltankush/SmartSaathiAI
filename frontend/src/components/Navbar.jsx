import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Target, Calculator, MessageCircle, Menu, X, Sparkles } from 'lucide-react'

const NAV = [
  { to: '/score', label: 'BMS Score', icon: BarChart3 },
  { to: '/planner', label: 'FIRE Planner', icon: Target },
  { to: '/tax', label: 'Tax Optimizer', icon: Calculator },
  { to: '/chat', label: 'AI Chat', icon: MessageCircle },
]

export default function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setOpen(false), [location.pathname])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#080c10]/90 backdrop-blur-xl border-b border-white/5 shadow-[0_2px_20px_rgba(0,0,0,0.6)]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shadow-glow-green">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">
            <span className="gradient-text">SmartSaathi</span>
            <span className="text-brand-400 font-black">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-white/5'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* CTA desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/score" className="btn-primary text-sm py-2 px-4 rounded-lg">
            Get Your Score
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/5 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="md:hidden bg-[#0d1117]/95 backdrop-blur-xl border-b border-white/5 px-4 pb-4"
          >
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl my-1 text-sm font-medium transition-all ${
                    active ? 'bg-brand-500/10 text-brand-400' : 'text-[#8b949e]'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}
            <Link to="/score" className="btn-primary w-full text-center mt-2 block">
              Get Your Score Free
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
