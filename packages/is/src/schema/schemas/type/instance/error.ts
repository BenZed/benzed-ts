import IsInstance from './instance'

//// Exports ////

export class IsError extends IsInstance<ErrorConstructor> {
    constructor() {
        super(Error)
    }

    // get like(): IsJson<Error> { } // TODO add me
}

export const isError = new IsError