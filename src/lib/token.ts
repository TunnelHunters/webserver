export enum Type {
	ERROR = 'error',
	KEYPRESS = 'keyPress',
	DOF = 'DOF'
}

class Token {
    // assign vlaues from payload to this
	constructor(public type: Type, payload: object) {
		this.type = type;
		Object.assign(this, payload);
	}

	stringify(): string {
		return JSON.stringify(this);
	}
}

export class KeyPressToken extends Token {
	key: string;
	state: string;

	constructor(key: string, state: string) {
		super(Type.KEYPRESS, {
			key: key,
			state: state
		});
	}
}
export class ErrorToken extends Token {
	constructor(message: string) {
		super(Type.ERROR, {
			message: message
        });
	}
}
export class DOFToken extends Token {
	constructor(FB: number, rotate: number) {
		super(Type.DOF, {
			DOF: [FB, rotate]
		});
	}
}
