import { InstanceValidator, TypeSchema } from '@benzed/schema'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/ban-types
*/

//// Main ////

class WeakSetValidator extends InstanceValidator<WeakSetConstructor> {

    constructor() {
        super(globalThis.WeakSet)
    }

}

class WeakSet extends TypeSchema<WeakSetValidator, {}> {

    constructor() {
        super(new WeakSetValidator, {})
    }

}

//// Exports ////

export { WeakSet }

export const $weakset = new WeakSet