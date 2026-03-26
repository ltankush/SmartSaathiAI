import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from '@/components/Navbar'
import PWAInstall from '@/components/PWAInstall'
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
        <Route path="/" element={<Home />} />
        <Route path="/score" element={<Score />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/tax" element={<Tax />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/spending" element={<Spending />} />
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
        <AnimatedRoutes />
        <PWAInstall />
      </div>
    </BrowserRouter>
  )
}
