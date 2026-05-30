'use client'

import dynamic from 'next/dynamic'

// Dynamically import to avoid SSR issues with WebGL / OGL
const EvilEye = dynamic(() => import('./EvilEye'), { ssr: false })

export default EvilEye
