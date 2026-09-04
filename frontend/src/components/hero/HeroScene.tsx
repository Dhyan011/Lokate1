import { Suspense, useEffect, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"
import NodeGraph from "./NodeGraph"

function canUseWebGL(): boolean {
  try {
    const c = document.createElement("canvas")
    return !!(c.getContext("webgl2") || c.getContext("webgl"))
  } catch {
    return false
  }
}

const WEBGL_AVAILABLE = canUseWebGL()

function SceneContents() {
  return (
    <>
      <ambientLight intensity={0.2} color="#A0A5B5" />
      <directionalLight position={[4, 6, 3]} intensity={0.4} color="#D0D5E5" />
      <NodeGraph />
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.1} mipmapBlur intensity={0.9} />
      </EffectComposer>
    </>
  )
}

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={containerRef} style={{ position: "absolute", inset: 0, zIndex: 0 }}>
      {!WEBGL_AVAILABLE ? (
        null // No fallback gradient needed for dark theme since bg is dark
      ) : inView ? (
        <Canvas
          camera={{ position: [0, 0, 9], fov: 50 }}
          gl={{
            alpha: true,
            antialias: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.9,
          }}
          style={{ position: "absolute", inset: 0 }}
        >
          <Suspense fallback={null}>
            <SceneContents />
          </Suspense>
        </Canvas>
      ) : null}
    </div>
  )
}
