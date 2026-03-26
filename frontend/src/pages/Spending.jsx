import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, PieChart, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import PageWrapper from '@/components/PageWrapper'
import { SliderInput } from '@/components/FormComponents'
import { LoadingScreen } from '@/components/UI'
import api, { formatINR } from '@/utils/api'
import useStore from '@/store'

ChartJS.register(ArcElement, Tooltip, Legend)

const CATEGORIES = [
  { key: 'rent', label: 'Rent / Housing', icon: '🏠', color: '#f59e0b', default: 15000 },
  { key: 'food', label: 'Food & Groceries', icon: '🍽️', color: '#22c55e', default: 8000 },
  { key: 'transport', label: 'Transport', icon: '🚗', color: '#3b82f6', default: 3000 },
  { key: 'utilities', label: 'Utilities & Bills', icon: '💡', color: '#8b5cf6', default: 3000 },
  { key: 'shopping', label: 'Shopping', icon: '🛍️', color: '#ec4899', default: 3000 },
  { key: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#06b6d4', default: 2000 },
  { key: 'emi', label: 'EMIs / Loans', icon: '🏦', color: '#ef4444', default: 0 },
  { key: 'health', label: 'Health & Fitness', icon: '💪', color: '#13b88e', default: 1000 },
  { key: 'education', label: 'Education', icon: '📚', color: '#f97316', default: 0 },
  { key: 'other', label: 'Misc / Other', icon: '📦', color: '#64748b', default: 2000 },
]

export default function Spending() {
  const [income, setIncome] = useState(60000)
  const [categories, setCategories] = useState(
    Object.fromEntries(CATEGORIES.map(c => [c.key, c.default]))
  )
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const setCat = (key, val) => setCategories(prev => ({ ...prev, [key]: val }))
  const totalSpending = Object.values(categories).reduce((a, b) => a + b, 0)
  const savings = income - totalSpending

  const submit = async () => {
    setLoading(true); setError(null)
    try {
      const { data } = await api.post('/spending', {
        monthly_income: income,
        categories,
        age: 30,
      })
      setResult(data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const doughnutData = result ? {
    labels: result.chart_data.labels,
    datasets: [{
      data: result.chart_data.values,
      backgroundColor: CATEGORIES.map(c => c.color + 'cc'),
      borderWidth: 0,
      hoverOffset: 8,
    }],
  } : {
    labels: CATEGORIES.map(c => c.label),
    datasets: [{
      data: CATEGORIES.map(c => categories[c.key]),
      backgroundColor: CATEGORIES.map(c => c.color + '80'),
      borderWidth: 0,
      hoverOffset: 8,
    }],
  }

  const doughnutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#161b22',
        borderColor: '#30363d',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${formatINR(ctx.parsed)} (${((ctx.parsed / income) * 100).toFixed(0)}%)`,
        },
      },
    },
  }

  if (loading) return <PageWrapper><LoadingScreen message="Analyzing your spending patterns..." /></PageWrapper>

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center"
          >
            <Wallet size={18} className="text-pink-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Spending Analyzer</h1>
        </div>
        <p className="text-sm text-[#8b949e] mb-10 ml-12">Know where your money goes. AI-powered spending audit.</p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Sliders */}
          <div className="space-y-4">
            <div className="card">
              <SliderInput label="Monthly income" min={10000} max={500000} step={5000}
                value={income} onChange={setIncome} format={formatINR} />
            </div>

            <div className="card">
              <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Monthly spending by category</h2>
              {CATEGORIES.map(({ key, label, icon, color }) => (
                <SliderInput
                  key={key}
                  label={`${icon} ${label}`}
                  min={0}
                  max={Math.min(income, key === 'rent' ? 200000 : 100000)}
                  step={500}
                  value={categories[key]}
                  onChange={(v) => setCat(key, v)}
                  format={formatINR}
                />
              ))}
            </div>

            {/* Live summary */}
            <div className="card flex justify-between items-center">
              <div>
                <p className="text-xs text-[#8b949e]">Total spending</p>
                <p className="text-lg font-bold text-white">{formatINR(totalSpending)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#8b949e]">Monthly savings</p>
                <p className={`text-lg font-bold ${savings >= 0 ? 'text-brand-400' : 'text-red-400'}`}>
                  {formatINR(Math.abs(savings))}
                  {savings < 0 && <span className="text-xs"> deficit!</span>}
                </p>
              </div>
            </div>

            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={submit}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Analyze My Spending <PieChart size={16} />
            </motion.button>
          </div>

          {/* Right: Results */}
          <div className="space-y-5">
            {/* Live doughnut chart */}
            <div className="card p-4">
              <h3 className="text-xs text-[#8b949e] uppercase tracking-wide mb-4">Spending distribution</h3>
              <div style={{ height: 260 }} className="flex items-center justify-center">
                <Doughnut data={doughnutData} options={doughnutOpts} />
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 gap-1 mt-4">
                {CATEGORIES.filter(c => categories[c.key] > 0).map(c => (
                  <div key={c.key} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                    <span className="text-[#8b949e]">{c.label}</span>
                    <span className="text-white font-medium ml-auto">{((categories[c.key] / income) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {result && (
              <>
                {/* 50/30/20 rule */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wide mb-3">50/30/20 Rule Check</h3>
                  {Object.entries(result.rule_503020).map(([key, data]) => (
                    <div key={key} className="flex items-center justify-between mb-3 last:mb-0">
                      <div className="flex items-center gap-2">
                        {data.status === 'ok' ? (
                          <CheckCircle size={14} className="text-brand-400" />
                        ) : (
                          <AlertTriangle size={14} className="text-amber-400" />
                        )}
                        <span className="text-sm text-white capitalize">{key}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${data.status === 'ok' ? 'text-brand-400' : 'text-amber-400'}`}>
                          {data.pct}%
                        </span>
                        <span className="text-xs text-[#484f58] ml-2">ideal: {data.ideal}%</span>
                      </div>
                    </div>
                  ))}
                </motion.div>

                {/* Alerts */}
                {result.alerts?.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={14} className="text-amber-400" />
                      <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Over-budget alerts</h3>
                    </div>
                    {result.alerts.map((a, i) => (
                      <p key={i} className="text-xs text-[#8b949e] mb-2 pl-4 border-l-2 border-amber-500/30">{a}</p>
                    ))}
                  </motion.div>
                )}

                {/* AI analysis */}
                {result.ai_analysis && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="card" style={{ borderColor: 'rgba(19,184,142,0.2)' }}>
                    <p className="text-xs text-brand-400 font-semibold uppercase tracking-wide mb-2">🤖 SmartSaathi's spending audit</p>
                    <p className="text-sm text-[#c9d1d9] leading-relaxed">{result.ai_analysis}</p>
                  </motion.div>
                )}

                {/* Savings rate badge */}
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                  className="card text-center" style={{ borderColor: result.savings_rate >= 20 ? '#13b88e30' : '#f59e0b30' }}>
                  <TrendingDown size={20} className={result.savings_rate >= 20 ? 'text-brand-400' : 'text-amber-400'} style={{ margin: '0 auto' }} />
                  <p className={`text-2xl font-bold mt-1 ${result.savings_rate >= 20 ? 'text-brand-400' : 'text-amber-400'}`}>
                    {result.savings_rate}%
                  </p>
                  <p className="text-xs text-[#8b949e]">
                    saving rate {result.savings_rate >= 20 ? '✅ Healthy' : '⚠️ Needs improvement (aim for 20%+)'}
                  </p>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
