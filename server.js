const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true)
    await handle(req, res, parsedUrl)
  })

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  // Store online users
  const onlineUsers = new Map()

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // User joins with their userId
    socket.on('join', (userId) => {
      onlineUsers.set(userId, socket.id)
      socket.userId = userId
      console.log(`User ${userId} joined with socket ${socket.id}`)
      
      // Broadcast online users
      io.emit('users-online', Array.from(onlineUsers.keys()))
    })

    // Send message
    socket.on('send-message', (data) => {
      const { receiverId, message } = data
      const receiverSocketId = onlineUsers.get(receiverId)
      
      if (receiverSocketId) {
        // Send to receiver
        io.to(receiverSocketId).emit('receive-message', {
          senderId: socket.userId,
          message
        })
      }
    })

    // Typing indicator
    socket.on('typing', (data) => {
      const { receiverId } = data
      const receiverSocketId = onlineUsers.get(receiverId)
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user-typing', {
          userId: socket.userId
        })
      }
    })

    socket.on('stop-typing', (data) => {
      const { receiverId } = data
      const receiverSocketId = onlineUsers.get(receiverId)
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user-stop-typing', {
          userId: socket.userId
        })
      }
    })

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId)
        console.log(`User ${socket.userId} disconnected`)
        io.emit('users-online', Array.from(onlineUsers.keys()))
      }
    })
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      console.log('> Socket.IO server running')
    })
})
