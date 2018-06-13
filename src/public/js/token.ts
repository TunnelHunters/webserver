class token {
    // assign vlaues from payload to this
	constructor(public type: string, payload: object) {
		this.type = type;
		Object.assign(this, payload);
	}
}

export class moveToken extends token {
	constructor(key: string, state: string) {
		super('move', {
			key: key,
			state: state
		});
	}
}
