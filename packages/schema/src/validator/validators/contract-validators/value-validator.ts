import { equals } from '@benzed/immutable'
import { define, pick, Primitive } from '@benzed/util'
import { Validator } from '../../validator'

import ContractValidator from '../contract-validator'

/**
 * Validate an exact primitive value
 */
export class ValueValidator<T extends Primitive> extends ContractValidator<unknown, T> {

    constructor(
        readonly value: T,

        /**
         * If the input is not the expected value, return the expected value.
         * Basically, an automatic transform.
         */
        readonly force = false
    ) {
        super()
    }

    override transform(input: unknown) {
        return this.force ? this.value : input
    }

    override isValid(input: unknown): boolean {
        return equals(input, this.value)
    }

    override get name(): string {
        return String(this.value)
    }

    //// Validator ////
    
    get [Validator.state](): Pick<this, 'name' | 'message' | 'force'> {
        return pick(this, 'name', 'message', 'force')
    }

    set [Validator.state](state: Pick<this, 'name' | 'message' | 'force'>) {
        define.named(state.name, this)
        define.hidden(this, 'message', state.message)
        define.enumerable(this, 'force', state.force)
    }

}