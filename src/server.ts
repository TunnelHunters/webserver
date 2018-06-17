import path from 'path';
import { Server } from 'http';
import { parse } from 'url';
import express from 'express';
import socketio from 'socket.io';
import WebSocket from 'ws';
import RCM from './lib/robotConnectionManager';
import { home } from './routes';
import {DOFToken, ErrorToken} from './lib/token';

const app = express();
const server = new Server(app);
const socketioServer = socketio(server);

// holds socket.io sockets to webpages
let robotConnections: { [key: number]: RCM } = {
    1: new RCM(1),
    2: new RCM(2),
    3: new RCM(3),
    4: new RCM(4)
};

app.use('/public', express.static(path.join(process.cwd(), 'dist', 'public')));
app.use('/', home);

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

server.listen(80);

const websocketServer = new WebSocket.Server({ port: 8080 });

websocketServer.on('connection', (socket, request) => {
    console.log('Somebody (robot) connected!');
    const robotNum = Number(parse(request.url, true).query.robot_num);
    robotConnections[robotNum].robotConnect(socket);
    socket.send(new DOFToken(1, 0).stringify());
});
