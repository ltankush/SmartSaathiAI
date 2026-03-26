import React, { Suspense, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Target, Calculator, MessageCircle, ShieldCheck, Zap, Globe, ArrowRight, TrendingUp, Users, Star, Goal, Wallet, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react'
import PageWrapper from '@/components/PageWrapper'
import HeroOrb from '@/components/HeroOrb'

const FEATURES = [
  { icon: BarChart3, color: '#f59e0b', to: '/score', title: 'Bharat Money Score', desc: 'Get your personalised financial health score across 6 dimensions.' },
  { icon: Target, color: '#8b5cf6', to: '/planner', title: 'FIRE Path Planner', desc: 'Input your age and income. Get a month-by-month FIRE roadmap with SIP amounts.' },
  { icon: Calculator, color: '#3b82f6', to: '/tax', title: 'Tax Regime Optimizer', desc: 'Old vs New regime calculated with your exact numbers. FY 2025-26.' },
  { icon: MessageCircle, color: '#13b88e', to: '/chat', title: 'AI Money Mentor', desc: 'Chat in Hinglish with SmartSaathi. Voice input + agentic tool calling.' },
  { icon: Goal, color: '#06b6d4', to: '/goals', title: 'Goal-Based Planner', desc: 'Plan for house, car, education with preset goals and exact monthly SIP.' },
  { icon: Wallet, color: '#ec4899', to: '/spending', title: 'Spending Analyzer', desc: 'Know where your money goes. AI-powered spending audit with 50/30/20 rule.' },
]

const STATS = [
  { val: '14Cr+', label: 'Demat accounts in India', icon: Users },
  { val: '95%', label: 'Indians without a financial plan', icon: TrendingUp },
  { val: '25K+', label: 'Annual cost of a human advisor', icon: Star },
  { val: '100%', label: 'Free, forever', icon: Zap },
]

const TRUST = [
  { icon: ShieldCheck, label: 'No login required', sub: 'Completely anonymous' },
  { icon: Zap, label: 'Agentic AI tools', sub: 'Real-time calculations' },
  { icon: Globe, label: 'Works in Hinglish', sub: '4 languages supported' },
]

function getSeasonalTips() {
  const month = new Date().getMonth()
  const tips = [
    { text: 'Start a SIP of even 500/month in a Nifty 50 index fund. Over 25 years at 12%, it grows to 9.4 lakhs!', category: 'Investing', icon: '📈' },
    { text: 'Get a health insurance of at least 10L. A single hospital stay can wipe out years of savings.', category: 'Insurance', icon: '🛡️' },
    { text: 'Keep 6 months of expenses in a liquid fund or savings account before investing elsewhere.', category: 'Emergency', icon: '🆘' },
    { text: 'Review your asset allocation every year. Equity % should roughly be (100 - your age).', category: 'Portfolio', icon: '⚖️' },
    { text: 'NPS gives an extra 50,000 deduction under 80CCD(1B) over and above the 1.5L 80C limit!', category: 'Tax', icon: '🧾' },
  ]
  if (month >= 0 && month <= 2) tips.unshift({ text: 'FY ending soon! Review your 80C investments. ELSS lock-in is just 3 years.', category: 'Tax Planning', icon: '⏰' })
  if (month >= 6 && month <= 8) tips.unshift({ text: 'ITR filing season is here. File before July 31 to avoid 5,000 late fee.', category: 'Tax Filing', icon: '📄' })
  if (month >= 9 && month <= 10) tips.unshift({ text: 'Diwali bonus coming? Put at least 50% into SIP or PPF before spending.', category: 'Bonus', icon: '🎉' })
  return tips
}

function TipsCarousel() {
  const tips = getSeasonalTips()
  const [current, setCurrent] = useState(0)
  useEffect(() => { const i = setInterval(() => setCurrent(c => (c + 1) % tips.length), 5000); return () => clearInterval(i) }, [tips.length])

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <button onClick={() => setCurrent(c => (c - 1 + tips.length) % tips.length)} className="w-8 h-8 rounded-full bg-[#21262d] flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-[#30363d] transition-colors shrink-0">
          <ChevronLeft size={14} />
        </button>
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}
              className="card p-5 relative overflow-hidden" style={{ borderColor: 'rgba(19,184,142,0.15)' }}>
              <div className="flex items-start gap-3 relative">
                <span className="text-2xl">{tips[current].icon}</span>
                <div>
                  <p className="text-xs text-brand-400 font-semibold uppercase tracking-wide mb-1">{tips[current].category}</p>
                  <p className="text-sm text-[#c9d1d9] leading-relaxed">{tips[current].text}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <button onClick={() => setCurrent(c => (c + 1) % tips.length)} className="w-8 h-8 rounded-full bg-[#21262d] flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-[#30363d] transition-colors shrink-0">
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {tips.map((_, i) => (<button key={i} onClick={() => setCurrent(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-brand-400 w-4' : 'bg-[#30363d]'}`} />))}
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, color, to, title, desc, index }) {
  return (
    <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: index * 0.08 }}>
      <Link to={to} className="block card glass-hover group h-full">
        <motion.div whileHover={{ scale: 1.15, rotate: 5 }} className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon size={20} style={{ color }} />
        </motion.div>
        <h3 className="text-base font-semibold text-white mb-2 group-hover:text-brand-400 transition-colors">{title}</h3>
        <p className="text-sm text-[#8b949e] leading-relaxed">{desc}</p>
        <div className="flex items-center gap-1 mt-4 text-xs font-medium" style={{ color }}>Try now <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" /></div>
      </Link>
    </motion.div>
  )
}

export default function Home() {
  return (
    <PageWrapper>
      <section className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center overflow-hidden px-4">
        <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #13b88e, transparent)' }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }}
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity }} />

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center py-20">
          <motion.div initial={{ opacity: 0, x: -32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
              style={{ background: 'rgba(19,184,142,0.1)', border: '1px solid rgba(19,184,142,0.2)', color: '#13b88e' }}>
              <Zap size={11} /> ET GenAI Hackathon 2026
            </motion.div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white mb-6">
              India ka apna{' '}<span className="gradient-text">AI Money</span><br />Mentor — Free
            </h1>
            <p className="text-lg text-[#8b949e] leading-relaxed mb-8 max-w-lg">
              95% of Indians don't have a financial plan. Advisors charge 25,000/year.{' '}
              <strong className="text-white">SmartSaathiAI</strong> gives you a complete financial roadmap in 5 minutes — with{' '}
              <span className="text-brand-400">real AI-powered calculations</span>.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Link to="/score" className="btn-primary flex items-center gap-2">Get My BMS Score <ArrowRight size={16} /></Link></motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Link to="/chat" className="btn-ghost flex items-center gap-2"><MessageCircle size={16} /> Chat with SmartSaathi</Link></motion.div>
            </div>
            <div className="flex flex-wrap gap-4">
              {TRUST.map(({ icon: Icon, label, sub }, i) => (
                <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="flex items-center gap-2">
                  <Icon size={14} className="text-brand-400" />
                  <div><p className="text-xs font-medium text-white">{label}</p><p className="text-xs text-[#484f58]">{sub}</p></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="hidden lg:block">
            <Suspense fallback={<div className="w-full h-[420px] rounded-3xl bg-[#0d1117]" />}><HeroOrb className="w-full h-[420px]" /></Suspense>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-[#0d1117]/50">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(({ val, label, icon: Icon }, i) => (
            <motion.div key={val} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex flex-col items-center text-center gap-2">
              <Icon size={20} className="text-brand-400" /><p className="text-2xl font-bold text-white">{val}</p><p className="text-xs text-[#8b949e]">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2"><Lightbulb size={18} className="text-amber-400" /><h2 className="text-xl font-bold text-white">Financial Tip of the Day</h2></div>
          <p className="text-sm text-[#8b949e]">Season-aware tips to boost your financial health</p>
        </motion.div>
        <TipsCarousel />
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Everything you need to <span className="gradient-text">take control</span></h2>
          <p className="text-[#8b949e] max-w-xl mx-auto">Six powerful AI-driven tools. All free. Built specifically for India.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{FEATURES.map((f, i) => <FeatureCard key={f.to} {...f} index={i} />)}</div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card card-glow text-center py-16 relative overflow-hidden">
          <h2 className="text-3xl font-bold text-white mb-3 relative">Apna financial future <span className="gradient-text">abhi start karo</span></h2>
          <p className="text-[#8b949e] mb-8 max-w-md mx-auto relative">No signup. No credit card. No advisor fees. Just your numbers and an AI that actually understands India.</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
            <Link to="/score" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5 relative">Get My Free BMS Score <ArrowRight size={18} /></Link>
          </motion.div>
        </motion.div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-[#484f58]">
        <p>SmartSaathiAI v2.0 — ET GenAI Hackathon 2026 | Built with Groq + Llama + FastAPI</p>
        <p className="mt-1">Investments mein risk hota hai. Always consult a SEBI-registered advisor.</p>
      </footer>
    </PageWrapper>
  )
}
