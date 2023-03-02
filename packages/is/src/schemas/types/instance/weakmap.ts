import { InstanceValidator, TypeSchema } from '@benzed/schema'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/ban-types
*/

//// Main ////

class WeakMapValidator extends InstanceValidator<WeakMapConstructor> {

    constructor() {
        super(globalThis.WeakMap)
    }

}

class WeakMap extends TypeSchema<WeakMapValidator, {}> {

    constructor() {
        super(new WeakMapValidator, {})
    }

}

//// Exports ////

export { WeakMap }

export const $weakmap = new WeakMap