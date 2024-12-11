import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { Notice, Event } from '../types';

export function initializeSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('notice:add', (notice: Notice) => {
      io.emit('notice:added', notice);
    });

    socket.on('notice:delete', (id: string) => {
      io.emit('notice:deleted', id);
    });

    socket.on('notice:update', (notice: Notice) => {
      io.emit('notice:updated', notice);
    });

    socket.on('event:add', (event: Event) => {
      io.emit('event:added', event);
    });

    socket.on('event:delete', (id: string) => {
      io.emit('event:deleted', id);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}