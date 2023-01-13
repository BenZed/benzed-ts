import { isArray as _isArray, TypeGuard, TypeOf } from '@benzed/util'
import Schematic, { AnySchematic, OrSchematic, OrSchematicInput, ToSchematic, ToSchematicInput } from '../../schematic'
import { IsType } from '../is-type'

//// Types ////

export type IsArrayInput = TypeGuard<unknown>

//// Exports ////

class IsArrayOf<T extends IsArrayInput> extends IsType<unknown> {

    constructor(readonly item: T) {
        super({
            type: 'array',
            is: (i: unknown): i is TypeOf<T> => _isArray(i, this.item)
        })
    }
}

class IsArray extends IsArrayOf<TypeGuard<unknown>> {

    constructor() {
        const isUnknown = (i: unknown): i is unknown => true
        super(isUnknown)
    }

    of<T extends ToSchematicInput>(input: T): IsArrayOf<ToSchematic<T>> 
    of<T extends OrSchematicInput>(...options: T): IsArrayOf<OrSchematic<T>> 
    of(...inputs: OrSchematicInput): IsArrayOf<AnySchematic> {
        const schematic = Schematic.resolve(...inputs)
        return new IsArrayOf(Schematic.to(schematic))
    }

}

//// Exports ////

export default IsArrayOf

export {
    IsArrayOf,
    IsArray
}

export const isArray = new IsArray