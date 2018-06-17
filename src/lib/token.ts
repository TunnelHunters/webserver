export enum Type {
	KEYPRESS = 'keyPress'
}

class token {
    // assign vlaues from payload to this
	constructor(public type: Type, payload: object) {
		this.type = type;
		Object.assign(this, payload);
	}
}

export class keyPressToken extends token {
	constructor(key: string, state: string) {
		super(Type.KEYPRESS, {key: key, state: state});
	}
}
