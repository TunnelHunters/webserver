import { moveToken } from './token';
import 'socket.io-client'

// object that keeps track of keys being held down
const socket = io();
const keyMap: { [key: string]: boolean } = {};
const keyFunctionMap: { [key: string]: (event: KeyboardEvent, state: string) => void } = {
	ArrowLeft: sendArrowKey,
	ArrowRight: sendArrowKey,
	ArrowUp: sendArrowKey,
	ArrowDown: sendArrowKey
};

document.addEventListener('keydown', event => {
	if (keyMap[event.key]) return;
	keyMap[event.key] = true;
	keyFunctionMap[event.key](event, 'down');
});
document.addEventListener('keyup', event => {
	delete keyMap[event.key];
	keyFunctionMap[event.key](event, 'up');
});

function sendArrowKey(event: KeyboardEvent, state: string): void {
	console.log(event.key, state);
	console.log(new moveToken(event.key, state));
}
