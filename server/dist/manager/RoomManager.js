;
let GLOBAL_ROOM_ID = 1;
export class RoomManager {
    rooms;
    constructor() {
        this.rooms = new Map();
    }
    ;
    createRoom(user1, user2) {
        console.log('room creation starts');
        const roomId = this.generate();
        console.log('generated roomId ', roomId);
        console.log('cerate room ', user1.socket.id);
        console.log('cerate room 2 ', user2.socket.id);
        this.rooms.set(roomId.toString(), {
            user1,
            user2
        });
        user1.socket.emit('send-offer', JSON.stringify({
            roomId: roomId
        }));
    }
    // onOffer(roomId: string, sdp: string) {
    //     const user2 = this.rooms.get(roomId)?.user2;
    //     user2?.socket.emit(
    //         "offer", {
    //         sdp
    //     }
    //     );
    // }
    onOffer(data) {
        console.log('inside ofer');
        console.log('rooms ', this.rooms);
        const user2 = this.rooms.get('1')?.user2;
        console.log('user1 ', this.rooms.get('1')?.user1.socket.id);
        console.log('user2 ', this.rooms.get('1')?.user2.socket.id);
        const data1 = JSON.parse(data);
        user2?.socket.emit("message", JSON.stringify({
            type: "offer",
            data: data1
        }));
    }
    onAnswer(data) {
        const user1 = this.rooms.get('1')?.user1;
        const nd = JSON.parse(data);
        console.log('ready to send answer to receiver ', user1?.socket.id);
        user1?.socket.emit("answer", JSON.stringify({
            roomId: 1,
            data: data
        }));
    }
    onIceCandidate(socket, data) {
        console.log('ice candidate event');
        const socketId = socket.id;
        const user1_socket = this.rooms.get('1')?.user1.socket;
        const user2_socket = this.rooms.get('1')?.user2.socket;
        console.log(socketId, ' u1 ', user1_socket.id, ' u2 ', user2_socket.id);
        if (socket.id === user1_socket.id) {
            //send to user2
            console.log('send to user2');
            const nd = JSON.parse(data);
            user2_socket.emit('icecandidate', JSON.stringify({ data: data }));
        }
        else {
            console.log('send to user1');
            const nd = JSON.parse(data);
            user1_socket.emit('icecandidate', JSON.stringify({ data: data }));
        }
    }
    generate() {
        return GLOBAL_ROOM_ID++;
    }
}
