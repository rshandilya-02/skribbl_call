import { RoomManager } from './RoomManager.js';
export class userManager {
    users;
    queue;
    roomManager;
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager();
    }
    addUser(name, socket) {
        this.users.push({ username: name, socket: socket });
        this.queue.push(socket.id);
        this.clearQueue(socket.id);
        this.initHandlers(socket);
    }
    removeUser(socketId) {
        this.users = this.users.filter((user) => user.socket.id !== socketId);
    }
    clearQueue(socketId) {
        if (this.queue.length < 2) {
            return;
        }
        const user1 = this.users.find((user) => user.socket.id === socketId);
        this.queue.pop();
        const user2_socketId = this.queue.pop();
        //race condition might appear
        const user2 = this.users.find((user) => user.socket.id === user2_socketId);
        if (!user1 || !user2)
            return;
        this.roomManager.createRoom(user1, user2);
    }
    initHandlers(socket) {
        console.log('sender socket id ', socket.id);
        console.log('socket initHandlers');
        // console.log(socket);
        socket.onAny((eventName) => {
            console.log('eventName is ', eventName);
        });
        socket.on("offer", (data) => {
            console.log('data is ', data);
            this.roomManager.onOffer(data);
        });
        socket.on("answer", (data) => {
            console.log('answe backend socket');
            console.log('data is answer in ', data);
            this.roomManager.onAnswer(data);
        });
        socket.on("icecandidate", (data) => {
            console.log('ice candidate data');
            this.roomManager.onIceCandidate(socket, data);
        });
    }
}
