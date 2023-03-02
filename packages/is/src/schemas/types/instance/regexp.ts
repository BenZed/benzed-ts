import { InstanceValidator, TypeSchema } from '@benzed/schema'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/ban-types
*/

//// Main ////

class RegExpValidator extends InstanceValidator<RegExpConstructor> {

    constructor() {
        super(globalThis.RegExp)
    }

}

class RegExp extends TypeSchema<RegExpValidator, {}> {

    constructor() {
        super(new RegExpValidator, {})
    }

}

//// Exports ////

export { RegExp }

export const $regexp = new RegExp