'use client'

import { useEffect, useRef } from 'react'
import './Galaxy.css'

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
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5; 
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;
      
      col += star * size * color;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);
  
  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0);
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`

interface GalaxyProps {
  focal?: [number, number]
  rotation?: [number, number]
  starSpeed?: number
  density?: number
  hueShift?: number
  disableAnimation?: boolean
  speed?: number
  mouseInteraction?: boolean
  glowIntensity?: number
  saturation?: number
  mouseRepulsion?: boolean
  repulsionStrength?: number
  twinkleIntensity?: number
  rotationSpeed?: number
  autoCenterRepulsion?: number
  transparent?: boolean
  [key: string]: any
}

export default function Galaxy({
  focal = [0.5, 0.5],
  rotation = [1.0, 0.0],
  starSpeed = 0.5,
  density = 1.0,
  hueShift = 140.0,
  disableAnimation = false,
  speed = 1.0,
  mouseInteraction = true,
  glowIntensity = 0.3,
  saturation = 0.0,
  mouseRepulsion = true,
  repulsionStrength = 2.0,
  twinkleIntensity = 0.3,
  rotationSpeed = 0.1,
  autoCenterRepulsion = 0.0,
  transparent = true,
  ...rest
}: GalaxyProps) {
  const ctnDom = useRef<HTMLDivElement>(null)
  const targetMousePos = useRef({ x: 0.5, y: 0.5 })
  const smoothMousePos = useRef({ x: 0.5, y: 0.5 })
  const targetMouseActive = useRef(0.0)
  const smoothMouseActive = useRef(0.0)

  useEffect(() => {
    if (!ctnDom.current) return
    const ctn = ctnDom.current

    // Setup HTML Canvas Element
    const canvas = document.createElement('canvas')
    ctn.appendChild(canvas)

    // Initialize WebGL context
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
    if (!gl) {
      console.error('WebGL not supported in this browser.')
      return
    }

    if (transparent) {
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      gl.clearColor(0, 0, 0, 0)
    } else {
      gl.clearColor(0, 0, 0, 1)
    }

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

    // Get attribute & uniform locations
    const positionLoc = gl.getAttribLocation(program, 'position')
    const uvLoc = gl.getAttribLocation(program, 'uv')

    const uTimeLoc = gl.getUniformLocation(program, 'uTime')
    const uResolutionLoc = gl.getUniformLocation(program, 'uResolution')
    const uFocalLoc = gl.getUniformLocation(program, 'uFocal')
    const uRotationLoc = gl.getUniformLocation(program, 'uRotation')
    const uStarSpeedLoc = gl.getUniformLocation(program, 'uStarSpeed')
    const uDensityLoc = gl.getUniformLocation(program, 'uDensity')
    const uHueShiftLoc = gl.getUniformLocation(program, 'uHueShift')
    const uSpeedLoc = gl.getUniformLocation(program, 'uSpeed')
    const uMouseLoc = gl.getUniformLocation(program, 'uMouse')
    const uGlowIntensityLoc = gl.getUniformLocation(program, 'uGlowIntensity')
    const uSaturationLoc = gl.getUniformLocation(program, 'uSaturation')
    const uMouseRepulsionLoc = gl.getUniformLocation(program, 'uMouseRepulsion')
    const uTwinkleIntensityLoc = gl.getUniformLocation(program, 'uTwinkleIntensity')
    const uRotationSpeedLoc = gl.getUniformLocation(program, 'uRotationSpeed')
    const uRepulsionStrengthLoc = gl.getUniformLocation(program, 'uRepulsionStrength')
    const uMouseActiveFactorLoc = gl.getUniformLocation(program, 'uMouseActiveFactor')
    const uAutoCenterRepulsionLoc = gl.getUniformLocation(program, 'uAutoCenterRepulsion')
    const uTransparentLoc = gl.getUniformLocation(program, 'uTransparent')

    function resize() {
      const scale = 1
      canvas.width = ctn.offsetWidth * scale
      canvas.height = ctn.offsetHeight * scale
      gl!.viewport(0, 0, canvas.width, canvas.height)
    }
    window.addEventListener('resize', resize, false)
    resize()

    let animateId: number

    function update(t: number) {
      animateId = requestAnimationFrame(update)

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

      const timeVal = t * 0.001
      const starSpeedVal = disableAnimation ? starSpeed : (timeVal * starSpeed) / 10.0

      const lerpFactor = 0.05
      smoothMousePos.current.x += (targetMousePos.current.x - smoothMousePos.current.x) * lerpFactor
      smoothMousePos.current.y += (targetMousePos.current.y - smoothMousePos.current.y) * lerpFactor
      smoothMouseActive.current += (targetMouseActive.current - smoothMouseActive.current) * lerpFactor

      // Set uniforms
      gl!.uniform1f(uTimeLoc, timeVal)
      gl!.uniform3f(uResolutionLoc, canvas.width, canvas.height, canvas.width / canvas.height)
      gl!.uniform2f(uFocalLoc, focal[0], focal[1])
      gl!.uniform2f(uRotationLoc, rotation[0], rotation[1])
      gl!.uniform1f(uStarSpeedLoc, starSpeedVal)
      gl!.uniform1f(uDensityLoc, density)
      gl!.uniform1f(uHueShiftLoc, hueShift)
      gl!.uniform1f(uSpeedLoc, speed)
      gl!.uniform2f(uMouseLoc, smoothMousePos.current.x, smoothMousePos.current.y)
      gl!.uniform1f(uGlowIntensityLoc, glowIntensity)
      gl!.uniform1f(uSaturationLoc, saturation)
      gl!.uniform1i(uMouseRepulsionLoc, mouseRepulsion ? 1 : 0)
      gl!.uniform1f(uTwinkleIntensityLoc, twinkleIntensity)
      gl!.uniform1f(uRotationSpeedLoc, rotationSpeed)
      gl!.uniform1f(uRepulsionStrengthLoc, repulsionStrength)
      gl!.uniform1f(uMouseActiveFactorLoc, smoothMouseActive.current)
      gl!.uniform1f(uAutoCenterRepulsionLoc, autoCenterRepulsion)
      gl!.uniform1i(uTransparentLoc, transparent ? 1 : 0)

      // Render the single full-screen triangle
      gl!.drawArrays(gl!.TRIANGLES, 0, 3)
    }
    animateId = requestAnimationFrame(update)

    function handleMouseMove(e: MouseEvent) {
      const rect = ctn.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = 1.0 - (e.clientY - rect.top) / rect.height
      targetMousePos.current = { x, y }
      targetMouseActive.current = 1.0
    }

    function handleMouseLeave() {
      targetMouseActive.current = 0.0
    }

    if (mouseInteraction) {
      ctn.addEventListener('mousemove', handleMouseMove)
      ctn.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      cancelAnimationFrame(animateId)
      window.removeEventListener('resize', resize)
      if (mouseInteraction) {
        ctn.removeEventListener('mousemove', handleMouseMove)
        ctn.removeEventListener('mouseleave', handleMouseLeave)
      }
      
      // Clean up WebGL resources
      gl.deleteBuffer(positionBuffer)
      gl.deleteBuffer(uvBuffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)

      if (ctn.contains(canvas)) {
        ctn.removeChild(canvas)
      }
    }
  }, [
    focal,
    rotation,
    starSpeed,
    density,
    hueShift,
    disableAnimation,
    speed,
    mouseInteraction,
    glowIntensity,
    saturation,
    mouseRepulsion,
    twinkleIntensity,
    rotationSpeed,
    repulsionStrength,
    autoCenterRepulsion,
    transparent
  ])

  return <div ref={ctnDom} className="galaxy-container" {...rest} />
}
