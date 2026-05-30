"use client"

import React, { useEffect, useRef } from 'react'

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    let isCleanup = false
    let animationFrameId: number
    let renderer: any = null
    let resizeHandler: any = null
    let mouseUpHandler: any = null
    let mouseMoveHandler: any = null

    // Dynamically load Three.js from CDN to guarantee flawless Next.js compilation
    const loadThree = () => {
      return new Promise<void>((resolve) => {
        if ((window as any).THREE) {
          resolve()
          return
        }
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
        script.onload = () => resolve()
        document.head.appendChild(script)
      })
    }

    loadThree().then(() => {
      if (isCleanup) return
      
      const THREE = (window as any).THREE
      if (!THREE) return

      // --- Scene, Camera, Renderer ---
      const scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(0x120e1d, 0.09)

      const baseCameraX = 0
      const baseCameraY = 2.2
      const baseCameraZ = 5.5

      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
      camera.position.set(baseCameraX, baseCameraY, baseCameraZ)

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.setClearColor(0x120e1d, 1.0)
      
      if (containerRef.current) {
        containerRef.current.appendChild(renderer.domElement)
      }

      // --- Lighting ---
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
      scene.add(ambientLight)

      const dirLightGold = new THREE.DirectionalLight(0xd4af37, 1.5)
      dirLightGold.position.set(5, 5, 5)
      scene.add(dirLightGold)

      const rimLight = new THREE.DirectionalLight(0x7F77DD, 0.6)
      rimLight.position.set(-5, 4, -5)
      scene.add(rimLight)

      const spotLight = new THREE.SpotLight(0x7F77DD, 0.9)
      spotLight.position.set(0, 6, 2)
      spotLight.angle = Math.PI / 3
      spotLight.penumbra = 0.5
      spotLight.castShadow = true
      spotLight.shadow.mapSize.width = 512
      spotLight.shadow.mapSize.height = 512
      scene.add(spotLight)

      const fillLight = new THREE.PointLight(0x7F77DD, 0.8, 12)
      fillLight.position.set(-3, 1, 3)
      scene.add(fillLight)

      // --- Object Groups ---
      const roomGroup = new THREE.Group()
      scene.add(roomGroup)

      const chairGroup = new THREE.Group()
      scene.add(chairGroup)
      spotLight.target = chairGroup

      const toolsGroup = new THREE.Group()
      scene.add(toolsGroup)

      // --- Hair Rain Variables ---
      let hairRainMesh: any
      const hairCount = 900 // Slightly reduced count for high-performance framerates
      const hairData: any[] = []
      const dummy = new THREE.Object3D()

      // --- Interaction Variables ---
      let isDragging = false
      let previousMousePosition = { x: 0, y: 0 }
      const rotationVelocity = 0.005
      
      let mouseX = 0
      let mouseY = 0
      let targetCameraX = 0
      let targetCameraY = 2.2

      // --- Procedural Generation Functions ---
      const createSalonInterior = () => {
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x050406, roughness: 0.95, metalness: 0.02 })
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x040305, roughness: 0.95, metalness: 0.02 })
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.8 })
        const glassMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, metalness: 1.0 })

        const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), floorMat)
        floor.rotation.x = -Math.PI / 2
        floor.position.y = -1.2
        floor.receiveShadow = true
        roomGroup.add(floor)

        const backWall = new THREE.Mesh(new THREE.PlaneGeometry(30, 15), wallMat)
        backWall.position.set(0, 6, -5)
        backWall.receiveShadow = true
        roomGroup.add(backWall)

        const mirrorGroup = new THREE.Group()
        const mirrorShape = new THREE.Shape()
        mirrorShape.moveTo(-1.5, 0)
        mirrorShape.lineTo(1.5, 0)
        mirrorShape.lineTo(1.5, 3)
        mirrorShape.absarc(0, 3, 1.5, 0, Math.PI, false)
        
        const mirrorGeo = new THREE.ShapeGeometry(mirrorShape)
        const mirror = new THREE.Mesh(mirrorGeo, glassMat)
        mirror.position.set(0, -1.2, -4.9)
        mirrorGroup.add(mirror)

        const frameGeo = new THREE.ShapeGeometry(mirrorShape)
        const frame = new THREE.Mesh(frameGeo, goldMat)
        frame.position.set(0, -1.2, -4.95)
        frame.scale.set(1.05, 1.05, 1)
        mirrorGroup.add(frame)
        
        roomGroup.add(mirrorGroup)

        for(let i of [-3, 3]) {
            const sconceBase = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.1), goldMat)
            sconceBase.position.set(i, 2, -4.8)
            const sconceBulb = new THREE.Mesh(new THREE.SphereGeometry(0.15), new THREE.MeshBasicMaterial({color: 0x7F77DD}))
            sconceBulb.position.set(i, 2.3, -4.7)
            
            const sconceLight = new THREE.PointLight(0x7F77DD, 0.8, 6)
            sconceLight.position.set(i, 2.3, -4.5)
            
            roomGroup.add(sconceBase, sconceBulb, sconceLight)
        }
      }

      const createCosmeticRacks = () => {
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x110d15, roughness: 0.9, metalness: 0.1 })
        const bottleMats = [
          new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.8 }), // Gold
          new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.1, metalness: 0.9 }), // Glossy Black
          new THREE.MeshStandardMaterial({ color: 0x7F77DD, roughness: 0.1, metalness: 0.5, transparent: true, opacity: 0.7 }), // Neon Purple Glass
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 })  // White Ceramic
        ]

        const rackPositions = [-4.8, 4.8]

        rackPositions.forEach((rackX) => {
          for (let y = -0.5; y <= 2.5; y += 1) {
            const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.06, 0.5), woodMat)
            shelf.position.set(rackX, y, -4.8)
            shelf.castShadow = true
            shelf.receiveShadow = true
            roomGroup.add(shelf)

            const numItems = Math.floor(Math.random() * 4) + 4
            const startX = rackX - 0.9
            const spacing = 1.8 / (numItems - 1)

            for (let i = 0; i < numItems; i++) {
              const isJar = Math.random() > 0.5
              const radius = isJar ? 0.08 + Math.random() * 0.03 : 0.04 + Math.random() * 0.02
              const height = isJar ? 0.1 + Math.random() * 0.08 : 0.2 + Math.random() * 0.2
              
              const geo = new THREE.CylinderGeometry(radius, radius, height, 12)
              const mat = bottleMats[Math.floor(Math.random() * bottleMats.length)]
              const item = new THREE.Mesh(geo, mat)
              
              const offsetX = startX + i * spacing + (Math.random() * 0.06 - 0.03)
              const offsetZ = -4.8 + (Math.random() * 0.08 - 0.04)
              
              item.position.set(offsetX, y + height / 2 + 0.03, offsetZ)
              item.castShadow = true
              roomGroup.add(item)
              
              if (!isJar) {
                const capGeo = new THREE.CylinderGeometry(radius * 0.8, radius * 0.8, 0.05, 12)
                const capMat = bottleMats[0]
                const cap = new THREE.Mesh(capGeo, capMat)
                cap.position.set(0, height / 2 + 0.03, 0)
                item.add(cap)
              }
            }
          }
        })
      }

      const createBarberChair = () => {
        const metalMaterial = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.75 })
        const leatherMaterial = new THREE.MeshStandardMaterial({ color: 0x141216, roughness: 0.6, metalness: 0.1 })

        const baseFloor = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.08, 24), metalMaterial)
        baseFloor.position.y = -1.2
        baseFloor.castShadow = true
        chairGroup.add(baseFloor)

        const basePole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.0, 24), metalMaterial)
        basePole.position.y = -0.7
        basePole.castShadow = true
        chairGroup.add(basePole)

        const footrestConnect = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 1.0), metalMaterial)
        footrestConnect.position.set(0, -0.4, 0.7)
        footrestConnect.castShadow = true
        chairGroup.add(footrestConnect)

        const footrestBar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.35), metalMaterial)
        footrestBar.position.set(0, -0.4, 1.2)
        footrestBar.castShadow = true
        chairGroup.add(footrestBar)

        const seatBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.2), leatherMaterial)
        seatBase.position.y = -0.1
        seatBase.castShadow = true
        chairGroup.add(seatBase)

        const seatTrim = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 1.25), metalMaterial)
        seatTrim.position.y = -0.1
        chairGroup.add(seatTrim)

        const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.3, 0.28), leatherMaterial)
        backrest.position.set(0, 0.7, -0.45)
        backrest.rotation.x = -0.15 
        backrest.castShadow = true
        chairGroup.add(backrest)

        const headrestConnect = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 12), metalMaterial)
        headrestConnect.position.set(0, 1.45, -0.55)
        chairGroup.add(headrestConnect)

        const headrest = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.45, 24), leatherMaterial)
        headrest.position.set(0, 1.6, -0.55)
        headrest.rotation.z = Math.PI / 2
        headrest.castShadow = true
        chairGroup.add(headrest)

        const armrestBars = [{ x: -0.65, z: 0 }, { x: 0.65, z: 0 }]
        armrestBars.forEach((arm) => {
            const armSupport = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 12), metalMaterial)
            armSupport.position.set(arm.x, 0.2, arm.z)
            chairGroup.add(armSupport)

            const armTop = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 1.1), leatherMaterial)
            armTop.position.set(arm.x, 0.55, arm.z)
            chairGroup.add(armTop)

            const armTopTrim = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 1.15), metalMaterial)
            armTopTrim.position.set(arm.x, 0.51, arm.z)
            chairGroup.add(armTopTrim)
        })
      }

      const createSalonTools = () => {
        const chromeMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.1, metalness: 0.95 })
        const matteBlack = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8, metalness: 0.1 })
        const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.8 })

        const scissorGroup = new THREE.Group()
        const bladeGeo = new THREE.BoxGeometry(0.01, 0.15, 0.002)
        const handleGeo = new THREE.TorusGeometry(0.015, 0.004, 6, 12)
        
        const blade1 = new THREE.Mesh(bladeGeo, chromeMaterial)
        blade1.position.set(0, 0.08, 0)
        blade1.rotation.z = -0.15
        const handle1 = new THREE.Mesh(handleGeo, goldMaterial)
        handle1.position.set(-0.015, -0.01, 0)
        blade1.add(handle1)
        
        const blade2 = new THREE.Mesh(bladeGeo, chromeMaterial)
        blade2.position.set(0, 0.08, 0.003) 
        blade2.rotation.z = 0.15
        const handle2 = new THREE.Mesh(handleGeo, goldMaterial)
        handle2.position.set(0.015, -0.01, 0)
        blade2.add(handle2)

        const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.01), goldMaterial)
        screw.rotation.x = Math.PI / 2
        screw.position.set(0, 0.025, 0.0015)

        scissorGroup.add(blade1, blade2, screw)
        scissorGroup.position.set(-1.2, 1.2, 0.5) 
        toolsGroup.add(scissorGroup)

        const combGroup = new THREE.Group()
        const spine = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.005), matteBlack)
        combGroup.add(spine)

        const toothGeo = new THREE.BoxGeometry(0.003, 0.03, 0.003)
        for(let i = -0.11; i <= 0.11; i += 0.01) {
            const tooth = new THREE.Mesh(toothGeo, matteBlack)
            tooth.position.set(i, -0.025, 0)
            combGroup.add(tooth)
        }
        combGroup.position.set(1.1, 1.5, -0.6) 
        toolsGroup.add(combGroup)

        const trimmerGroup = new THREE.Group()
        const trimmerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.015, 0.15, 12), matteBlack)
        
        const trimmerHead = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, 0.02), chromeMaterial)
        trimmerHead.position.set(0, 0.08, 0)
        
        const bladeTop = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.005, 0.022), chromeMaterial)
        bladeTop.position.set(0, 0.085, 0)

        trimmerGroup.add(trimmerBody, trimmerHead, bladeTop)
        trimmerGroup.position.set(0.6, 0.7, 1.2) 
        toolsGroup.add(trimmerGroup)
      }

      const createRealisticHairRain = () => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.15, 0),
            new THREE.Vector3(0.02, 0.07, 0.015),
            new THREE.Vector3(-0.015, 0, 0.01),
            new THREE.Vector3(0.015, -0.07, -0.01),
            new THREE.Vector3(0, -0.15, 0)
        ])
        
        const hairGeo = new THREE.TubeGeometry(curve, 6, 0.002, 3, false)
        hairGeo.center() 

        const hairMat = new THREE.MeshStandardMaterial({
            color: 0x7F77DD,
            roughness: 0.5,
            metalness: 0.1
        })

        hairRainMesh = new THREE.InstancedMesh(hairGeo, hairMat, hairCount)
        hairRainMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
        
        const colorObj = new THREE.Color()
        const hairColors = [0x1a1a1a, 0x7F77DD, 0x3d2314, 0xd4af37] 

        for (let i = 0; i < hairCount; i++) {
            const x = (Math.random() - 0.5) * 15
            const y = Math.random() * 20 
            const z = (Math.random() - 0.5) * 15

            dummy.position.set(x, y, z)
            dummy.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            )
            dummy.scale.setScalar(Math.random() * 0.6 + 0.4) 
            dummy.updateMatrix()
            hairRainMesh.setMatrixAt(i, dummy.matrix)

            colorObj.setHex(hairColors[Math.floor(Math.random() * hairColors.length)])
            hairRainMesh.setColorAt(i, colorObj)

            hairData.push({
                yPos: y, xPos: x, zPos: z,
                yVel: Math.random() * 0.02 + 0.01,
                rotSpeedX: (Math.random() - 0.5) * 0.02,
                rotSpeedY: (Math.random() - 0.5) * 0.02,
                rotSpeedZ: (Math.random() - 0.5) * 0.02,
                swaySpeed: Math.random() * 0.02,
                swayOffset: Math.random() * Math.PI * 2
            })
        }
        scene.add(hairRainMesh)
      }

      // --- Build Scene ---
      createSalonInterior()
      createCosmeticRacks()
      createBarberChair()
      createSalonTools()
      createRealisticHairRain()

      // --- Animation Loop ---
      const animate = () => {
        if (isCleanup) return
        animationFrameId = requestAnimationFrame(animate)
        const time = Date.now() * 0.001

        // Camera Parallax
        targetCameraX = baseCameraX + (mouseX * 0.8)
        targetCameraY = baseCameraY + (mouseY * 0.4)
        camera.position.x += (targetCameraX - camera.position.x) * 0.05
        camera.position.y += (targetCameraY - camera.position.y) * 0.05
        camera.lookAt(0, 0.5, 0)

        // Chair Spin
        if (!isDragging && chairGroup) {
            chairGroup.rotation.y += 0.002
            chairGroup.rotation.x *= 0.95 
        }

        // Levitating Tools
        if (toolsGroup) {
            toolsGroup.position.y = Math.sin(time * 0.5) * 0.1 
            toolsGroup.rotation.y += 0.002 
            
            toolsGroup.children.forEach((tool, index) => {
                tool.rotation.x += 0.004 * (index % 2 === 0 ? 1 : -1)
                tool.rotation.z += 0.002
            })
        }

        // Raining Hair
        if (hairRainMesh) {
            for (let i = 0; i < hairCount; i++) {
                const data = hairData[i]
                
                data.yPos -= data.yVel
                
                const swayX = Math.sin(time + data.swayOffset) * data.swaySpeed
                const swayZ = Math.cos(time + data.swayOffset) * data.swaySpeed

                if (data.yPos < -1.5) {
                    data.yPos = 15
                    data.xPos = (Math.random() - 0.5) * 15
                    data.zPos = (Math.random() - 0.5) * 15
                }

                hairRainMesh.getMatrixAt(i, dummy.matrix)
                dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)
                
                dummy.position.set(data.xPos + swayX, data.yPos, data.zPos + swayZ)
                dummy.rotation.x += data.rotSpeedX
                dummy.rotation.y += data.rotSpeedY
                dummy.rotation.z += data.rotSpeedZ
                
                dummy.updateMatrix()
                hairRainMesh.setMatrixAt(i, dummy.matrix)
            }
            hairRainMesh.instanceMatrix.needsUpdate = true
        }

        renderer.render(scene, camera)
      }

      // --- Event Listeners ---
      resizeHandler = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }

      const handleMouseDown = (e: MouseEvent) => {
        isDragging = true
        previousMousePosition = { x: e.clientX, y: e.clientY }
      }

      mouseUpHandler = () => {
        isDragging = false
      }

      mouseMoveHandler = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1

        if (isDragging && chairGroup) {
            const deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y
            }
            
            chairGroup.rotation.y += deltaMove.x * rotationVelocity
            chairGroup.rotation.x += deltaMove.y * rotationVelocity
            chairGroup.rotation.x = Math.max(-0.4, Math.min(0.4, chairGroup.rotation.x))
            
            previousMousePosition = { x: e.clientX, y: e.clientY }
        }
      }

      const handleTouchStart = (e: TouchEvent) => {
        isDragging = true
        const touch = e.touches[0]
        previousMousePosition = { x: touch.clientX, y: touch.clientY }
      }

      const handleTouchMove = (e: TouchEvent) => {
        if (isDragging && chairGroup) {
            const touch = e.touches[0]
            const deltaMove = {
                x: touch.clientX - previousMousePosition.x,
                y: touch.clientY - previousMousePosition.y
            }

            chairGroup.rotation.y += deltaMove.x * rotationVelocity * 1.5
            chairGroup.rotation.x += deltaMove.y * rotationVelocity * 1.5
            chairGroup.rotation.x = Math.max(-0.4, Math.min(0.4, chairGroup.rotation.x))

            previousMousePosition = { x: touch.clientX, y: touch.clientY }
        }
      }

      window.addEventListener('resize', resizeHandler)
      window.addEventListener('mouseup', mouseUpHandler)
      window.addEventListener('mousemove', mouseMoveHandler)
      window.addEventListener('touchend', mouseUpHandler)
      
      const canvasRef = renderer.domElement
      canvasRef.addEventListener('mousedown', handleMouseDown)
      canvasRef.addEventListener('touchstart', handleTouchStart, { passive: false })
      canvasRef.addEventListener('touchmove', handleTouchMove, { passive: false })

      animate()
    })

    return () => {
      isCleanup = true
      cancelAnimationFrame(animationFrameId)
      
      if (resizeHandler) window.removeEventListener('resize', resizeHandler)
      if (mouseUpHandler) {
        window.removeEventListener('mouseup', mouseUpHandler)
        window.removeEventListener('touchend', mouseUpHandler)
      }
      if (mouseMoveHandler) window.removeEventListener('mousemove', mouseMoveHandler)
      
      if (renderer && renderer.domElement) {
        const canvasRef = renderer.domElement
        canvasRef.removeEventListener('mousedown', () => {})
        canvasRef.removeEventListener('touchstart', () => {})
        canvasRef.removeEventListener('touchmove', () => {})
        
        if (containerRef.current && containerRef.current.contains(canvasRef)) {
          containerRef.current.removeChild(canvasRef)
        }
        renderer.dispose()
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Cinematic Vignette Overlay to tie into GlamourOS deep branding */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_35%,#120e1d_100%)] opacity-70" />
      
      {/* ThreeJS Rendering Target */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing pointer-events-auto"
      />
    </div>
  )
}
