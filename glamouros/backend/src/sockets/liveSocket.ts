import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'

let io: SocketIOServer | null = null

export const initSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log(`🔌 Client socket terminal connected: ${socket.id}`)

    socket.on('join_branch', (branchId: string) => {
      socket.join(branchId)
      console.log(`👁️ Terminal joined branch channel isolation: ${branchId}`)
    })

    socket.on('disconnect', () => {
      console.log(`🔌 Client socket terminal disconnected: ${socket.id}`)
    })
  })

  return io
}

// Broadcast helper for real-time push updates
export const emitLiveEvent = (eventType: string, data: any, branchId?: string) => {
  if (!io) return

  if (branchId) {
    // Send to specific branch terminal instances
    io.to(branchId).emit(eventType, data)
  } else {
    // Global broadcast
    io.emit(eventType, data)
  }
}
