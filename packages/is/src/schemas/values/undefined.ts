import { Value } from './value'

//// Exports ////

export class Undefined extends Value<undefined> {

    constructor() {
        super(undefined)
    }

}

export const $undefined = new Undefined