import path from 'path';
import { Server } from 'http'
import express from 'express';
import socketio from 'socket.io';
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
const socketIOServer = socketio(httpServer);

// CLIENT SOCKET STUFF
socketIOServer
    .of('/client')
    .on('connection', socket => {
        console.log('Somebody (client) connected!');
        robotConnections[Number(socket.handshake.query.botNum)].clientConnect(socket);
    });

// ROBOT SOCKET STUFF
socketIOServer
    .of('/robot')
    .on('connection', socket => {
        console.log('Somebody (robot) connected!');
        robotConnections[Number(socket.handshake.query.botNum)].robotConnect(socket);
    });

// VIDEO SOCKET STUFF
socketIOServer
    .of('/robot/video')
    .on('connection', socket => {
        console.log('Somebody (video slave) connected!');
        robotConnections[Number(socket.handshake.query.botNum)].videoConnect(socket);
    });

httpServer.listen(8000);
