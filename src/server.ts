import path from 'path';
import { Server as TCPServer, Socket } from 'net';
import { Server as HTTPServer } from 'http'
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

// TCP Server
const tcpServer = new TCPServer((socket: Socket) => {
    let setupData: { botNum: number };
    const handleSetup = (data: Buffer): void => {
        try {
            setupData = JSON.parse(data.toString());
            robotConnections[setupData.botNum].videoStreamConnect(socket);
        }
        catch(error) {
            if (error instanceof SyntaxError)
                return console.error(`Malformed setup data: ${data}`);

            throw error
        }
        finally {
            socket.removeListener('data', handleSetup);
        }
    };
    socket.on('data', handleSetup);
});
tcpServer.listen(8001, () => console.log('TCP server listening!!'));

// EXPRESS STUFF
const expressApp = express()
    .use('/public', express.static(path.join(process.cwd(), 'dist', 'public')))
    .use('/', home)
    .get('/client/video', (req, res) => {
        console.log('Somebody (client video stream) connected!!');
        robotConnections[req.query.botNum].clientVideoConnect(res);
    });

// HTTP SERVER
const httpServer = new HTTPServer(expressApp)
    .on('error', error => console.error(error))
    .on('clientError', error => console.error(error));

// CLIENT SOCKET STUFF
const socketIOServer = socketio(httpServer);
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
        robotConnections[Number(socket.handshake.query.botNum)].videoControlConnect(socket);
    });

httpServer.listen(8000, () => console.log('HTTP server listening!'));


