import equals from './equals'
import copy from './copy'

import { CopyComparable } from './index'

import { $$copy, $$equals } from './symbols'

import { ValueMap as _ValueMap } from '@benzed/util'
/* eslint-disable 
    @typescript-eslint/no-this-alias,
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/prefer-readonly-parameter-types
*/

//// Main ////

class ValueMap<K, V> extends _ValueMap<K,V> implements CopyComparable {

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