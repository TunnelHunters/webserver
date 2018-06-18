import WebSocket from 'ws'
import socketio from 'socket.io'
import {Type, DOFToken, KeyPressToken} from './token';

export default class robotConnectionManager {

    private robotSocket: WebSocket;
    private clientSocket: socketio.Socket;
    private keys: { [key: string]: number } = {
        ArrowUp: 0,
        ArrowDown: 0,
        ArrowLeft: 0,
        ArrowRight: 0,
    };

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

    private onKeyPress(data: KeyPressToken) {
        this.keys[data.key] = data.state === 'down' ? 1 : 0;
        this.robotSocket.send(new DOFToken(
            this.keys.ArrowRight - this.keys.ArrowLeft,
            this.keys.ArrowUp - this.keys.ArrowDown
        ).stringify());
    }

    clientConnect(socket: socketio.Socket): void {
        if (!this.robotIsConnected())
            throw 'noRobot';
        if (this.clientIsConnected())
            throw 'alreadyPosessed';

        // attach listeners here
        socket.on(Type.KEYPRESS, this.onKeyPress.bind(this));

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