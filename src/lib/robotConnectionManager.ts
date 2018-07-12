import { Socket } from 'socket.io'
import { Type, DOFToken, KeyPressToken } from './token';

export default class robotConnectionManager {

    private robotSocket: Socket;
    private clientSocket: Socket;
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
            this.keys.ArrowUp - this.keys.ArrowDown,
            this.keys.ArrowRight - this.keys.ArrowLeft
        ).stringify());
    }

    /**
     * When the client connects and wants to posess this robot
     * @param {SocketIO.Socket} socket - the Socket.io socket connected to the client
     */
    clientConnect(socket: Socket): void {
        if (!this.robotIsConnected())
            throw 'noRobot';
        if (this.clientIsConnected())
            throw 'alreadyPosessed';

        // Attach listeners here
        socket.on(Type.KEYPRESS, this.onKeyPress.bind(this));

        // Let the robot know it just got posessed
        this.robotSocket.emit('clientConnected');

        // Acctually store the socket in this object
        this.clientSocket = socket;
        console.log(`Client posessed robot ${this.robotNum}`);
    }

    /**
     * When the robot connects on startup
     * @param {SocketIO.Socket} socket - the Socket.io socket connecteds to the robot
     */
    robotConnect(socket: Socket): void {
        if (this.robotIsConnected())
            throw 'robotAlreadyConnected';

        socket.on('close', this.onRobotDisconnect.bind(this));
        socket.on('frame', (frame: Buffer) => {
            // TODO: This is temporary
            console.log(`FRAME RECEIVED!!!! size: ${frame.length}`);
            this.clientSocket.emit('frame', frame);
        });

        this.robotSocket = socket;
        console.log(`Robot ${this.robotNum} connected.`);
    }

}