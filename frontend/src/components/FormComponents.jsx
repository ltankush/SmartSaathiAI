import React from 'react'
import { clsx } from 'clsx'

export function FormField({ label, hint, error, children, className }) {
  return (
    <div className={clsx('mb-4', className)}>
      {label && (
        <label className="block text-xs font-medium text-[#8b949e] mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-[#484f58] mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

export function Input({ label, hint, error, className, ...props }) {
  return (
    <FormField label={label} hint={hint} error={error}>
      <input
        className={clsx('input-field', error && 'border-red-500/50', className)}
        {...props}
      />
    </FormField>
  )
}

export function SliderInput({ label, hint, min, max, step = 1, value, onChange, format }) {
  const display = format ? format(value) : value
  return (
    <FormField label={label} hint={hint}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm font-semibold text-brand-400 min-w-[64px] text-right">
          {display}
        </span>
      </div>
    </FormField>
  )
}

export function Toggle({ label, checked, onChange, hint }) {
  return (
    <FormField hint={hint}>
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
          />
          <div
            className={`w-10 h-5 rounded-full transition-all duration-200 ${
              checked ? 'bg-brand-500' : 'bg-[#30363d]'
            }`}
          />
          <div
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </div>
        <span className="text-sm text-[#c9d1d9] group-hover:text-white transition-colors">
          {label}
        </span>
      </label>
    </FormField>
  )
}
