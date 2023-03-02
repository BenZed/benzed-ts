import { InstanceValidator, TypeSchema } from '@benzed/schema'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/ban-types
*/

//// Main ////

class PromiseValidator extends InstanceValidator<PromiseConstructor> {

    constructor() {
        super(globalThis.Promise)
    }

}

class Promise extends TypeSchema<PromiseValidator, {}> {

    constructor() {
        super(new PromiseValidator, {})
    }

}

//// Exports ////

export { Promise }

export const $promise = new Promise