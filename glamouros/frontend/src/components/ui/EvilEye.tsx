'use client'

import { useEffect, useRef } from 'react'
import './EvilEye.css'

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ]
}

function generateNoiseTexture(size = 256): Uint8Array {
  const data = new Uint8Array(size * size * 4)

  function hash(x: number, y: number, s: number): number {
    let n = x * 374761393 + y * 668265263 + s * 1274126177
    n = Math.imul(n ^ (n >>> 13), 1274126177)
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296
  }

  function noise(px: number, py: number, freq: number, seed: number): number {
    const fx = (px / size) * freq
    const fy = (py / size) * freq
    const ix = Math.floor(fx)
    const iy = Math.floor(fy)
    const tx = fx - ix
    const ty = fy - iy
    const w = freq | 0
    const v00 = hash(((ix % w) + w) % w, ((iy % w) + w) % w, seed)
    const v10 = hash((((ix + 1) % w) + w) % w, ((iy % w) + w) % w, seed)
    const v01 = hash(((ix % w) + w) % w, (((iy + 1) % w) + w) % w, seed)
    const v11 = hash((((ix + 1) % w) + w) % w, (((iy + 1) % w) + w) % w, seed)
    return v00 * (1 - tx) * (1 - ty) + v10 * tx * (1 - ty) + v01 * (1 - tx) * ty + v11 * tx * ty
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0
      let amp = 0.4
      let totalAmp = 0
      for (let o = 0; o < 8; o++) {
        const f = 32 * (1 << o)
        v += amp * noise(x, y, f, o * 31)
        totalAmp += amp
        amp *= 0.65
      }
      v /= totalAmp
      v = (v - 0.5) * 2.2 + 0.5
      v = Math.max(0, Math.min(1, v))
      const val = Math.round(v * 255)
      const i = (y * size + x) * 4
      data[i] = val
      data[i + 1] = val
      data[i + 2] = val
      data[i + 3] = 255
    }
  }

  return data
}

const vertexShaderSource = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentShaderSource = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform sampler2D uNoiseTexture;
uniform float uPupilSize;
uniform float uIrisWidth;
uniform float uGlowIntensity;
uniform float uIntensity;
uniform float uScale;
uniform float uNoiseScale;
uniform vec2 uMouse;
uniform float uPupilFollow;
uniform float uFlameSpeed;
uniform vec3 uEyeColor;
uniform vec3 uBgColor;

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / uResolution.y;
  uv /= uScale;
  float ft = uTime * uFlameSpeed;

  float polarRadius = length(uv) * 2.0;
  float polarAngle = (2.0 * atan(uv.x, uv.y)) / 6.28 * 0.3;
  vec2 polarUv = vec2(polarRadius, polarAngle);

  vec4 noiseA = texture2D(uNoiseTexture, polarUv * vec2(0.2, 7.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));
  vec4 noiseB = texture2D(uNoiseTexture, polarUv * vec2(0.3, 4.0) * uNoiseScale + vec2(-ft * 0.2, 0.0));
  vec4 noiseC = texture2D(uNoiseTexture, polarUv * vec2(0.1, 5.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));

  float distanceMask = 1.0 - length(uv);

  // Inner ring
  float innerRing = clamp(-1.0 * ((distanceMask - 0.7) / uIrisWidth), 0.0, 1.0);
  innerRing = (innerRing * distanceMask - 0.2) / 0.28;
  innerRing += noiseA.r - 0.5;
  innerRing *= 1.3;
  innerRing = clamp(innerRing, 0.0, 1.0);

  float outerRing = clamp(-1.0 * ((distanceMask - 0.5) / 0.2), 0.0, 1.0);
  outerRing = (outerRing * distanceMask - 0.1) / 0.38;
  outerRing += noiseC.r - 0.5;
  outerRing *= 1.3;
  outerRing = clamp(outerRing, 0.0, 1.0);

  innerRing += outerRing;

  // Inner eye
  float innerEye = distanceMask - 0.1 * 2.0;
  innerEye *= noiseB.r * 2.0;

  // Pupil with cursor tracking
  vec2 pupilOffset = uMouse * uPupilFollow * 0.12;
  vec2 pupilUv = uv - pupilOffset;
  float pupil = 1.0 - length(pupilUv * vec2(9.0, 2.3));
  pupil *= uPupilSize;
  pupil = clamp(pupil, 0.0, 1.0);
  pupil /= 0.35;

  // Outer eye
  float outerEyeGlow = 1.0 - length(uv * vec2(0.5, 1.5));
  outerEyeGlow = clamp(outerEyeGlow + 0.5, 0.0, 1.0);
  outerEyeGlow += noiseC.r - 0.5;
  float outerBgGlow = outerEyeGlow;
  outerEyeGlow = pow(outerEyeGlow, 2.0);
  outerEyeGlow += distanceMask;
  outerEyeGlow *= uGlowIntensity;
  outerEyeGlow = clamp(outerEyeGlow, 0.0, 1.0);
  outerEyeGlow *= pow(1.0 - distanceMask, 2.0) * 2.5;

  // Outer eye bg glow
  outerBgGlow += distanceMask;
  outerBgGlow = pow(outerBgGlow, 0.5);
  outerBgGlow *= 0.15;

  vec3 color = uEyeColor * uIntensity * clamp(max(innerRing + innerEye, outerEyeGlow + outerBgGlow) - pupil, 0.0, 3.0);
  color += uBgColor;

  gl_FragColor = vec4(color, 1.0);
}
`

interface EvilEyeProps {
  eyeColor?: string
  intensity?: number
  pupilSize?: number
  irisWidth?: number
  glowIntensity?: number
  scale?: number
  noiseScale?: number
  pupilFollow?: number
  flameSpeed?: number
  backgroundColor?: string
}

export default function EvilEye({
  eyeColor = '#FF6F37',
  intensity = 1.5,
  pupilSize = 0.6,
  irisWidth = 0.25,
  glowIntensity = 0.35,
  scale = 0.8,
  noiseScale = 1.0,
  pupilFollow = 1.0,
  flameSpeed = 1.0,
  backgroundColor = '#120F17',
}: EvilEyeProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current

    // Setup HTML Canvas Element
    const canvas = document.createElement('canvas')
    container.appendChild(canvas)

    // Initialize WebGL context
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
    if (!gl) {
      console.error('WebGL not supported in this browser.')
      return
    }

    gl.clearColor(0, 0, 0, 0)

    // Full screen triangle geometry coordinates
    const positions = new Float32Array([
      -1.0, -1.0,
       3.0, -1.0,
      -1.0,  3.0,
    ])

    const uvs = new Float32Array([
      0.0, 0.0,
      2.0, 0.0,
      0.0, 2.0,
    ])

    // Setup buffers
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const uvBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW)

    // Compile shaders
    function compileShader(source: string, type: number): WebGLShader | null {
      const shader = gl!.createShader(type)
      if (!shader) return null
      gl!.shaderSource(shader, source)
      gl!.compileShader(shader)
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl!.getShaderInfoLog(shader))
        gl!.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = compileShader(vertexShaderSource, gl.VERTEX_SHADER)
    const fs = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER)
    if (!vs || !fs) return

    // Link WebGL program
    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program))
      return
    }

    // Setup Noise Texture
    const noiseData = generateNoiseTexture(256)
    const noiseTexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, noiseTexture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      256,
      256,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      noiseData
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    // Get attribute & uniform locations
    const positionLoc = gl.getAttribLocation(program, 'position')
    const uvLoc = gl.getAttribLocation(program, 'uv')

    const uTimeLoc = gl.getUniformLocation(program, 'uTime')
    const uResolutionLoc = gl.getUniformLocation(program, 'uResolution')
    const uNoiseTextureLoc = gl.getUniformLocation(program, 'uNoiseTexture')
    const uPupilSizeLoc = gl.getUniformLocation(program, 'uPupilSize')
    const uIrisWidthLoc = gl.getUniformLocation(program, 'uIrisWidth')
    const uGlowIntensityLoc = gl.getUniformLocation(program, 'uGlowIntensity')
    const uIntensityLoc = gl.getUniformLocation(program, 'uIntensity')
    const uScaleLoc = gl.getUniformLocation(program, 'uScale')
    const uNoiseScaleLoc = gl.getUniformLocation(program, 'uNoiseScale')
    const uMouseLoc = gl.getUniformLocation(program, 'uMouse')
    const uPupilFollowLoc = gl.getUniformLocation(program, 'uPupilFollow')
    const uFlameSpeedLoc = gl.getUniformLocation(program, 'uFlameSpeed')
    const uEyeColorLoc = gl.getUniformLocation(program, 'uEyeColor')
    const uBgColorLoc = gl.getUniformLocation(program, 'uBgColor')

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }

    function onMouseMove(e: MouseEvent) {
      const rect = container.getBoundingClientRect()
      mouse.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.ty = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    }

    function onMouseLeave() {
      mouse.tx = 0
      mouse.ty = 0
    }

    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('mouseleave', onMouseLeave)

    function resize() {
      const dpr = window.devicePixelRatio || 1
      canvas.width = container.offsetWidth * dpr
      canvas.height = container.offsetHeight * dpr
      gl!.viewport(0, 0, canvas.width, canvas.height)
    }
    window.addEventListener('resize', resize)
    resize()

    let animationFrameId: number

    function update(time: number) {
      animationFrameId = requestAnimationFrame(update)

      // Mouse smoothing
      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05

      gl!.clear(gl!.COLOR_BUFFER_BIT)
      gl!.useProgram(program)

      // Bind positions
      gl!.enableVertexAttribArray(positionLoc)
      gl!.bindBuffer(gl!.ARRAY_BUFFER, positionBuffer)
      gl!.vertexAttribPointer(positionLoc, 2, gl!.FLOAT, false, 0, 0)

      // Bind UVs
      gl!.enableVertexAttribArray(uvLoc)
      gl!.bindBuffer(gl!.ARRAY_BUFFER, uvBuffer)
      gl!.vertexAttribPointer(uvLoc, 2, gl!.FLOAT, false, 0, 0)

      // Bind texture
      gl!.activeTexture(gl!.TEXTURE0)
      gl!.bindTexture(gl!.TEXTURE_2D, noiseTexture)
      gl!.uniform1i(uNoiseTextureLoc, 0)

      // Set uniforms
      gl!.uniform1f(uTimeLoc, time * 0.001)
      gl!.uniform3f(uResolutionLoc, canvas.width, canvas.height, canvas.width / canvas.height)
      gl!.uniform1f(uPupilSizeLoc, pupilSize)
      gl!.uniform1f(uIrisWidthLoc, irisWidth)
      gl!.uniform1f(uGlowIntensityLoc, glowIntensity)
      gl!.uniform1f(uIntensityLoc, intensity)
      gl!.uniform1f(uScaleLoc, scale)
      gl!.uniform1f(uNoiseScaleLoc, noiseScale)
      gl!.uniform2f(uMouseLoc, mouse.x, mouse.y)
      gl!.uniform1f(uPupilFollowLoc, pupilFollow)
      gl!.uniform1f(uFlameSpeedLoc, flameSpeed)

      const eyeVec = hexToVec3(eyeColor)
      gl!.uniform3f(uEyeColorLoc, eyeVec[0], eyeVec[1], eyeVec[2])

      const bgVec = hexToVec3(backgroundColor)
      gl!.uniform3f(uBgColorLoc, bgVec[0], bgVec[1], bgVec[2])

      // Render the single full-screen triangle
      gl!.drawArrays(gl!.TRIANGLES, 0, 3)
    }
    animationFrameId = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('mouseleave', onMouseLeave)
      
      // Clean up WebGL resources
      gl.deleteTexture(noiseTexture)
      gl.deleteBuffer(positionBuffer)
      gl.deleteBuffer(uvBuffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)

      if (container.contains(canvas)) {
        container.removeChild(canvas)
      }
    }
  }, [eyeColor, intensity, pupilSize, irisWidth, glowIntensity, scale, noiseScale, pupilFollow, flameSpeed, backgroundColor])

  return <div ref={containerRef} className="evil-eye-container" />
}
