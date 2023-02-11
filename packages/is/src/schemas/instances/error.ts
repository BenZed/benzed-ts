import { InstanceValidator, Schema } from '@benzed/schema'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/ban-types
*/

//// Main ////

class ErrorValidator extends InstanceValidator<ErrorConstructor> {
    constructor() {
        super(globalThis.Error)
    }
}

class Error extends Schema<ErrorValidator, {}> {

    constructor() {
        super(new ErrorValidator, {})
    }

}

//// Exports ////

export { Error }

export const $error = new Error