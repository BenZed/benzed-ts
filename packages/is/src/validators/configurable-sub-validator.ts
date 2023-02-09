import { $$settings, ContractValidator, ValidationContext } from '@benzed/schema'
import { pick } from '@benzed/util'

//// Exports ////

export class ConfigurableSubValidator<T> extends ContractValidator<T, T> {

    readonly enabled = false

    override get name(): string {
        return this.constructor.name
    }

    message(ctx: ValidationContext<T>): string {
        void ctx
        return `Must be ${this.name}`
    }

    get [$$settings](): Pick<this, 'message' | 'enabled'> {
        return pick(this, 'message', 'enabled')
    }
}