import { Equal } from './equal'

//// Exports ////

export class Null extends Equal<null> {

    constructor() {
        super(null)
    }

}

export const $null = new Null