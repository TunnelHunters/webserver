import path from 'path';
import { Server } from 'http'
import express from 'express';
import SocketIOServer from 'socket.io';
import RCM from './lib/robotConnectionManager';
import { home } from './routes';

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

// HTTP/SOCKETIO SERVER
const httpServer = new Server(expressApp);
const socketIOServer = SocketIOServer(httpServer);

// CLIENT SOCKET STUFF
const clientSocketServer = socketIOServer.of('/client');
clientSocketServer.on('connect', socket => {
    console.log('Somebody (client) connected!');
    const robotNum = Number(socket.handshake.query.botNum);
    try {
        robotConnections[robotNum].clientConnect(socket);
    }
    catch(error) {
        if (error === 'noRobot') {
            console.error(`Client tried to posess robot ${robotNum}, robot ${robotNum} is not available`);
            return socket.emit('THZ_error', `Robot ${robotNum} not available`);
        }
        else if (error === 'alreadyPosessed') {
            console.error(`Client tried to posess robot ${robotNum}, robot ${robotNum} is already posessed`);
            return socket.emit('THZ_error', `Robot ${robotNum} is alredy posessed`);
        }
        throw error;
    }
});

// ROBOT SOCKET STUFF
const robotSocketServer = socketIOServer.of('/robot');
robotSocketServer.on('connection', socket => {
    console.log('Somebody (robot) connected!');
    const robotNum = Number(socket.handshake.query.botNum);
    try {
        robotConnections[robotNum].robotConnect(socket);
    }
    catch(error) {
        if (error === 'robotAlreadyConnected') {
            console.error(`Something tried connecting as robot ${robotNum} but robot ${robotNum} already connected`);
            return socket.emit('THZ_error', 'Somebody got you beat, pally');
        }
        throw error
    }
});

httpServer.listen(8000);
