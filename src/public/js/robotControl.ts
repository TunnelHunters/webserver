import { KeyPressToken } from '../../lib/token';
import SocketIOClient from 'socket.io-client';
import $ from 'jquery';
const jsmpeg = require('jsmpeg');

// object that keeps track of keys being held down
const websocket = new WebSocket(`ws://${window.location.hostname}:8000/client/video?botNum=1`);
websocket.onmessage = () => console.log('I GOT SOME SHIT');
const keyMap: { [key: string]: boolean } = {};
const keyFunctionMap: { [key: string]: (event: KeyboardEvent, state: string) => void } = {
	ArrowLeft: sendArrowKey,
	ArrowRight: sendArrowKey,
	ArrowUp: sendArrowKey,
	ArrowDown: sendArrowKey
};
let player;

$(window).on('load', () => {
	player = new jsmpeg(websocket, { canvas: $('#videoCanvas') });
});

// actual key press listeners
document.addEventListener('keydown', event => {
	if (keyMap[event.key]) return;
	keyMap[event.key] = true;
	keyFunctionMap[event.key](event, 'down');
});
document.addEventListener('keyup', event => {
	delete keyMap[event.key];
	keyFunctionMap[event.key](event, 'up');
});

// sends a keyPress token to the webserver
function sendArrowKey(event: KeyboardEvent, state: string): void {
	const token: KeyPressToken = new KeyPressToken(event.key, state);
	console.debug(token);
	socket.emit(token.type, token);
}

const socket = SocketIOClient('/client', { query: { botNum: 1 } });
socket.on('connect', () => console.debug('connected to webserver!!'));
socket.on('message', console.debug);
