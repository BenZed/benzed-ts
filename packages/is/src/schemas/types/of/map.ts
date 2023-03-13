import { InstanceValidator, TypeSchema } from '@benzed/schema'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/ban-types
*/

// TODO This is an instance validator, not an 'of' validator.

//// Main ////

class MapValidator extends InstanceValidator<MapConstructor> {

    constructor() {
        super(globalThis.Map)
    }

}

class Map extends TypeSchema<MapValidator, {}> {

    constructor() {
        super(new MapValidator, {})
    }

}

//// Exports ////

export { Map }

export const $map = new Map