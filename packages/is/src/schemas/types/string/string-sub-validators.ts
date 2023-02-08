
import { capitalize, toCamelCase } from '@benzed/string'

import { $$settings, ContractValidator, ValidationContext } from '@benzed/schema'
import { pick } from '@benzed/util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Helper Types ////

// MOVE ME
class ConfigurableSubValidator<T> extends ContractValidator<T, T> {
    
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

abstract class CaseValidator extends ConfigurableSubValidator<string> {

    override message(): string {
        return `Must be in ${this.name} case `
    }

}

//// Sub Validators ////

export class Lower extends CaseValidator {
    override transform(input: string): string {
        return input.toLowerCase()
    }
}

export class Upper extends CaseValidator {
    override transform(input: string): string {
        return input.toUpperCase()
    }
}

export class Camel extends CaseValidator {
    override transform(input: string): string {
        return toCamelCase(input)
    }
}

export class Capitalized extends ConfigurableSubValidator<string> {

    override transform(input: string): string {
        return capitalize(input)
    }

}

export class Trimmed extends ConfigurableSubValidator<string> {

    override transform(input: string): string {
        return input.trim()
    }

}

abstract class StringValueSubValidator extends ConfigurableSubValidator<string> {

    readonly value = ''

    configure(value: string): { value: string } {
        return { value }
    }

    get [$$settings](): Pick<this, 'value' | 'message' | 'enabled'> {
        return pick(this, 'value', 'message', 'enabled')
    }
    
}

export class EndsWith extends StringValueSubValidator {

    override message(): string {
        return `Must end with ${this.value}`
    }

    override transform(input: string): string {
        return input.endsWith(this.value) ? input : input + this.value 
    }

}

export class StartsWith extends StringValueSubValidator {

    override message(): string {
        return `Must start with ${this.value}`
    }

    override transform(input: string): string {
        return input.startsWith(this.value) ? input : this.value + input
    }

}

export class Includes extends StringValueSubValidator {

    override message(): string {
        return `Must include ${this.value}`
    }

    override transform(input: string): string {
        return input.startsWith(this.value) ? input : this.value + input
    }

}

