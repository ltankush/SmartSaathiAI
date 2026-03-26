<<<<<<< HEAD
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, TrendingUp, Calendar, PiggyBank } from 'lucide-react'
=======
import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Target, TrendingUp, Calendar, PiggyBank, Sparkles, Sliders } from 'lucide-react'
>>>>>>> 1b68d14 (feat: v2.0 — Agentic AI, PDF reports, goal planner, spending analyzer, 3D animations, multi-language, hackathon-ready)
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js'
import PageWrapper from '@/components/PageWrapper'
import { SliderInput } from '@/components/FormComponents'
import { LoadingScreen, ResultCard } from '@/components/UI'
import api, { formatINR } from '@/utils/api'
<<<<<<< HEAD
=======
import { INDEX_FUNDS, SAFE_INSTRUMENTS } from '@/utils/fund_data'
>>>>>>> 1b68d14 (feat: v2.0 — Agentic AI, PDF reports, goal planner, spending analyzer, 3D animations, multi-language, hackathon-ready)
import useStore from '@/store'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const initial = {
  current_age: 25, monthly_income: 60000, monthly_expenses: 40000,
  current_savings: 100000, fire_age: 45, inflation_rate: 6, equity_return: 12,
}

<<<<<<< HEAD
=======
// ─── Client-side FIRE calculator for What-If simulator ──────────────────────
function localFireCalc({ current_age, monthly_income, monthly_expenses, current_savings, fire_age, inflation_rate, equity_return }) {
  const years_to_fire = fire_age - current_age
  if (years_to_fire <= 0) return null
  const monthly_surplus = monthly_income - monthly_expenses
  const annual_expenses = monthly_expenses * 12
  const future_annual_expenses = annual_expenses * Math.pow(1 + inflation_rate / 100, years_to_fire)
  const fire_corpus = future_annual_expenses * 25
  const r_monthly = equity_return / 100 / 12
  const n = years_to_fire * 12
  const future_savings = current_savings * Math.pow(1 + equity_return / 100, years_to_fire)
  let sip_needed = 0
  if (r_monthly > 0) {
    sip_needed = Math.max(0, (fire_corpus - future_savings) * r_monthly / ((Math.pow(1 + r_monthly, n) - 1) * (1 + r_monthly)))
  } else {
    sip_needed = Math.max(0, (fire_corpus - future_savings) / n)
  }
  sip_needed = Math.round(sip_needed)

  const milestones = []
  for (const yr of [1, 3, 5, 10, years_to_fire]) {
    if (yr <= years_to_fire) {
      const m = yr * 12
      const rm = equity_return / 100 / 12
      const sip_maturity = rm > 0 ? sip_needed * ((Math.pow(1 + rm, m) - 1) / rm) * (1 + rm) : sip_needed * m
      const corpus_at = sip_maturity + current_savings * Math.pow(1 + equity_return / 100, yr)
      milestones.push({
        year: yr, age: current_age + yr,
        corpus: Math.round(corpus_at),
        target_pct: Math.round(corpus_at / fire_corpus * 1000) / 10,
      })
    }
  }

  return {
    fire_corpus_needed: Math.round(fire_corpus),
    monthly_sip_needed: sip_needed,
    years_to_fire,
    monthly_surplus: Math.round(monthly_surplus),
    is_achievable: sip_needed <= monthly_surplus * 0.7,
    milestones,
  }
}

>>>>>>> 1b68d14 (feat: v2.0 — Agentic AI, PDF reports, goal planner, spending analyzer, 3D animations, multi-language, hackathon-ready)
export default function Planner() {
  const [form, setForm] = useState(initial)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
<<<<<<< HEAD
=======
  const [whatIf, setWhatIf] = useState(null)
  const [showWhatIf, setShowWhatIf] = useState(false)
>>>>>>> 1b68d14 (feat: v2.0 — Agentic AI, PDF reports, goal planner, spending analyzer, 3D animations, multi-language, hackathon-ready)
  const setFirePlan = useStore((s) => s.setFirePlan)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async () => {
    setLoading(true); setError(null)
    try {
      const { data } = await api.post('/planner', form)
      setResult(data)
      setFirePlan(data.plan)
<<<<<<< HEAD
=======
      // Init What-If with same values
      setWhatIf({
        monthly_sip: data.plan.monthly_sip_needed,
        fire_age: form.fire_age,
        equity_return: form.equity_return,
        inflation_rate: form.inflation_rate,
      })
>>>>>>> 1b68d14 (feat: v2.0 — Agentic AI, PDF reports, goal planner, spending analyzer, 3D animations, multi-language, hackathon-ready)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

<<<<<<< HEAD
=======
  // ─── What-If live computation ─────────────────────────────────────────────
  const whatIfResult = useMemo(() => {
    if (!whatIf || !result) return null
    return localFireCalc({
      current_age: form.current_age,
      monthly_income: form.monthly_income,
      monthly_expenses: form.monthly_expenses,
      current_savings: form.current_savings,
      fire_age: whatIf.fire_age,
      inflation_rate: whatIf.inflation_rate,
      equity_return: whatIf.equity_return,
    })
  }, [whatIf, form, result])

  // Compute delta vs original
  const delta = useMemo(() => {
    if (!result || !whatIfResult) return null
    return {
      corpus: whatIfResult.fire_corpus_needed - result.plan.fire_corpus_needed,
      sip: whatIfResult.monthly_sip_needed - result.plan.monthly_sip_needed,
      years: whatIfResult.years_to_fire - result.plan.years_to_fire,
    }
  }, [result, whatIfResult])

>>>>>>> 1b68d14 (feat: v2.0 — Agentic AI, PDF reports, goal planner, spending analyzer, 3D animations, multi-language, hackathon-ready)
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
<<<<<<< HEAD
=======
      // What-If line (if active)
      ...(whatIfResult && showWhatIf ? [{
        label: 'What-If corpus',
        data: whatIfResult.milestones.map(m => m.corpus),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#8b5cf6',
        pointRadius: 4,
        borderDash: [4, 2],
      }] : []),
>>>>>>> 1b68d14 (feat: v2.0 — Agentic AI, PDF reports, goal planner, spending analyzer, 3D animations, multi-language, hackathon-ready)
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
<<<<<<< HEAD
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Target size={18} className="text-purple-400" />
          </div>
=======
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center"
          >
            <Target size={18} className="text-purple-400" />
          </motion.div>
>>>>>>> 1b68d14 (feat: v2.0 — Agentic AI, PDF reports, goal planner, spending analyzer, 3D animations, multi-language, hackathon-ready)
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
<<<<<<< HEAD
            <button onClick={submit} className="btn-primary w-full flex items-center justify-center gap-2">
              Calculate My FIRE Plan <Target size={16} />
            </button>
=======
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={submit}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Calculate My FIRE Plan <Target size={16} />
            </motion.button>
>>>>>>> 1b68d14 (feat: v2.0 — Agentic AI, PDF reports, goal planner, spending analyzer, 3D animations, multi-language, hackathon-ready)
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

<<<<<<< HEAD
              {/* Allocation */}
=======
              {/* ─── What-If Simulator ─────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ borderColor: showWhatIf ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)' }}
              >
                <button
                  onClick={() => setShowWhatIf(!showWhatIf)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Sliders size={16} className="text-purple-400" />
                    <span className="text-sm font-semibold text-white">What-If Simulator</span>
                  </div>
                  <span className="text-xs text-[#484f58]">{showWhatIf ? 'Hide' : 'Explore scenarios →'}</span>
                </button>

                {showWhatIf && whatIf && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-white/5"
                  >
                    <SliderInput
                      label="What if I retire at..."
                      min={form.current_age + 3} max={65}
                      value={whatIf.fire_age}
                      onChange={(v) => setWhatIf(p => ({ ...p, fire_age: v }))}
                      format={(v) => `${v} yrs`}
                    />
                    <SliderInput
                      label="What if returns are..."
                      min={6} max={20}
                      value={whatIf.equity_return}
                      onChange={(v) => setWhatIf(p => ({ ...p, equity_return: v }))}
                      format={(v) => `${v}%`}
                    />
                    <SliderInput
                      label="What if inflation is..."
                      min={3} max={12}
                      value={whatIf.inflation_rate}
                      onChange={(v) => setWhatIf(p => ({ ...p, inflation_rate: v }))}
                      format={(v) => `${v}%`}
                    />

                    {/* Delta display */}
                    {delta && whatIfResult && (
                      <div className="mt-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                        <p className="text-xs font-semibold text-purple-400 mb-2">Scenario Impact:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[#8b949e]">New corpus: </span>
                            <span className="text-white font-medium">{formatINR(whatIfResult.fire_corpus_needed)}</span>
                          </div>
                          <div>
                            <span className="text-[#8b949e]">New SIP: </span>
                            <span className="text-white font-medium">{formatINR(whatIfResult.monthly_sip_needed)}</span>
                          </div>
                          <div>
                            <span className="text-[#8b949e]">SIP change: </span>
                            <span className={delta.sip >= 0 ? 'text-red-400' : 'text-brand-400'}>
                              {delta.sip >= 0 ? '+' : ''}{formatINR(delta.sip)}/mo
                            </span>
                          </div>
                          <div>
                            <span className="text-[#8b949e]">Years: </span>
                            <span className={delta.years >= 0 ? 'text-amber-400' : 'text-brand-400'}>
                              {whatIfResult.years_to_fire} yrs
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>

              {/* Allocation with fund recommendations */}
>>>>>>> 1b68d14 (feat: v2.0 — Agentic AI, PDF reports, goal planner, spending analyzer, 3D animations, multi-language, hackathon-ready)
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

<<<<<<< HEAD
              {/* AI narrative */}
              {result.ai_narrative && (
                <div className="card" style={{ borderColor: 'rgba(19,184,142,0.2)' }}>
                  <p className="text-xs text-brand-400 font-semibold uppercase tracking-wide mb-2">SmartSaathi's roadmap</p>
=======
              {/* Recommended funds */}
              <div className="card">
                <h3 className="text-xs text-[#8b949e] uppercase tracking-wide mb-3">📈 Top fund picks for you</h3>
                {INDEX_FUNDS.slice(0, 3).map((fund, i) => (
                  <motion.div
                    key={fund.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <div>
                      <p className="text-xs font-medium text-white">{fund.name}</p>
                      <p className="text-[10px] text-[#484f58]">{fund.type} • {fund.category} • ER: {fund.expense_ratio}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-brand-400">{fund.returns_5yr}%</p>
                      <p className="text-[10px] text-[#484f58]">5yr return</p>
                    </div>
                  </motion.div>
                ))}
                <div className="mt-3 pt-2 border-t border-white/5">
                  {SAFE_INSTRUMENTS.slice(0, 2).map((inst) => (
                    <div key={inst.name} className="flex justify-between py-1.5 text-xs">
                      <span className="text-[#8b949e]">{inst.name}</span>
                      <span className="text-brand-400 font-medium">{inst.current_rate}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI narrative */}
              {result.ai_narrative && (
                <div className="card" style={{ borderColor: 'rgba(19,184,142,0.2)' }}>
                  <p className="text-xs text-brand-400 font-semibold uppercase tracking-wide mb-2">🤖 SmartSaathi's roadmap</p>
>>>>>>> 1b68d14 (feat: v2.0 — Agentic AI, PDF reports, goal planner, spending analyzer, 3D animations, multi-language, hackathon-ready)
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
