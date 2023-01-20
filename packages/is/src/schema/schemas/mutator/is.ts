import { CallableStruct } from '@benzed/immutable/src'
import { OutputOf, TypeAssertion, TypeGuard } from '@benzed/util'
import { Validate } from '../../../validator'

import { Optional, ReadOnly, MutatorType as M } from './mutator'

//// Helper ////

function assert <T>(this: { validate: Validate<unknown, T> }, input: unknown): asserts input is T {
    void this.validate(input, { transform: false })
}

function is <T>(this: { validate: Validate<unknown, T> }, input: unknown): input is T {
    try {
        this.validate(input, { transform: false })
        return true
    } catch (e) {
        return false
    }
}

//// Is ////

class Is<V extends Validate<unknown>> extends CallableStruct<TypeGuard<OutputOf<V>>> {

    constructor(readonly validate: V) {
        super(is)
    }

    get optional(): Is<Optional<V>> {
        return new Is(Mutate.add(this.validate, M.Optional))
    }

    get readonly(): Is<ReadOnly<V>> {
        return new Is(Mutate.add(this.validate, M.ReadOnly))
    }

    get assert(): Assert<V> {
        return new Assert(this.validate)
    }

}

class Assert<V extends Validate<unknown>> extends CallableStruct<TypeAssertion<OutputOf<V>>> {

    constructor(readonly validate: V) {
        super(assert)
    }

    get optional(): Assert<Optional<V>> {
        return new Assert(Mutate.add(this.validate, M.Optional))
    }

    get readonly(): Assert<ReadOnly<V>> {
        return new Assert(Mutate.add(this.validate, M.ReadOnly))
    }

    get is(): Is<V> {
        return new Is(this.validate)
    }

}

//// Exports ////
