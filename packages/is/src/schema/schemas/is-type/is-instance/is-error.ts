import IsInstance from './is-instance'

//// Exports ////

export class IsError extends IsInstance<ErrorConstructor> {
    constructor() {
        super(Error)
    }

    // get like(): IsJson<Error> { } // TODO add me
}

