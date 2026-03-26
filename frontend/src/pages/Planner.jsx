import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, TrendingUp, Calendar, PiggyBank } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js'
import PageWrapper from '@/components/PageWrapper'
import { SliderInput } from '@/components/FormComponents'
import { LoadingScreen, ResultCard } from '@/components/UI'
import api, { formatINR } from '@/utils/api'
import useStore from '@/store'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const initial = {
  current_age: 25, monthly_income: 60000, monthly_expenses: 40000,
  current_savings: 100000, fire_age: 45, inflation_rate: 6, equity_return: 12,
}

export default function Planner() {
  const [form, setForm] = useState(initial)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const setFirePlan = useStore((s) => s.setFirePlan)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async () => {
    setLoading(true); setError(null)
    try {
      const { data } = await api.post('/planner', form)
      setResult(data)
      setFirePlan(data.plan)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const chartData = result ? {
    labels: result.chart_data.labels.map((a) => `Age ${a}`),
    datasets: [
      {
        label: 'Your corpus',
        data: result.chart_data.corpus,
        borderColor: '#13b88e',
        backgroundColor: 'rgba(19,184,142,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#13b88e',
        pointRadius: 5,
      },
      {
        label: 'FIRE target',
        data: result.chart_data.target,
        borderColor: '#f59e0b',
        borderDash: [6, 4],
        backgroundColor: 'transparent',
        fill: false,
        tension: 0,
        pointRadius: 0,
      },
    ],
  } : null

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#8b949e', font: { size: 12 } } },
      tooltip: {
        backgroundColor: '#161b22',
        borderColor: '#30363d',
        borderWidth: 1,
        titleColor: '#e6edf3',
        bodyColor: '#8b949e',
        callbacks: { label: (ctx) => ` ${formatINR(ctx.parsed.y)}` },
      },
    },
    scales: {
      x: { ticks: { color: '#484f58', font: { size: 11 } }, grid: { color: '#21262d' } },
      y: {
        ticks: { color: '#484f58', font: { size: 11 }, callback: (v) => formatINR(v) },
        grid: { color: '#21262d' },
      },
    },
  }

  if (loading) return <PageWrapper><LoadingScreen message="Building your FIRE roadmap..." /></PageWrapper>

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Target size={18} className="text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">FIRE Path Planner</h1>
        </div>
        <p className="text-sm text-[#8b949e] mb-10 ml-12">Financial Independence, Retire Early — planned for India.</p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="card">
            <h2 className="text-sm font-semibold text-white mb-6 uppercase tracking-wide">Your details</h2>
            <SliderInput label="Current age" min={18} max={55} value={form.current_age} onChange={(v) => set('current_age', v)} format={(v) => `${v} yrs`} />
            <SliderInput label="Target FIRE age" min={form.current_age + 5} max={65} value={form.fire_age} onChange={(v) => set('fire_age', v)} format={(v) => `${v} yrs`} hint={`${form.fire_age - form.current_age} years to go`} />
            <SliderInput label="Monthly income" min={10000} max={500000} step={5000} value={form.monthly_income} onChange={(v) => set('monthly_income', v)} format={formatINR} />
            <SliderInput label="Monthly expenses" min={5000} max={400000} step={2000} value={form.monthly_expenses} onChange={(v) => set('monthly_expenses', v)} format={formatINR} />
            <SliderInput label="Current savings / investments" min={0} max={10000000} step={50000} value={form.current_savings} onChange={(v) => set('current_savings', v)} format={formatINR} />
            <SliderInput label="Expected equity return" min={8} max={18} value={form.equity_return} onChange={(v) => set('equity_return', v)} format={(v) => `${v}%`} hint="Historical Nifty 50 avg ~12%" />
            <SliderInput label="Inflation rate" min={3} max={10} value={form.inflation_rate} onChange={(v) => set('inflation_rate', v)} format={(v) => `${v}%`} hint="India CPI avg ~6%" />

            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 mb-4">{error}</div>}
            <button onClick={submit} className="btn-primary w-full flex items-center justify-center gap-2">
              Calculate My FIRE Plan <Target size={16} />
            </button>
          </div>

          {/* Results */}
          {result ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <ResultCard title="FIRE corpus needed" value={formatINR(result.plan.fire_corpus_needed)} sub="At target age" icon={PiggyBank} />
                <ResultCard title="Monthly SIP needed" value={formatINR(result.plan.monthly_sip_needed)} sub="Starting today" color="#8b5cf6" icon={TrendingUp} />
                <ResultCard title="Years to FIRE" value={`${result.plan.years_to_fire} yrs`} sub={`Retire at ${form.fire_age}`} color="#f59e0b" icon={Calendar} />
                <ResultCard title="Monthly surplus" value={formatINR(result.plan.monthly_surplus)} sub="Available to invest" color={result.plan.is_achievable ? '#13b88e' : '#ef4444'} />
              </div>

              {/* Chart */}
              <div className="card p-4">
                <h3 className="text-xs text-[#8b949e] uppercase tracking-wide mb-4">Corpus growth vs target</h3>
                <div style={{ height: 220 }}>
                  <Line data={chartData} options={chartOpts} />
                </div>
              </div>

              {/* Allocation */}
              <div className="card">
                <h3 className="text-xs text-[#8b949e] uppercase tracking-wide mb-3">Recommended allocation</h3>
                {Object.entries(result.allocation).map(([name, info]) => (
                  <div key={name} className="mb-3 last:mb-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white font-medium">{name}</span>
                      <span className="text-brand-400">{formatINR(info.monthly)}/mo</span>
                    </div>
                    <p className="text-xs text-[#484f58]">{info.rationale}</p>
                    <p className="text-xs text-[#8b949e] mt-0.5">Projected: {formatINR(info.projected)}</p>
                  </div>
                ))}
              </div>

              {/* AI narrative */}
              {result.ai_narrative && (
                <div className="card" style={{ borderColor: 'rgba(19,184,142,0.2)' }}>
                  <p className="text-xs text-brand-400 font-semibold uppercase tracking-wide mb-2">SmartSaathi's roadmap</p>
                  <p className="text-sm text-[#c9d1d9] leading-relaxed">{result.ai_narrative}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-[#484f58]">
                <Target size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Fill in your details and click Calculate</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
