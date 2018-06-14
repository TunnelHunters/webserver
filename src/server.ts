import { Server } from 'http'
import express from 'express'
import socketio from 'socket.io'

const app = express();
const server = new Server(app);
const io = socketio(server);

server.listen(6969);
