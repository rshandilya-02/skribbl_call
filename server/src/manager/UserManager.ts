import { Socket } from "socket.io";
import { RoomManager } from './RoomManager';

export interface User {
    username: string,
    socket: Socket
}

export class userManager {
    private users: User[];
    private queue: string[];
    private roomManager: RoomManager;

    constructor() {
        this.users = []; 
        this.queue = [];
        this.roomManager = new RoomManager();
    }

    addUser(name: string, socket: Socket) {
        this.users.push({ username: name, socket: socket });
        this.queue.push(socket.id);
        this.clearQueue(socket.id);
        this.initHandlers(socket);
    }

    removeUser(socketId:string) {
        this.users = this.users.filter((user) => user.socket.id !== socketId);
    }

    clearQueue(socketId:string) {
        if (this.queue.length < 2) {
            return;
        }

        const user1 = this.users.find((user) => user.socket.id === socketId);
        const user2_socketId = this.queue.pop();

        //race condition might appear
        const user2 = this.users.find((user) => user.socket.id === user2_socketId);
        if (!user1 || !user2) return;
        this.roomManager.createRoom(user1, user2);

    }

    initHandlers(socket:Socket) {
        socket.on("offer", ({ sdp, roomId }) => {
            this.roomManager.onOffer(roomId, sdp);
        });
        socket.on("answer", (sdp, roomId) => {
            this.roomManager.onAnswer(roomId, sdp);
        })
    }
}