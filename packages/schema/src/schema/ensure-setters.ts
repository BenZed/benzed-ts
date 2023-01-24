import { unique } from '@benzed/array'
import { ValueCopy } from '@benzed/immutable'
import { capitalize } from '@benzed/string'

import {
    nil,
    isFunc,
    Func,
    Property,
    keysOf,
} from '@benzed/util'

import Schema from './schema'

//// Types ////

// Move me to @benzed/immutable TODO
interface ValueApply extends ValueCopy {
    apply(settings: object): this
}

//// Main ////

function ensureSetters(object: ValueApply, settings: object): void {
        
    const disallowedKeys = Array
        .from(keysOf(Schema.prototype))
        .concat('value', 'is', 'transform', 'id')
        .filter(unique)

    const descriptors = Property.descriptorsOf(settings)

    const allowedKeys = Array
        .from(keysOf(descriptors))
        .filter(k => !disallowedKeys.includes(k))

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