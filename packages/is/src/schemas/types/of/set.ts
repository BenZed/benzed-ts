import { InstanceValidator, TypeSchema } from '@benzed/schema'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/ban-types
*/

// TODO This is an instance validator, not an 'of' validator.

//// Main ////

class SetValidator extends InstanceValidator<SetConstructor> {

    constructor() {
        super(globalThis.Set)
    }

}

class Set extends TypeSchema<SetValidator, {}> {

    constructor() {
        super(new SetValidator, {})
    }

}

//// Exports ////

export { Set }

export const $set = new Set