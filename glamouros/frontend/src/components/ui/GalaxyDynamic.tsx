'use client'

import dynamic from 'next/dynamic'

// Dynamically import to avoid SSR issues with WebGL
const Galaxy = dynamic(() => import('./Galaxy'), { ssr: false })

export default Galaxy
