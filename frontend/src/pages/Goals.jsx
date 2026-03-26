import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Goal, Plus, Trash2, TrendingUp, Home, GraduationCap, Car, Plane, Heart, Target, Sparkles } from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import PageWrapper from '@/components/PageWrapper'
import { SliderInput, Input } from '@/components/FormComponents'
import { LoadingScreen } from '@/components/UI'
import api, { formatINR } from '@/utils/api'
import useStore from '@/store'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const PRESETS = [
  { name: 'Buy a House', icon: Home, target: 5000000, years: 10, color: '#f59e0b' },
  { name: "Child's Education", icon: GraduationCap, target: 2500000, years: 15, color: '#3b82f6' },
  { name: 'Buy a Car', icon: Car, target: 1000000, years: 3, color: '#8b5cf6' },
  { name: 'Dream Vacation', icon: Plane, target: 300000, years: 2, color: '#ec4899' },
  { name: 'Wedding Fund', icon: Heart, target: 2000000, years: 5, color: '#ef4444' },
  { name: 'Emergency Corpus', icon: Target, target: 600000, years: 2, color: '#13b88e' },
]

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [income, setIncome] = useState(60000)

  const addPreset = (preset) => {
    setGoals([...goals, {
      id: Date.now(),
      name: preset.name,
      target_amount: preset.target,
      years: preset.years,
      current_savings: 0,
      priority: 'medium',
      color: preset.color,
    }])
  }

  const addCustom = () => {
    setGoals([...goals, {
      id: Date.now(),
      name: 'Custom Goal',
      target_amount: 500000,
      years: 5,
      current_savings: 0,
      priority: 'medium',
      color: '#06b6d4',
    }])
  }

  const removeGoal = (id) => setGoals(goals.filter(g => g.id !== id))

  const updateGoal = (id, key, val) => {
    setGoals(goals.map(g => g.id === id ? { ...g, [key]: val } : g))
  }

  const submit = async () => {
    if (goals.length === 0) return
    setLoading(true); setError(null)
    try {
      const { data } = await api.post('/goals', {
        goals: goals.map(g => ({
          name: g.name,
          target_amount: g.target_amount,
          years: g.years,
          current_savings: g.current_savings,
          priority: g.priority,
        })),
        monthly_income: income,
        age: 30,
      })
      setResult(data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const chartData = result ? {
    labels: result.chart_data.labels,
    datasets: [
      {
        label: 'Monthly SIP needed',
        data: result.chart_data.sips,
        backgroundColor: goals.map(g => g.color + 'cc'),
        borderRadius: 8,
      },
    ],
  } : null

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#8b949e' } },
      tooltip: {
        backgroundColor: '#161b22', borderColor: '#30363d', borderWidth: 1,
        callbacks: { label: (ctx) => ` ${formatINR(ctx.parsed.y)}/mo` },
      },
    },
    scales: {
      x: { ticks: { color: '#484f58' }, grid: { display: false } },
      y: { ticks: { color: '#484f58', callback: (v) => formatINR(v) }, grid: { color: '#21262d' } },
    },
  }

  if (loading) return <PageWrapper><LoadingScreen message="Planning your financial goals..." /></PageWrapper>

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center"
          >
            <Goal size={18} className="text-cyan-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Goal-Based Planner</h1>
        </div>
        <p className="text-sm text-[#8b949e] mb-8 ml-12">Plan for your house, car, education, or any dream — with exact SIP amounts.</p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Goal setup */}
          <div className="space-y-5">
            {/* Monthly income */}
            <div className="card">
              <SliderInput label="Monthly income" min={10000} max={500000} step={5000}
                value={income} onChange={setIncome} format={formatINR} />
            </div>

            {/* Preset goals */}
            <div className="card">
              <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide mb-3">Quick add goals</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESETS.map((p) => {
                  const Icon = p.icon
                  const added = goals.some(g => g.name === p.name)
                  return (
                    <motion.button
                      key={p.name}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => !added && addPreset(p)}
                      disabled={added}
                      className={`p-3 rounded-xl text-left transition-all border ${
                        added ? 'bg-brand-500/10 border-brand-500/30 opacity-60' : 'bg-[#0d1117] border-white/5 hover:border-white/15'
                      }`}
                    >
                      <Icon size={16} style={{ color: p.color }} className="mb-1.5" />
                      <p className="text-xs font-medium text-white">{p.name}</p>
                      <p className="text-[10px] text-[#484f58]">{formatINR(p.target)}</p>
                    </motion.button>
                  )
                })}
              </div>
              <button onClick={addCustom} className="btn-ghost w-full mt-3 text-xs flex items-center justify-center gap-2">
                <Plus size={14} /> Add Custom Goal
              </button>
            </div>

            {/* Goal cards */}
            <AnimatePresence>
              {goals.map((g) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="card relative"
                  style={{ borderColor: g.color + '30' }}
                >
                  <button onClick={() => removeGoal(g.id)} className="absolute top-3 right-3 text-[#484f58] hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                  <input
                    value={g.name}
                    onChange={(e) => updateGoal(g.id, 'name', e.target.value)}
                    className="bg-transparent text-sm font-semibold text-white outline-none mb-3 w-full"
                  />
                  <SliderInput label="Target amount" min={50000} max={20000000} step={50000}
                    value={g.target_amount} onChange={(v) => updateGoal(g.id, 'target_amount', v)} format={formatINR} />
                  <SliderInput label="Timeline" min={1} max={30}
                    value={g.years} onChange={(v) => updateGoal(g.id, 'years', v)} format={(v) => `${v} years`} />
                  <SliderInput label="Savings towards this goal" min={0} max={g.target_amount} step={10000}
                    value={g.current_savings} onChange={(v) => updateGoal(g.id, 'current_savings', v)} format={formatINR} />
                </motion.div>
              ))}
            </AnimatePresence>

            {goals.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={submit}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Calculate All Goals <Sparkles size={16} />
              </motion.button>
            )}
            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}
          </div>

          {/* Right: Results */}
          {result ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              {/* Summary */}
              <div className="card card-glow text-center">
                <p className="text-xs text-[#8b949e] uppercase tracking-wide">Total monthly SIP needed</p>
                <p className="text-3xl font-bold text-brand-400 mt-1">{formatINR(result.total_monthly_sip)}</p>
                <p className="text-xs text-[#484f58] mt-1">
                  {result.total_monthly_sip <= income * 0.5 ? '✅ Achievable' : '⚠️ May need prioritization'}
                </p>
              </div>

              {/* Per goal breakdown */}
              {result.goals.map((g, i) => (
                <motion.div
                  key={g.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card p-4"
                  style={{ borderColor: goals[i]?.color + '20' }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{g.name}</p>
                      <p className="text-xs text-[#484f58]">{g.years} years • {g.annual_return_assumed}% returns</p>
                    </div>
                    <p className="text-sm font-bold" style={{ color: goals[i]?.color || '#13b88e' }}>
                      {formatINR(g.monthly_sip_needed)}/mo
                    </p>
                  </div>
                  <div className="flex justify-between text-xs text-[#8b949e]">
                    <span>Target: {formatINR(g.target)}</span>
                    <span>Projected: {formatINR(g.projected_value)}</span>
                  </div>
                </motion.div>
              ))}

              {/* Chart */}
              <div className="card p-4">
                <h3 className="text-xs text-[#8b949e] uppercase tracking-wide mb-4">Monthly SIP per goal</h3>
                <div style={{ height: 220 }}>
                  <Bar data={chartData} options={chartOpts} />
                </div>
              </div>

              {/* AI narrative */}
              {result.ai_narrative && (
                <div className="card" style={{ borderColor: 'rgba(19,184,142,0.2)' }}>
                  <p className="text-xs text-brand-400 font-semibold uppercase tracking-wide mb-2">🤖 SmartSaathi's goal strategy</p>
                  <p className="text-sm text-[#c9d1d9] leading-relaxed">{result.ai_narrative}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-[#484f58]">
                <Goal size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Add goals and click Calculate</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
