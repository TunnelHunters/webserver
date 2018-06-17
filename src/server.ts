import path from 'path'
import { Server } from 'http'
import express from 'express'
import socketio from 'socket.io'
import RCM from './lib/robotConnectionManager'
import { home } from './routes'
import { Type } from './lib/token'

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
    console.log(`someone connected! botNum: ${socket.handshake.query.botNum}`);

    socket.on('disconnect', (reason: string): void => {
        console.log(`bot ${socket.handshake.query.botNum} disconnected with reason ${reason}`)
    });
    socket.on(Type.KEYPRESS, (data: object): void => {
        console.log(data);
        socket.emit('response', 'received');
    });
});

server.listen(80);
console.log(robotConnections[1].robotIsConnected());
