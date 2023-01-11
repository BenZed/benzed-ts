import IsInstance from './is-instance'

//// Exports ////

export class IsDate extends IsInstance<DateConstructor> {
    constructor() {
        super(Date)
    }
}

export const isDate = new IsDate