import { Comparable, Copyable } from '@benzed/immutable'
import { Callable, Traits } from '@benzed/traits'
import { define } from '@benzed/util'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

export class ValidateCopy extends Copyable {

    [Copyable.copy](): this {

        const clone = Copyable.createFromProto(this)
        define.hidden(clone, Callable.signature, (this as any)[Callable.signature])

        const name = Object.getOwnPropertyDescriptor(this, 'name')
        if (name?.writable)
            define.hidden(clone, 'name', name.value)

        return Callable.apply(clone as any)
    }

}

export class ValidateEquals extends Comparable {

    [Comparable.equals](other: unknown): other is this {
        return Callable.is(other) && other[Callable.signature] === (this as any)[Callable.signature]
    } 

}

export class ValidateImmutable extends Traits.merge(ValidateCopy, ValidateEquals) {

}
