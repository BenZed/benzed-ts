import { ValidationContext, Validator } from '@benzed/schema'
import { words } from '@benzed/string'
import { isObject, pick, Sortable, toComparable } from '@benzed/util'
import { SubContractValidator } from '../../../../validators'

//// Main ////

export class Limit<N extends Sortable> extends SubContractValidator<N> {

    //// Settings ////

    constructor(
        readonly limit: 'min' | 'max',
        readonly value: N,
    ) {
        super()
    }

    readonly inclusive: boolean = false

    //// Validator Implementation ////

    override message(input: N, ctx: ValidationContext<N>): string {
        void ctx

        const prefix = isObject(input) && 'length' in input 
            ? 'length must be'
            : 'must be'

        const difference = this._min 
            ? 'above'
            : 'below'

        const suffix = this.inclusive 
            ? 'or equal'
            : ''

        return words(prefix, difference, suffix, `${toComparable(this.value)}`)
    }

    //// Validator Implementation ////

    override isValid(input: N): boolean {

        const left = toComparable(input)
        const right = toComparable(this.value)

        if (this.inclusive && left === right)
            return true 

        return this._min
            ? left > right
            : left < right
    }

    get [Validator.state](): Pick<this, 'name' | 'message' | 'enabled' | 'value' | 'inclusive' | 'limit'> {
        return pick(
            this, 
            'name', 
            'message', 
            'enabled', 
            'value',
            'inclusive',
            'limit'
        )
    }

    //// Helper ////
    
    private get _min() {
        return this.limit === 'min'
    }

}