import ws from 'ws'
import socketio from 'socket.io'

export default class robotConnectionManager {

    private robotSocket: ws;
    private clientSocket: socketio.Socket;

    constructor(private robotNum: number) {
        console.log(`Makin space for robot ${robotNum}`);
    }
    
    robotIsPosessed(): boolean {
        return this.clientSocket.connected;
    }

    robotIsConnected(): boolean {
        return this.robotSocket === undefined;
    }

}