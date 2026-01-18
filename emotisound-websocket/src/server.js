import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 3002;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
  },
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join-room', ({ roomId }) => {
    console.log(`User ${socket.id} joining room ${roomId}`);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }

    const room = rooms.get(roomId);

    // Notify existing peers about new user
    room.forEach((peerId) => {
      io.to(peerId).emit('peer-joined', socket.id);
      socket.emit('peer-joined', peerId);
    });

    room.add(socket.id);
    socket.join(roomId);
    socket.data.roomId = roomId;
  });

  socket.on('signal', (data) => {
    io.to(data.to).emit('signal', {
      from: socket.id,
      signal: data.signal,
    });
  });

  socket.on('leave-room', () => {
    const roomId = socket.data.roomId;
    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.delete(socket.id);

      // Notify remaining peers
      room.forEach((peerId) => {
        io.to(peerId).emit('peer-left', socket.id);
      });

      if (room.size === 0) {
        rooms.delete(roomId);
      }
    }
    socket.leave(roomId);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    const roomId = socket.data.roomId;
    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.delete(socket.id);

      room.forEach((peerId) => {
        io.to(peerId).emit('peer-left', socket.id);
      });

      if (room.size === 0) {
        rooms.delete(roomId);
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
