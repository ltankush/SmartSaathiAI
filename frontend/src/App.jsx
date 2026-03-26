import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from '@/components/Navbar'
<<<<<<< HEAD
=======
import PWAInstall from '@/components/PWAInstall'
>>>>>>> 1b68d14 (feat: v2.0 — Agentic AI, PDF reports, goal planner, spending analyzer, 3D animations, multi-language, hackathon-ready)
import Home from '@/pages/Home'
import Score from '@/pages/Score'
import Planner from '@/pages/Planner'
import Tax from '@/pages/Tax'
import Chat from '@/pages/Chat'
<<<<<<< HEAD
=======
import Goals from '@/pages/Goals'
import Spending from '@/pages/Spending'
>>>>>>> 1b68d14 (feat: v2.0 — Agentic AI, PDF reports, goal planner, spending analyzer, 3D animations, multi-language, hackathon-ready)
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
<<<<<<< HEAD
=======
        <Route path="/goals" element={<Goals />} />
        <Route path="/spending" element={<Spending />} />
>>>>>>> 1b68d14 (feat: v2.0 — Agentic AI, PDF reports, goal planner, spending analyzer, 3D animations, multi-language, hackathon-ready)
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
<<<<<<< HEAD
=======
        <PWAInstall />
>>>>>>> 1b68d14 (feat: v2.0 — Agentic AI, PDF reports, goal planner, spending analyzer, 3D animations, multi-language, hackathon-ready)
      </div>
    </BrowserRouter>
  )
}
