import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Target, Calculator, MessageCircle, Menu, X, Sparkles, Goal, Wallet, Globe } from 'lucide-react'
import useStore from '@/store'
import { LANGUAGE_LABELS, LANGUAGE_NAMES } from '@/utils/i18n'

const NAV = [
  { to: '/score', label: 'BMS Score', icon: BarChart3 },
  { to: '/planner', label: 'FIRE Planner', icon: Target },
  { to: '/tax', label: 'Tax Optimizer', icon: Calculator },
  { to: '/goals', label: 'Goals', icon: Goal },
  { to: '/spending', label: 'Spending', icon: Wallet },
  { to: '/chat', label: 'AI Chat', icon: MessageCircle },
]

export default function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const language = useStore((s) => s.language)
  const setLanguage = useStore((s) => s.setLanguage)
  const langRef = useRef(null)

  useEffect(() => { const fn = () => setScrolled(window.scrollY > 20); window.addEventListener('scroll', fn); return () => window.removeEventListener('scroll', fn) }, [])
  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => { const fn = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false) }; document.addEventListener('mousedown', fn); return () => document.removeEventListener('mousedown', fn) }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#080c10]/90 backdrop-blur-xl border-b border-white/5 shadow-[0_2px_20px_rgba(0,0,0,0.6)]' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shadow-glow-green"><Sparkles size={16} className="text-white" /></div>
          <span className="font-bold text-base tracking-tight"><span className="gradient-text">SmartSaathi</span><span className="text-brand-400 font-black">AI</span></span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to
            return (
              <Link key={to} to={to} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${active ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-white/5'}`}>
                <Icon size={14} />{label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <div ref={langRef} className="relative">
            <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#8b949e] hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
              <Globe size={13} />{LANGUAGE_LABELS[language]}
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.95 }} transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1 bg-[#161b22] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[120px]">
                  {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                    <button key={code} onClick={() => { setLanguage(code); setLangOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between ${language === code ? 'bg-brand-500/10 text-brand-400' : 'text-[#8b949e] hover:bg-white/5 hover:text-white'}`}>
                      {name}<span className="text-[10px] opacity-50">{LANGUAGE_LABELS[code]}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link to="/score" className="btn-primary text-xs py-2 px-4 rounded-lg">Get Your Score</Link>
        </div>

        <button className="lg:hidden p-2 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/5 transition-colors" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}
            className="lg:hidden bg-[#0d1117]/95 backdrop-blur-xl border-b border-white/5 px-4 pb-4">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to
              return (
                <Link key={to} to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl my-1 text-sm font-medium transition-all ${active ? 'bg-brand-500/10 text-brand-400' : 'text-[#8b949e]'}`}>
                  <Icon size={16} />{label}
                </Link>
              )
            })}
            <div className="flex items-center gap-2 px-4 py-2 mt-1">
              <Globe size={14} className="text-[#484f58]" />
              {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                <button key={code} onClick={() => setLanguage(code)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${language === code ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30' : 'text-[#484f58] hover:text-white'}`}>
                  {label}
                </button>
              ))}
            </div>
            <Link to="/score" className="btn-primary w-full text-center mt-2 block">Get Your Score Free</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
