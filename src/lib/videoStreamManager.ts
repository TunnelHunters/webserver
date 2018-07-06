import { Socket } from 'net'
import { EventEmitter } from 'events'

export default class videoStreamManager extends EventEmitter {

    constructor(private socket: Socket) {
        super();
    }

}