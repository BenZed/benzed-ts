import { Value } from './equal'

//// Main ////

export class Undefined extends Value<undefined> {

    constructor() {
        super(undefined)
    }

}

//// Exports ////

export const $undefined = new Undefined