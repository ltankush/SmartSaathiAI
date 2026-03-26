import React, { Suspense } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, Target, Calculator, MessageCircle, ShieldCheck, Zap, Globe, ArrowRight, TrendingUp, Users, Star } from 'lucide-react'
import PageWrapper from '@/components/PageWrapper'
import HeroOrb from '@/components/HeroOrb'

const FEATURES = [
  {
    icon: BarChart3, color: '#f59e0b', to: '/score',
    title: 'Bharat Money Score',
    desc: 'Get your personalised financial health score across 6 dimensions — emergency fund, insurance, investments, debt, tax & retirement.',
  },
  {
    icon: Target, color: '#8b5cf6', to: '/planner',
    title: 'FIRE Path Planner',
    desc: 'Input your age and income. Get a month-by-month roadmap with exact SIP amounts, PPF/NPS splits, and your target FIRE corpus.',
  },
  {
    icon: Calculator, color: '#3b82f6', to: '/tax',
    title: 'Tax Regime Optimizer',
    desc: 'Old vs New regime — calculated with your exact numbers. Finds every missed deduction and tells you exactly how much you save.',
  },
  {
    icon: MessageCircle, color: '#13b88e', to: '/chat',
    title: 'AI Money Mentor',
    desc: 'Chat in Hinglish with SmartSaathi. Ask anything from SIP basics to advanced NPS strategies. Voice input supported.',
  },
]

const STATS = [
  { val: '14Cr+', label: 'Demat accounts in India', icon: Users },
  { val: '95%', label: 'Indians without a financial plan', icon: TrendingUp },
  { val: '₹25K+', label: 'Annual cost of a human advisor', icon: Star },
  { val: '100%', label: 'Free, forever', icon: Zap },
]

const TRUST = [
  { icon: ShieldCheck, label: 'No login required', sub: 'Completely anonymous' },
  { icon: Zap, label: 'Instant AI responses', sub: 'Powered by Groq' },
  { icon: Globe, label: 'Works in Hinglish', sub: 'Voice + text input' },
]

function FeatureCard({ icon: Icon, color, to, title, desc, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.1 }}
    >
      <Link
        to={to}
        className="block card glass-hover group h-full"
        style={{ '--glow': color }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <h3 className="text-base font-semibold text-white mb-2 group-hover:text-brand-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-[#8b949e] leading-relaxed">{desc}</p>
        <div className="flex items-center gap-1 mt-4 text-xs font-medium" style={{ color }}>
          Try now <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </motion.div>
  )
}

export default function Home() {
  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center overflow-hidden px-4">
        {/* Background glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #13b88e, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center py-20">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
              style={{ background: 'rgba(19,184,142,0.1)', border: '1px solid rgba(19,184,142,0.2)', color: '#13b88e' }}>
              <Zap size={11} /> Built for ET GenAI Hackathon 2026
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white mb-6">
              India ka apna{' '}
              <span className="gradient-text">AI Money</span>
              <br />Mentor — Free
            </h1>

            <p className="text-lg text-[#8b949e] leading-relaxed mb-8 max-w-lg">
              95% of Indians don't have a financial plan. Advisors charge ₹25,000/year.{' '}
              <strong className="text-white">SmartSaathiAI</strong> gives you a complete financial roadmap in 5 minutes — completely free, forever.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link to="/score" className="btn-primary flex items-center gap-2">
                Get My BMS Score <ArrowRight size={16} />
              </Link>
              <Link to="/chat" className="btn-ghost flex items-center gap-2">
                <MessageCircle size={16} /> Chat with SmartSaathi
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4">
              {TRUST.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={14} className="text-brand-400" />
                  <div>
                    <p className="text-xs font-medium text-white">{label}</p>
                    <p className="text-xs text-[#484f58]">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: 3D Orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="hidden lg:block"
          >
            <Suspense fallback={<div className="w-full h-[420px] rounded-3xl bg-[#0d1117]" />}>
              <HeroOrb className="w-full h-[420px]" />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-white/5 bg-[#0d1117]/50">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(({ val, label, icon: Icon }, i) => (
            <motion.div
              key={val}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center text-center gap-2"
            >
              <Icon size={20} className="text-brand-400" />
              <p className="text-2xl font-bold text-white">{val}</p>
              <p className="text-xs text-[#8b949e]">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl font-bold text-white mb-3">
            Everything you need to <span className="gradient-text">take control</span>
          </h2>
          <p className="text-[#8b949e] max-w-xl mx-auto">
            Four powerful tools. All free. Built specifically for India's financial reality.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => <FeatureCard key={f.to} {...f} index={i} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card card-glow text-center py-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 50% 50%, #13b88e, transparent 70%)' }} />
          <h2 className="text-3xl font-bold text-white mb-3 relative">
            Apna financial future <span className="gradient-text">abhi start karo</span>
          </h2>
          <p className="text-[#8b949e] mb-8 max-w-md mx-auto relative">
            No signup. No credit card. No advisor fees. Just your numbers and an AI that actually understands India.
          </p>
          <Link to="/score" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5 relative">
            Get My Free BMS Score <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-[#484f58]">
        <p>SmartSaathiAI — ET GenAI Hackathon 2026 · Built with Groq + Llama + FastAPI</p>
        <p className="mt-1">Investments mein risk hota hai. Always consult a SEBI-registered advisor for large decisions.</p>
      </footer>
    </PageWrapper>
  )
}
