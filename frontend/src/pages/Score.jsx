import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, ChevronRight, ChevronLeft, Share2, RefreshCw, AlertCircle } from 'lucide-react'
import PageWrapper from '@/components/PageWrapper'
import ScoreCard from '@/components/ScoreCard'
import { Input, SliderInput, Toggle } from '@/components/FormComponents'
import { LoadingScreen, ResultCard } from '@/components/UI'
import api, { formatINR } from '@/utils/api'
import useStore from '@/store'

const STEPS = ['Income & Expenses', 'Emergency & Insurance', 'Investments & Debt', 'Tax & Retirement']

const initialForm = {
  monthly_income: 50000, monthly_expenses: 35000,
  emergency_months: 1, has_health_insurance: false,
  health_cover_lakhs: 0, has_life_insurance: false,
  life_cover_times_income: 0, monthly_sip: 0,
  emi_to_income_ratio: 0, has_will_or_nomination: false,
  age: 28, has_ppf_or_nps: false,
  tax_filing_regular: false, is_farmer: false, has_daughter: false,
}

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div className={`h-1.5 rounded-full transition-all duration-300 ${
            i <= current ? 'bg-brand-500' : 'bg-[#21262d]'
          } ${i === current ? 'flex-[2]' : 'flex-1'}`} />
        </React.Fragment>
      ))}
    </div>
  )
}

export default function Score() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const setBmsScore = useStore((s) => s.setBmsScore)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/score', form)
      setResult(data)
      setBmsScore(data.score)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const shareScore = () => {
    const text = `My Bharat Money Score is ${result.score.total}/100 — ${result.score.tier}! 💰\nGet yours free at SmartSaathiAI`
    if (navigator.share) {
      navigator.share({ title: 'My BMS Score', text })
    } else {
      navigator.clipboard.writeText(text)
      alert('Score copied to clipboard!')
    }
  }

  if (loading) return (
    <PageWrapper><LoadingScreen message="Calculating your Bharat Money Score..." /></PageWrapper>
  )

  if (result) return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Your BMS Score</h1>
          <div className="flex gap-2">
            <button onClick={shareScore} className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5">
              <Share2 size={13} /> Share
            </button>
            <button onClick={() => { setResult(null); setStep(0) }} className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5">
              <RefreshCw size={13} /> Retake
            </button>
          </div>
        </div>

        <ScoreCard scoreData={result.score} />

        {/* AI summary */}
        {result.ai_summary && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="card mt-6 border-brand-500/20" style={{ borderColor: 'rgba(19,184,142,0.2)' }}>
            <p className="text-xs text-brand-400 font-semibold uppercase tracking-wide mb-2">SmartSaathi says</p>
            <p className="text-sm text-[#c9d1d9] leading-relaxed">{result.ai_summary}</p>
          </motion.div>
        )}

        {/* Advice */}
        {result.advice?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold text-white">Action items for you</h3>
            {result.advice.map((a, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-[#0d1117] border border-white/5">
                <AlertCircle size={15} className="text-brand-400 mt-0.5 shrink-0" />
                <p className="text-sm text-[#8b949e]">{a}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Govt schemes */}
        {result.govt_schemes?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="mt-6">
            <h3 className="text-sm font-semibold text-white mb-3">Government schemes you qualify for</h3>
            <div className="grid gap-3">
              {result.govt_schemes.map((s, i) => (
                <div key={i} className="card p-4">
                  <p className="text-sm font-medium text-brand-400">{s.name}</p>
                  <p className="text-xs text-[#8b949e] mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <BarChart3 size={18} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Bharat Money Score</h1>
        </div>
        <p className="text-sm text-[#8b949e] mb-8 ml-12">Answer 12 questions. Get your full financial health report.</p>

        <StepIndicator current={step} total={STEPS.length} />

        <div className="mb-2">
          <p className="text-xs text-brand-400 font-semibold uppercase tracking-wide mb-1">Step {step + 1} of {STEPS.length}</p>
          <h2 className="text-lg font-semibold text-white mb-6">{STEPS[step]}</h2>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <div className="space-y-1">
                <SliderInput label="Monthly income" min={5000} max={500000} step={1000}
                  value={form.monthly_income} onChange={(v) => set('monthly_income', v)}
                  format={(v) => formatINR(v)} hint="Your take-home salary per month" />
                <SliderInput label="Monthly expenses" min={2000} max={400000} step={1000}
                  value={form.monthly_expenses} onChange={(v) => set('monthly_expenses', v)}
                  format={(v) => formatINR(v)} hint="All expenses including rent, food, EMIs" />
                <SliderInput label="Your age" min={18} max={65} step={1}
                  value={form.age} onChange={(v) => set('age', v)}
                  format={(v) => `${v} yrs`} />
              </div>
            )}
            {step === 1 && (
              <div className="space-y-1">
                <SliderInput label="Emergency fund (months of expenses covered)" min={0} max={24} step={0.5}
                  value={form.emergency_months} onChange={(v) => set('emergency_months', v)}
                  format={(v) => `${v} months`} hint="How many months can you survive without income?" />
                <Toggle label="I have health insurance" checked={form.has_health_insurance}
                  onChange={(v) => set('has_health_insurance', v)} hint="Personal or employer-provided" />
                {form.has_health_insurance && (
                  <SliderInput label="Health cover amount" min={0} max={50} step={1}
                    value={form.health_cover_lakhs} onChange={(v) => set('health_cover_lakhs', v)}
                    format={(v) => `₹${v}L`} />
                )}
                <Toggle label="I have life insurance / term plan" checked={form.has_life_insurance}
                  onChange={(v) => set('has_life_insurance', v)} />
                {form.has_life_insurance && (
                  <SliderInput label="Life cover (× annual income)" min={0} max={25} step={1}
                    value={form.life_cover_times_income} onChange={(v) => set('life_cover_times_income', v)}
                    format={(v) => `${v}×`} hint="Ideal is 10–15× your annual income" />
                )}
              </div>
            )}
            {step === 2 && (
              <div className="space-y-1">
                <SliderInput label="Monthly SIP / investments" min={0} max={100000} step={500}
                  value={form.monthly_sip} onChange={(v) => set('monthly_sip', v)}
                  format={(v) => formatINR(v)} hint="Total mutual funds, stocks, PPF contributions per month" />
                <SliderInput label="EMI burden (% of income)" min={0} max={80} step={1}
                  value={Math.round(form.emi_to_income_ratio * 100)} onChange={(v) => set('emi_to_income_ratio', v / 100)}
                  format={(v) => `${v}%`} hint="What % of income goes to EMIs?" />
                <Toggle label="I have a nominee / Will in place" checked={form.has_will_or_nomination}
                  onChange={(v) => set('has_will_or_nomination', v)} hint="Bank accounts, insurance, demat" />
              </div>
            )}
            {step === 3 && (
              <div className="space-y-1">
                <Toggle label="I file ITR regularly" checked={form.tax_filing_regular}
                  onChange={(v) => set('tax_filing_regular', v)} />
                <Toggle label="I have PPF / NPS account" checked={form.has_ppf_or_nps}
                  onChange={(v) => set('has_ppf_or_nps', v)} hint="Public Provident Fund or National Pension System" />
                <Toggle label="I am a farmer" checked={form.is_farmer}
                  onChange={(v) => set('is_farmer', v)} hint="To check PM Kisan eligibility" />
                <Toggle label="I have a daughter" checked={form.has_daughter}
                  onChange={(v) => set('has_daughter', v)} hint="To check Sukanya Samriddhi Yojana eligibility" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="btn-ghost flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} className="btn-primary flex items-center gap-2">
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={submit} className="btn-primary flex items-center gap-2">
              Calculate Score <BarChart3 size={16} />
            </button>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
