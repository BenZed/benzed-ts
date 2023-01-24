import { ValueCopy } from '@benzed/immutable'
import { capitalize } from '@benzed/string'

import {
    nil,
    isFunc,
    Func,
    Property,
    keysOf,
} from '@benzed/util'

//// Types ////

// Move me to @benzed/immutable TODO
interface ValueApply extends ValueCopy {
    apply(settings: object): this
}

const DISALLOWED_KEYS = [
    'transform', 
    'isValid',
    'id', 
    'asserts', 
    'validates', 
    'transforms'
] as unknown[]

//// Main ////

function ensureSetters(object: ValueApply, settings: object): void {

    const descriptors = Property.descriptorsOf(settings)

    const allowedKeys = Array
        .from(keysOf(descriptors))
        .filter(k => !DISALLOWED_KEYS.includes(k))

    for (const key of allowedKeys) {
        const descriptor = descriptors[key]
        const accessible = descriptor.writable || 'getter' in descriptor && 'setter' in descriptor
        if (!descriptor || !accessible)
            continue

        const name = key === 'name' ? 'named' : key
        const hasSetter = isFunc((object as unknown as Record<string, Func | nil>)[name])
        if (hasSetter)
            continue 

        const setter = Property.name(function (this: ValueApply, value: unknown) {
            return this.apply({ [key]: value })
        }, `set${capitalize(key)}`)

        Property.define(object, name, { enumerable: false, value: setter })
    }
}

//// Exports ////

export default ensureSetters

export {
    ensureSetters
}