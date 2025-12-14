import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'node:http';

const app = express(); 
const server = createServer(app);

const io = new Server(server);

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('a user disconnected');
    })
});

server.listen(3001, () => console.log('socket server started'));