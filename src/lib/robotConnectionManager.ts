import { Socket as TCPSocket } from 'net';
import { Response } from 'express';
import { Socket } from 'socket.io'
import { Type, DOFToken, KeyPressToken } from './token';

export default class robotConnectionManager {

    private robotSocket: Socket;
    private videoControlSocket: Socket;
    private clientSocket: Socket;
    private clientVideoResponse: Response;
    private keys: { [key: string]: number } = {
        ArrowUp: 0,
        ArrowDown: 0,
        ArrowLeft: 0,
        ArrowRight: 0,
    };

    /**
     * Ye constructor, o lord!!
     * @param {number} robotNum - The robot number that this RCM will represent
     */
    constructor(private robotNum: number) {
        console.log(`Makin space for robot ${robotNum}.`);
    }

    /**
     * When the robot connects on startup
     * @param {SocketIO.Socket} socket - the Socket.io socket connecteds to the robot
     */
    robotConnect(socket: Socket): void {
        if (this.robotIsConnected) {
            console.error(`Something tried connecting as robot ${this.robotNum} but robot ${this.robotNum} is already connected`);
            socket.emit('THZ_error', 'Somebody\'s already connected to that robot');
            return;
        }

        // set up some listeners
        socket.on('disconnect', this.onRobotDisconnect.bind(this));

        // store socket in object
        this.robotSocket = socket;
        console.log(`Robot ${this.robotNum} connected.`);
    }
    videoControlConnect(socket: Socket): void {
        if (this.videoIsConnected) {
            console.error(`Robot ${this.robotNum}'s video control socket is already connected`);
            socket.emit('Another video control socket from the same robot is connected');
            return;
        }

        // listeners
        socket.on('disconnect', this.onVideoDisconnect.bind(this));

        // store socket in object
        this.videoControlSocket = socket;
        console.log(`Video control socket from robot ${this.robotNum} connected`);
    }
    videoStreamConnect(socket: TCPSocket): void {
        console.log(`Video stream from robot ${this.robotNum} connected`);

        // Tell the video slave to let that shit rip
        socket.write('OK');

        socket.on('data', data => console.log(data.length));
        socket.pipe(this.clientVideoResponse);
    }
    /**
     * When the client connects and wants to posess this robot
     * @param {SocketIO.Socket} socket - the Socket.io socket connected to the client
     */
    clientConnect(socket: Socket): void {
        // if (!this.robotIsConnected) {
        //     console.error(`Client tried to posess robot ${this.robotNum}, robot ${this.robotNum} is not available`);
        //     socket.emit('THZ_error', `Robot ${this.robotNum} not available`);
        //     return;
        // }
        if (this.clientIsConnected) {
            console.error(`Client tried to posess robot ${this.robotNum}, robot ${this.robotNum} is already posessed`);
            socket.emit('THZ_error', `Robot ${this.robotNum} is alredy posessed`);
            return;
        }

        // Attach listeners here
        socket.on('disconnect', this.onClientDisconnect.bind(this));
        socket.on(Type.KEYPRESS, this.onKeyPress.bind(this));

        // Let the robot know it just got posessed
        this.sendToRobot('clientConnected');

        // Acctually store the socket in this object
        this.clientSocket = socket;
        console.log(`Client posessed robot ${this.robotNum}.`);
    }
    clientVideoConnect(res: Response): void {
        console.log(`Client asked for video from robot ${this.robotNum}`);
        res.setHeader('Transfer-Encoding', 'chunked');
        this.clientVideoResponse = res;
        this.sendToVideoSlave('start_video');
    }

    private sendToRobot(event: string, payload?: object): void {
        if (!this.robotIsConnected)
            return console.error(`Robot not connected, event ${event} rejected.`);

        this.robotSocket.emit(event, payload);
    }
    private sendToClient(event: string, payload?: object): void {
        if (!this.clientIsConnected)
            return console.error(`Client not connected, event ${event} rejected.`);

        this.clientSocket.emit(event, payload);
    }
    private sendToVideoSlave(event: string, payload?: object): void {
        if (!this.videoIsConnected)
            return console.error(`Video slave not connected, event ${event} rejected.`);

        if (payload)
            this.videoControlSocket.emit(event, payload);
        else
            this.videoControlSocket.emit(event);
    }

    private onKeyPress(data: KeyPressToken) {
        this.keys[data.key] = data.state === 'down' ? 1 : 0;
        this.robotSocket.send(new DOFToken(
            this.keys.ArrowUp - this.keys.ArrowDown,
            this.keys.ArrowRight - this.keys.ArrowLeft
        ).stringify());
    }

    private onRobotDisconnect(reason: string) {
        this.robotSocket = undefined;
        console.log(`Robot ${this.robotNum} disconnected because ${reason}.`);
    }
    private onVideoDisconnect(reason: string) {
        this.videoControlSocket = undefined;
        console.log(`Video control socket from robot ${this.robotNum} disconnected because ${reason}`);
    }
    private onClientDisconnect(reason: string) {
        this.clientSocket = undefined;
        console.log(`Client posessing robot ${this.robotNum} disconnected because ${reason}`);
    }

    get robotIsAvailable(): boolean {
        return this.robotIsConnected && this.videoIsConnected;
    }

    private get robotIsConnected(): boolean {
        return this.robotSocket !== undefined
            && this.robotSocket.connected;
    }
    private get videoIsConnected(): boolean {
        return this.videoControlSocket !== undefined
            && this.videoControlSocket.connected;
    }
    private get clientIsConnected(): boolean {
        return this.clientSocket !== undefined
            && this.clientSocket.connected;
    }

}
