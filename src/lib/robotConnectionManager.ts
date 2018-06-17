import WebSocket from 'ws'
import socketio from 'socket.io'

export default class robotConnectionManager {

    private robotSocket: WebSocket;
    private clientSocket: socketio.Socket;

    constructor(private robotNum: number) {
        console.log(`Makin space for robot ${robotNum}`);
    }
    
    private clientIsConnected(): boolean {
        return this.clientSocket !== undefined
            && this.clientSocket.connected;
    }

    private robotIsConnected(): boolean {
        return this.robotSocket !== undefined;
    }

    private onRobotDisconnect(code: number, reason: string) {
        this.robotSocket = undefined;
        console.log(`Robot ${this.robotNum} disconnected because ${reason}`);
    }

    clientConnect(socket: socketio.Socket): void {
        if (!this.robotIsConnected())
            throw 'noRobot';
        if (this.clientIsConnected())
            throw 'alreadyPosessed';

        this.clientSocket = socket;
        console.log(`Client posessed robot ${this.robotNum}`);
    }

    robotConnect(socket: WebSocket): void {
        if (this.robotIsConnected())
            throw 'robotAlreadyConnected';

        socket.on('close', this.onRobotDisconnect.bind(this));

        this.robotSocket = socket;
        console.log(`Robot ${this.robotNum} connected.`);
    }

}