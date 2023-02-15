import { Value } from './equal'

//// Exports ////

export class Null extends Value<null> {

    constructor() {
        super(null)
    }

}

export const $null = new Null