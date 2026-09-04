import { useMemo, useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Instances, Instance, Line } from "@react-three/drei"
import * as THREE from "three"

interface NodeData {
  position: [number, number, number]
  radius: number
  isActive: boolean
  isSubNode?: boolean
  parentIndex?: number
  targetOffset?: [number, number, number]
}

function buildNodes(count: number): NodeData[] {
  const rng = (min: number, max: number) => Math.random() * (max - min) + min
  const nodes: NodeData[] = Array.from({ length: count }, (_, i) => ({
    position: [rng(-5, 5), rng(-3, 3), rng(-3, 1)] as [number, number, number],
    radius: rng(0.12, 0.3),
    isActive: i < 5, 
  }))

  // The first node will be our "target" node that splits
  // Let's bring it closer to center so it's a good camera target
  nodes[0].position = [1, 0.5, 0.5]
  nodes[0].radius = 0.25
  nodes[0].isActive = true

  // Add 5 sub-nodes that will belong to nodes[0]
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2
    const radius = 0.6
    nodes.push({
      position: [...nodes[0].position] as [number, number, number],
      radius: 0.1,
      isActive: true,
      isSubNode: true,
      parentIndex: 0,
      targetOffset: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0],
    })
  }

  return nodes
}

function buildEdges(nodes: NodeData[]): [number, number][] {
  const edges = new Set<string>()
  const result: [number, number][] = []
  // Only connect main nodes
  const mainNodes = nodes.filter(n => !n.isSubNode)
  for (let i = 0; i < mainNodes.length; i++) {
    const a = new THREE.Vector3(...mainNodes[i].position)
    const distances = mainNodes
      .map((n, j) => ({ j, d: a.distanceTo(new THREE.Vector3(...n.position)) }))
      .filter(({ j }) => j !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, 3)
    for (const { j } of distances) {
      const key = [Math.min(i, j), Math.max(i, j)].join("-")
      if (!edges.has(key)) {
        edges.add(key)
        result.push([i, j])
      }
    }
  }
  return result
}

const NODES = buildNodes(30)
const EDGES = buildEdges(NODES)

// Dark theme colors
const AMBER = new THREE.Color("#E08F5E")
const GREEN = new THREE.Color("#5FA374")
const EDGE_COLOR = new THREE.Color("#F2EFE9")

export default function NodeGraph() {
  const groupRef = useRef<THREE.Group>(null)
  // Store refs to individual instances to animate them
  const instanceRefs = useRef<(THREE.Object3D | null)[]>([])
  if (instanceRefs.current.length !== NODES.length) {
    instanceRefs.current = Array(NODES.length).fill(null)
  }

  const reticleRef = useRef<THREE.Mesh>(null)

  const edgePoints = useMemo(
    () =>
      EDGES.map(([a, b]) => [
        new THREE.Vector3(...NODES[a].position),
        new THREE.Vector3(...NODES[b].position),
      ]),
    []
  )

  const targetNodePos = new THREE.Vector3(...NODES[0].position)

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()

    // 1. Calculate scroll progress (0 to 1)
    const maxScroll = document.body.scrollHeight - window.innerHeight
    const scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0

    // Derive states
    // State 1: 0 - 0.25 (Hero)
    // State 2: 0.25 - 0.65 (Precision / Split)
    // State 3: 0.65 - 1.0 (Resolve / Pull back)

    let state2Amount = 0 // 0 to 1
    if (scrollProgress > 0.25 && scrollProgress <= 0.65) {
      state2Amount = (scrollProgress - 0.25) / 0.4
    } else if (scrollProgress > 0.65) {
      state2Amount = 1 - ((scrollProgress - 0.65) / 0.35)
    }
    // smoothstep it a bit
    state2Amount = THREE.MathUtils.smoothstep(state2Amount, 0, 1)

    let state3Amount = 0 // 0 to 1
    if (scrollProgress > 0.65) {
      state3Amount = (scrollProgress - 0.65) / 0.35
    }
    state3Amount = THREE.MathUtils.smoothstep(state3Amount, 0, 1)

    // 2. Camera interpolation
    const baseCamPos = new THREE.Vector3(0, 0, 9)
    // Target camera pos focuses on the split node
    const focusCamPos = targetNodePos.clone().add(new THREE.Vector3(0, 0, 2.5))
    // State 3 cam pos (pulled back)
    const resolveCamPos = new THREE.Vector3(0, 0, 12)

    const currentTargetCam = new THREE.Vector3()
    currentTargetCam.lerpVectors(baseCamPos, focusCamPos, state2Amount)
    currentTargetCam.lerp(resolveCamPos, state3Amount)

    state.camera.position.lerp(currentTargetCam, 0.1) // damp camera
    
    // Camera lookAt logic
    const lookAtBase = new THREE.Vector3(0, 0, 0)
    const lookAtFocus = targetNodePos.clone()
    const currentLookAt = new THREE.Vector3()
    currentLookAt.lerpVectors(lookAtBase, lookAtFocus, state2Amount)
    currentLookAt.lerp(lookAtBase, state3Amount) // go back to center in state 3

    // Apply lookat (requires updating projection matrix)
    state.camera.lookAt(currentLookAt)

    // 3. Group Rotation (slower when focused)
    const rotationSpeed = THREE.MathUtils.lerp(1, 0.1, state2Amount)
    const parallaxIntensity = THREE.MathUtils.lerp(0.2, 0.05, state2Amount)
    
    groupRef.current.rotation.y = (t * (Math.PI * 2) / (50 / rotationSpeed)) + (state.pointer.x * parallaxIntensity)
    groupRef.current.rotation.x = -(state.pointer.y * parallaxIntensity)

    // 4. Group Scale & Opacity (State 3 shrinks)
    const targetScale = THREE.MathUtils.lerp(1, 0.7, state3Amount)
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)

    // 5. Node Pulsing & Splitting
    instanceRefs.current.forEach((instance, i) => {
      if (!instance) return
      const node = NODES[i]

      let targetPos = new THREE.Vector3(...node.position)
      let targetNodeScale = node.radius

      // Pulsing
      let pulse = 1
      if (node.isActive) {
        pulse = 1 + Math.sin(t * 2.5 + i) * 0.15
      } else {
        pulse = 1 + Math.sin(t + i) * 0.02
      }

      if (node.isSubNode && node.targetOffset) {
        // Expand outwards based on state2Amount
        const offset = new THREE.Vector3(...node.targetOffset).multiplyScalar(state2Amount)
        targetPos.add(offset)
        // Subnodes are only visible when state2Amount > 0
        targetNodeScale = node.radius * state2Amount * pulse
      } else {
        targetNodeScale = node.radius * pulse
      }

      // Shrink the parent node slightly when split
      if (i === 0) {
        targetNodeScale *= THREE.MathUtils.lerp(1, 0.5, state2Amount)
      }

      instance.position.lerp(targetPos, 0.2)
      instance.scale.lerp(new THREE.Vector3(targetNodeScale, targetNodeScale, targetNodeScale), 0.2)
    })

    // 6. Reticle Logic (visible only during State 2)
    if (reticleRef.current) {
      reticleRef.current.position.copy(targetNodePos)
      
      const reticleScale = THREE.MathUtils.lerp(4, 1.2, state2Amount)
      reticleRef.current.scale.set(reticleScale, reticleScale, reticleScale)
      
      const mat = reticleRef.current.material as THREE.MeshBasicMaterial
      const opacity = state2Amount > 0.1 && state2Amount < 0.9 ? Math.sin(state2Amount * Math.PI) * 0.8 : 0
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, opacity, 0.1)
      
      // Reticle rotation
      reticleRef.current.rotation.z = t * 2
    }
  })

  return (
    <>
      <group ref={groupRef}>
        <Instances range={NODES.length} limit={NODES.length}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial 
            roughness={0.4} 
            metalness={0.2}
            emissiveIntensity={1.0}
          />
          
          {NODES.map((node, i) => (
            <Instance
              key={`node-${i}`}
              ref={(el) => (instanceRefs.current[i] = el)}
              position={node.position}
              scale={node.radius}
              color={node.isActive ? GREEN : AMBER}
              emissive={node.isActive ? GREEN : AMBER}
            />
          ))}
        </Instances>

        {/* Reticle */}
        <mesh ref={reticleRef}>
          <ringGeometry args={[0.9, 0.95, 32]} />
          <meshBasicMaterial color={AMBER} transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>

        {/* Edges - Glowing threads */}
        <group>
          {edgePoints.map((pts, i) => {
            // Give lines a gradient/glow by coloring vertices? 
            // Standard Line doesn't support vertex colors easily out of the box in drei,
            // but we can just use the provided thin amber/white line as a glow thread.
            return (
              <Line
                key={`edge-${i}`}
                points={pts}
                color={EDGE_COLOR}
                lineWidth={1}
                transparent
                opacity={0.15}
              />
            )
          })}
        </group>
      </group>
    </>
  )
}
