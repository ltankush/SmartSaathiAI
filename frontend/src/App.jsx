import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from '@/components/Navbar'
import PWAInstall from '@/components/PWAInstall'
import ErrorBoundary from '@/components/ErrorBoundary'
import Home from '@/pages/Home'
import Score from '@/pages/Score'
import Planner from '@/pages/Planner'
import Tax from '@/pages/Tax'
import Chat from '@/pages/Chat'
import Goals from '@/pages/Goals'
import Spending from '@/pages/Spending'
import useStore from '@/store'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
        <Route path="/score" element={<ErrorBoundary><Score /></ErrorBoundary>} />
        <Route path="/planner" element={<ErrorBoundary><Planner /></ErrorBoundary>} />
        <Route path="/tax" element={<ErrorBoundary><Tax /></ErrorBoundary>} />
        <Route path="/chat" element={<ErrorBoundary><Chat /></ErrorBoundary>} />
        <Route path="/goals" element={<ErrorBoundary><Goals /></ErrorBoundary>} />
        <Route path="/spending" element={<ErrorBoundary><Spending /></ErrorBoundary>} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  const initSession = useStore((s) => s.initSession)
  useEffect(() => { initSession() }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#080c10] text-[#e6edf3]">
        <Navbar />
        <ErrorBoundary>
          <AnimatedRoutes />
        </ErrorBoundary>
        <PWAInstall />
      </div>
    </BrowserRouter>
  )
}
