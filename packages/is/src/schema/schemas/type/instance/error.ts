import Instance from './instance'

//// Exports ////

export class Error extends Instance<ErrorConstructor> {
    constructor() {
        super(Error)
    }

    // get like(): Json<Error> { } // TODO add me
}

export const isError = new Error