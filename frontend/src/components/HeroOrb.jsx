import React, { useEffect, useRef } from 'react'

export default function HeroOrb({ className = '' }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width, height
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect()
      width = rect.width * window.devicePixelRatio
      height = rect.height * window.devicePixelRatio
      canvas.width = width
      canvas.height = height
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    }
    resize()
    window.addEventListener('resize', resize)

    const PARTICLE_COUNT = 100
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
      angle: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.5 + 0.1,
    }))

    let t = 0
    function draw() {
      t += 0.008
      ctx.clearRect(0, 0, width, height)

      // Animated gradient orb
      const cx = width / 2
      const cy = height / 2
      const orbRadius = Math.min(width, height) * 0.32

      // Outer glow
      const glow = ctx.createRadialGradient(cx, cy, orbRadius * 0.2, cx, cy, orbRadius * 1.8)
      glow.addColorStop(0, 'rgba(19, 184, 142, 0.15)')
      glow.addColorStop(0.5, 'rgba(19, 184, 142, 0.05)')
      glow.addColorStop(1, 'rgba(19, 184, 142, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)

      // Main orb with distortion effect  
      for (let ring = 0; ring < 3; ring++) {
        ctx.beginPath()
        const segments = 80
        for (let i = 0; i <= segments; i++) {
          const a = (i / segments) * Math.PI * 2
          const distort = 1 + Math.sin(a * 3 + t * 2 + ring) * 0.08 + Math.cos(a * 5 - t * 1.5) * 0.05
          const r = (orbRadius - ring * 15) * distort
          const px = cx + Math.cos(a) * r
          const py = cy + Math.sin(a) * r
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()

        const grad = ctx.createRadialGradient(cx - orbRadius * 0.3, cy - orbRadius * 0.3, 0, cx, cy, orbRadius)
        if (ring === 0) {
          grad.addColorStop(0, `rgba(93, 232, 195, ${0.7 - ring * 0.2})`)
          grad.addColorStop(0.5, `rgba(19, 184, 142, ${0.5 - ring * 0.15})`)
          grad.addColorStop(1, `rgba(10, 147, 116, ${0.3 - ring * 0.1})`)
        } else {
          grad.addColorStop(0, `rgba(19, 184, 142, ${0.12 - ring * 0.03})`)
          grad.addColorStop(1, `rgba(10, 147, 116, ${0.05})`)
        }
        ctx.fillStyle = grad
        ctx.fill()
      }

      // Specular highlight
      const specGrad = ctx.createRadialGradient(
        cx - orbRadius * 0.25, cy - orbRadius * 0.3, 0,
        cx - orbRadius * 0.1, cy - orbRadius * 0.15, orbRadius * 0.5
      )
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)')
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = specGrad
      ctx.beginPath()
      ctx.arc(cx - orbRadius * 0.15, cy - orbRadius * 0.2, orbRadius * 0.4, 0, Math.PI * 2)
      ctx.fill()

      // Particle ring
      for (const p of particles) {
        p.angle += p.speed * 0.01
        const ringDist = orbRadius * 1.5 + Math.sin(p.angle * 3 + t) * 20
        const px = cx + Math.cos(p.angle + t * 0.08) * ringDist
        const py = cy + Math.sin(p.angle + t * 0.08) * ringDist * 0.3
        const alpha = p.opacity * (0.5 + Math.sin(t * 2 + p.angle) * 0.5)

        ctx.beginPath()
        ctx.arc(px, py, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(19, 184, 142, ${alpha})`
        ctx.fill()
      }

      // Stars
      for (let i = 0; i < 60; i++) {
        const sx = ((i * 137.5 + t * 5) % width)
        const sy = ((i * 97.3) % height)
        const sa = 0.1 + Math.sin(t + i) * 0.1
        ctx.beginPath()
        ctx.arc(sx, sy, 0.8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${sa})`
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className={className} style={{ background: 'transparent', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}
