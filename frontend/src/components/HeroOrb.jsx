import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedSphere() {
  const meshRef = useRef()
  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.15
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
  })
  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
      <Sphere ref={meshRef} args={[1.8, 64, 64]}>
        <MeshDistortMaterial
          color="#13b88e"
          attach="material"
          distort={0.45}
          speed={2.5}
          roughness={0.1}
          metalness={0.8}
          wireframe={false}
          transparent
          opacity={0.85}
        />
      </Sphere>
      {/* Inner glow sphere */}
      <Sphere args={[1.5, 32, 32]}>
        <meshBasicMaterial color="#0a9374" transparent opacity={0.15} />
      </Sphere>
    </Float>
  )
}

function ParticleRing() {
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i < 120; i++) {
      const angle = (i / 120) * Math.PI * 2
      const radius = 3.2 + Math.random() * 0.4
      pts.push(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 0.6,
        Math.sin(angle) * radius
      )
    }
    return new Float32Array(pts)
  }, [])

  const geoRef = useRef()
  useFrame((state) => {
    if (!geoRef.current) return
    geoRef.current.rotation.y = state.clock.elapsedTime * 0.08
  })

  return (
    <points ref={geoRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={120} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#13b88e" transparent opacity={0.6} />
    </points>
  )
}

export default function HeroOrb({ className = '' }) {
  return (
    <div className={`${className}`} style={{ background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={2} color="#13b88e" />
        <pointLight position={[-5, -3, -5]} intensity={0.8} color="#0ea5e9" />
        <spotLight position={[0, 8, 0]} intensity={1.2} color="#ffffff" angle={0.4} />
        <Stars radius={80} depth={50} count={1500} factor={3} saturation={0} fade speed={1} />
        <AnimatedSphere />
        <ParticleRing />
      </Canvas>
    </div>
  )
}
