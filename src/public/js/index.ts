import { keyPressToken } from '../../lib/token';
import io from 'socket.io-client';

// object that keeps track of keys being held down
const socket = io({
	query: { botNum: 1 }
});
const keyMap: { [key: string]: boolean } = {};
const keyFunctionMap: { [key: string]: (event: KeyboardEvent, state: string) => void } = {
	ArrowLeft: sendArrowKey,
	ArrowRight: sendArrowKey,
	ArrowUp: sendArrowKey,
	ArrowDown: sendArrowKey
};

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
	const token: keyPressToken = new keyPressToken(event.key, state);
	console.debug(token);
	socket.emit(token.type, token);
}
