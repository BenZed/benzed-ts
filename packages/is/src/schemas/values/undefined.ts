import { Equal } from './equal'

//// Main ////

export class Undefined extends Equal<undefined> {

    constructor() {
        super(undefined)
    }

}

//// Exports ////

export const $undefined = new Undefined