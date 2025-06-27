import { Server, Socket } from 'socket.io';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id} at ${new Date().toISOString()}`);
    
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.id} - Reason: ${reason} at ${new Date().toISOString()}`);
    });

    socket.on('test-event', (data) => {
      console.log('Received test event:', data);
      socket.emit('test-response', { 
        message: 'Server received your message',
        timestamp: new Date().toISOString(),
        originalData: data
      });
    });
  });
};