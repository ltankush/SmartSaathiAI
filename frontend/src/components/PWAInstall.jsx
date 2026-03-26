import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Only show if not dismissed in this session
      if (!sessionStorage.getItem('pwa-dismissed')) {
        setTimeout(() => setShow(true), 3000)
      }
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShow(false)
  }

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    sessionStorage.setItem('pwa-dismissed', '1')
  }

  if (!show || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50"
      >
        <div className="card glass p-4 flex items-center gap-3 shadow-2xl"
          style={{ borderColor: 'rgba(19,184,142,0.3)', background: 'rgba(13,17,23,0.95)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shrink-0">
            <Download size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Install SmartSaathiAI</p>
            <p className="text-xs text-[#8b949e]">Works offline • Instant access</p>
          </div>
          <button onClick={handleInstall} className="btn-primary text-xs py-2 px-3 shrink-0">
            Install
          </button>
          <button onClick={handleDismiss} className="text-[#484f58] hover:text-white p-1">
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
