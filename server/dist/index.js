import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import { userManager } from './manager/UserManager.js';
const app = express();
const server = createServer(app);
const user_manager = new userManager();
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    }
});
io.on('connection', (socket) => {
    console.log('a user connected');
    user_manager.addUser('client', socket);
    socket.on('message', (data) => {
        console.log('data is ', data);
    });
    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });
});
server.listen(4000, () => console.log('socket server started'));
