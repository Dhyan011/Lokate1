import { useMemo, useRef } from "react"
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

  nodes[0].position = [1.5, 0.5, 1.0]
  nodes[0].radius = 0.25
  nodes[0].isActive = true

  // Sub-nodes
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2
    const radius = 0.8
    nodes.push({
      position: [...nodes[0].position] as [number, number, number],
      radius: 0.08,
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

const AMBER = new THREE.Color("#E08F5E")
const GREEN = new THREE.Color("#5FA374")
const EDGE_COLOR = new THREE.Color("#F2EFE9")

export default function NodeGraph() {
  const groupRef = useRef<THREE.Group>(null)
  const instanceRefs = useRef<(THREE.Object3D | null)[]>([])
  if (instanceRefs.current.length !== NODES.length) {
    instanceRefs.current = Array(NODES.length).fill(null)
  }
  const reticleRef = useRef<THREE.Mesh>(null)

  const edgeData = useMemo(() => {
    return EDGES.map(([a, b]) => {
      const nodeA = NODES[a]
      const nodeB = NODES[b]
      
      // Interpolate from node color to white-ish edge color
      // Drei's Line component with vertexColors expects an array of [r,g,b] arrays
      const colorA = (nodeA.isActive ? GREEN : AMBER).clone().lerp(EDGE_COLOR, 0.5).toArray()
      const colorB = (nodeB.isActive ? GREEN : AMBER).clone().lerp(EDGE_COLOR, 0.5).toArray()
      
      return {
        points: [new THREE.Vector3(...nodeA.position), new THREE.Vector3(...nodeB.position)],
        colors: [colorA, colorB] as [[number, number, number], [number, number, number]]
      }
    })
  }, [])

  const targetNodePos = new THREE.Vector3(...NODES[0].position)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()

    // 1. Scroll progress
    const maxScroll = document.body.scrollHeight - window.innerHeight
    const scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0

    // Compute state percentages
    let state2Amount = 0 
    if (scrollProgress > 0.20 && scrollProgress <= 0.65) {
      state2Amount = (scrollProgress - 0.20) / 0.45
    } else if (scrollProgress > 0.65) {
      state2Amount = 1 - Math.min((scrollProgress - 0.65) / 0.2, 1) // faster fade out
    }
    state2Amount = THREE.MathUtils.smoothstep(state2Amount, 0, 1)

    let state3Amount = 0
    if (scrollProgress > 0.65) {
      state3Amount = (scrollProgress - 0.65) / 0.35
    }
    state3Amount = THREE.MathUtils.smoothstep(state3Amount, 0, 1)

    // 2. Camera tracking
    const baseCamPos = new THREE.Vector3(0, 0, 9)
    const focusCamPos = targetNodePos.clone().add(new THREE.Vector3(0, 0, 2.5))
    const resolveCamPos = new THREE.Vector3(0, 0, 12)

    const currentTargetCam = new THREE.Vector3()
    currentTargetCam.lerpVectors(baseCamPos, focusCamPos, state2Amount)
    currentTargetCam.lerp(resolveCamPos, state3Amount)

    state.camera.position.lerp(currentTargetCam, 0.1)
    
    // LookAt Tracking
    const lookAtBase = new THREE.Vector3(0, 0, 0)
    const lookAtFocus = targetNodePos.clone()
    const currentLookAt = new THREE.Vector3()
    currentLookAt.lerpVectors(lookAtBase, lookAtFocus, state2Amount)
    currentLookAt.lerp(lookAtBase, state3Amount) 

    state.camera.lookAt(currentLookAt)

    // 3. Rotation & Parallax
    const rotationSpeed = THREE.MathUtils.lerp(1, 0.1, state2Amount)
    const parallaxIntensity = THREE.MathUtils.lerp(0.2, 0.05, state2Amount)
    
    groupRef.current.rotation.y = (t * (Math.PI * 2) / (50 / rotationSpeed)) + (state.pointer.x * parallaxIntensity)
    groupRef.current.rotation.x = -(state.pointer.y * parallaxIntensity)

    // 4. Shrink for resolve state
    const targetScale = THREE.MathUtils.lerp(1, 0.6, state3Amount)
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)

    // 5. Node Animation
    instanceRefs.current.forEach((instance, i) => {
      if (!instance) return
      const node = NODES[i]
      let targetPos = new THREE.Vector3(...node.position)
      let targetNodeScale = node.radius

      const pulse = node.isActive ? 1 + Math.sin(t * 2.5 + i) * 0.15 : 1 + Math.sin(t + i) * 0.02

      if (node.isSubNode && node.targetOffset) {
        const offset = new THREE.Vector3(...node.targetOffset).multiplyScalar(state2Amount)
        targetPos.add(offset)
        targetNodeScale = node.radius * state2Amount * pulse
      } else {
        targetNodeScale = node.radius * pulse
      }

      if (i === 0) {
        targetNodeScale *= THREE.MathUtils.lerp(1, 0.5, state2Amount)
      }

      instance.position.lerp(targetPos, 0.2)
      instance.scale.lerp(new THREE.Vector3(targetNodeScale, targetNodeScale, targetNodeScale), 0.2)
    })

    // 6. Reticle Animation
    if (reticleRef.current) {
      reticleRef.current.position.copy(targetNodePos)
      const reticleScale = THREE.MathUtils.lerp(4, 1.2, state2Amount)
      reticleRef.current.scale.set(reticleScale, reticleScale, reticleScale)
      
      const mat = reticleRef.current.material as THREE.MeshBasicMaterial
      const opacity = state2Amount > 0.05 && state2Amount < 0.95 ? Math.sin(state2Amount * Math.PI) * 0.6 : 0
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, opacity, 0.15)
      reticleRef.current.rotation.z = t * 1.5
    }
  })

  return (
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

      <mesh ref={reticleRef}>
        <ringGeometry args={[0.9, 0.95, 32]} />
        <meshBasicMaterial color={AMBER} transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      <group>
        {edgeData.map((edge, i) => (
          <Line
            key={`edge-${i}`}
            points={edge.points}
            vertexColors={edge.colors}
            lineWidth={1.5}
            transparent
            opacity={0.25}
          />
        ))}
      </group>
    </group>
  )
}
