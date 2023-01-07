import { ValueMap as _ValueMap } from '@benzed/util'

import equals, { Comparable } from './equals'
import copy, { Copyable } from './copy'

import { $$copy, $$equals } from './symbols'

/* eslint-disable 
    @typescript-eslint/no-this-alias,
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/prefer-readonly-parameter-types
*/

//// Main ////

class ValueMap<K, V> extends _ValueMap<K,V> implements Copyable, Comparable {

    protected _keysEqual(l: K, r: K): boolean {
        return equals(l,r)
    }

    //  CopyComparable Implementation

    [$$copy](): this {
        const Type = this.constructor

        const args = []
        for (const keyValue of this)
            args.push(copy(keyValue))

        return new (Type as any)(args)
    }

    [$$equals](right: unknown): right is this {
        const left = this

        if (!(right instanceof ValueMap))
            return false

        if (left.size !== right.size)
            return false

        return equals([...left], [...right])
    }

}

//// Exports ////

export default ValueMap

export { ValueMap }