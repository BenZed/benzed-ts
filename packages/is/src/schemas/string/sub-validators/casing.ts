import { Validator } from '@benzed/schema'
import { capitalize, toCamelCase } from '@benzed/string'
import { define, pick } from '@benzed/util'
import { SubContractValidator } from '../../../validators'

//// Exports ////

export class Casing extends SubContractValidator<string> {

    constructor(readonly casing?: 'lower' | 'upper' | 'camel' | 'capitalize') {
        super()
    }

    override transform(input: string): string {
        switch (this.casing) {
            case 'lower': {
                return input.toLowerCase()
            } 
            case 'upper': {
                return input.toUpperCase()
            }
            case 'camel': {
                return toCamelCase(input)
            }
            case 'capitalize': {
                return capitalize(input)
            }
            default: {
                return input
            }
        }
    }

    override message(): string {
        return this.casing === 'capitalize'
            ? `must bed ${this.casing}d`
            : `must be in ${this.casing} case`
    }

    get [Validator.state](): Pick<this, 'enabled' | 'name' | 'message' | 'casing'> {
        return pick(this, 'enabled', 'name', 'message', 'casing')
    }

    set [Validator.state](state: Pick<this, 'enabled' | 'name' | 'message' | 'casing'>) {
        define.named(state.name, this)
        define.hidden(this, 'message', state.message)
        define.enumerable(this, 'enabled', state.enabled)
        define.enumerable(this, 'casing', state.casing)
    }

}