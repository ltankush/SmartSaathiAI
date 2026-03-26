import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, TrendingDown, CheckCircle, AlertTriangle } from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import PageWrapper from '@/components/PageWrapper'
import { SliderInput } from '@/components/FormComponents'
import { LoadingScreen } from '@/components/UI'
import api, { formatINR } from '@/utils/api'
import useStore from '@/store'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const initial = {
  gross_salary: 800000, hra_exempt: 0, section_80c: 0,
  section_80d: 0, section_80ccd_nps: 0, home_loan_interest: 0,
  lta: 0, other_deductions: 0,
}

function RegimeCard({ label, tax, takeHome, effective, recommended, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card relative overflow-hidden ${recommended ? 'ring-2 ring-brand-500/40' : ''}`}
    >
      {recommended && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold text-brand-400 bg-brand-500/10 px-2 py-1 rounded-full border border-brand-500/20">
          <CheckCircle size={11} /> Recommended
        </div>
      )}
      <p className="text-xs text-[#8b949e] uppercase tracking-wide mb-3">{label}</p>
      <p className="text-3xl font-bold mb-1" style={{ color }}>{formatINR(tax)}</p>
      <p className="text-xs text-[#484f58]">Total tax payable</p>
      <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-[#8b949e]">Take-home</span>
          <span className="text-white font-medium">{formatINR(takeHome)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#8b949e]">Effective rate</span>
          <span className="text-white font-medium">{effective}%</span>
        </div>
      </div>
    </motion.div>
  )
}

export default function Tax() {
  const [form, setForm] = useState(initial)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const setTaxResult = useStore((s) => s.setTaxResult)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async () => {
    setLoading(true); setError(null)
    try {
      const { data } = await api.post('/tax', form)
      setResult(data)
      setTaxResult(data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const chartData = result ? {
    labels: ['Old Regime', 'New Regime'],
    datasets: [
      {
        label: 'Tax paid',
        data: result.chart_data.tax,
        backgroundColor: ['rgba(239,68,68,0.7)', 'rgba(19,184,142,0.7)'],
        borderRadius: 8,
      },
      {
        label: 'Take-home',
        data: result.chart_data.take_home,
        backgroundColor: ['rgba(239,68,68,0.2)', 'rgba(19,184,142,0.2)'],
        borderRadius: 8,
      },
    ],
  } : null

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#8b949e', font: { size: 12 } } },
      tooltip: {
        backgroundColor: '#161b22', borderColor: '#30363d', borderWidth: 1,
        titleColor: '#e6edf3', bodyColor: '#8b949e',
        callbacks: { label: (ctx) => ` ${formatINR(ctx.parsed.y)}` },
      },
    },
    scales: {
      x: { ticks: { color: '#484f58' }, grid: { display: false } },
      y: { ticks: { color: '#484f58', callback: (v) => formatINR(v) }, grid: { color: '#21262d' } },
    },
  }

  if (loading) return <PageWrapper><LoadingScreen message="Comparing tax regimes for you..." /></PageWrapper>

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Calculator size={18} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Tax Regime Optimizer</h1>
        </div>
        <p className="text-sm text-[#8b949e] mb-10 ml-12">Old vs New regime — with your exact numbers. FY 2025-26.</p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="card">
            <h2 className="text-sm font-semibold text-white mb-6 uppercase tracking-wide">Your salary details</h2>
            <SliderInput label="Gross annual salary (CTC)" min={300000} max={5000000} step={50000} value={form.gross_salary} onChange={(v) => set('gross_salary', v)} format={formatINR} />
            <SliderInput label="HRA exemption claimed" min={0} max={600000} step={5000} value={form.hra_exempt} onChange={(v) => set('hra_exempt', v)} format={formatINR} hint="Only if you pay rent" />
            <SliderInput label="Section 80C investments" min={0} max={150000} step={5000} value={form.section_80c} onChange={(v) => set('section_80c', v)} format={formatINR} hint="PF + PPF + ELSS + LIC (max ₹1.5L)" />
            <SliderInput label="Section 80D (health insurance premium)" min={0} max={100000} step={1000} value={form.section_80d} onChange={(v) => set('section_80d', v)} format={formatINR} hint="Max ₹25,000 self + ₹25,000 parents" />
            <SliderInput label="80CCD(1B) NPS contribution" min={0} max={50000} step={1000} value={form.section_80ccd_nps} onChange={(v) => set('section_80ccd_nps', v)} format={formatINR} hint="Additional ₹50,000 over 80C limit" />
            <SliderInput label="Home loan interest (Sec 24b)" min={0} max={200000} step={5000} value={form.home_loan_interest} onChange={(v) => set('home_loan_interest', v)} format={formatINR} hint="Max ₹2L for self-occupied" />

            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 mb-4">{error}</div>}
            <button onClick={submit} className="btn-primary w-full flex items-center justify-center gap-2">
              Compare Regimes <Calculator size={16} />
            </button>
          </div>

          {/* Results */}
          {result ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <RegimeCard
                  label="Old regime" tax={result.old_regime.total_tax}
                  takeHome={form.gross_salary - result.old_regime.total_tax}
                  effective={result.old_regime.effective_rate}
                  recommended={result.recommended === 'old'}
                  color="#ef4444"
                />
                <RegimeCard
                  label="New regime" tax={result.new_regime.total_tax}
                  takeHome={form.gross_salary - result.new_regime.total_tax}
                  effective={result.new_regime.effective_rate}
                  recommended={result.recommended === 'new'}
                  color="#13b88e"
                />
              </div>

              {/* Savings pill */}
              <div className="card text-center" style={{ borderColor: 'rgba(19,184,142,0.25)' }}>
                <TrendingDown size={20} className="text-brand-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-brand-400">{formatINR(result.savings)}</p>
                <p className="text-xs text-[#8b949e] mt-0.5">saved by choosing {result.recommended} regime</p>
              </div>

              {/* Bar chart */}
              <div className="card p-4">
                <h3 className="text-xs text-[#8b949e] uppercase tracking-wide mb-4">Tax vs take-home comparison</h3>
                <div style={{ height: 200 }}>
                  <Bar data={chartData} options={chartOpts} />
                </div>
              </div>

              {/* Missed deductions */}
              {result.missed_deductions?.length > 0 && (
                <div className="card">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={14} className="text-amber-400" />
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Missed deductions</h3>
                  </div>
                  {result.missed_deductions.map((d, i) => (
                    <p key={i} className="text-xs text-[#8b949e] mb-2 pl-4 border-l-2 border-amber-500/30">{d}</p>
                  ))}
                </div>
              )}

              {/* AI advice */}
              {result.ai_advice && (
                <div className="card" style={{ borderColor: 'rgba(19,184,142,0.2)' }}>
                  <p className="text-xs text-brand-400 font-semibold uppercase tracking-wide mb-2">SmartSaathi's tax advice</p>
                  <p className="text-sm text-[#c9d1d9] leading-relaxed">{result.ai_advice}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-[#484f58]">
                <Calculator size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Enter your salary details to compare</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
