import path from 'path';
import { Server } from 'http';
import { parse } from 'url';
import { createServer } from 'net';
import express from 'express';
import socketio from 'socket.io';
import WebSocket from 'ws';
import RCM from './lib/robotConnectionManager';
import { home } from './routes';
import { ErrorToken } from './lib/token';

// holds connections to webpage, robot and video streams, and sets up listeners
let robotConnections: { [key: number]: RCM } = {
    1: new RCM(1),
    2: new RCM(2),
    3: new RCM(3),
    4: new RCM(4)
};

// EXPRESS STUFF
const expressApp = express();
expressApp.use('/public', express.static(path.join(process.cwd(), 'dist', 'public')));
expressApp.use('/', home);

// HTTP SERVER AND SOCKETIO STUFF
const httpServer = new Server(expressApp);
const socketioServer = socketio(httpServer);
socketioServer.on('connect', socket => {
    console.log('Somebody (client) connected!');
    const robotNum = Number(socket.handshake.query.botNum);
    try {
        robotConnections[robotNum].clientConnect(socket);
    }
    catch(error) {
        if (error === 'noRobot')
            socket.write(new ErrorToken(`Robot ${robotNum} not available`));
        else if (error === 'alreadyPosessed')
            socket.write(new ErrorToken(`Robot ${robotNum} is alredy posessed`));
        else
            throw error;
    }
});
httpServer.listen(8000);

// ROBOT WS STUFF
const websocketServer = new WebSocket.Server({ port: 8080 });
websocketServer.on('connection', (socket, request) => {
    console.log('Somebody (robot) connected!');
    const robotNum = Number(parse(request.url, true).query.robot_num);
    robotConnections[robotNum].robotConnect(socket);
});

// VIDEO TCP SOCKET STUFF
const tcpSocketServer = createServer(socket => {
    console.log(`Somebody connected! Their address is: ${socket.address()}`);
});
tcpSocketServer.listen(8081);
