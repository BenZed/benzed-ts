import { $$settings } from '@benzed/schema'
import { capitalize, toCamelCase } from '@benzed/string'
import { pick } from '@benzed/util'

import { SubValidator } from '../../../validators'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Helper Types ////

abstract class CaseValidator extends SubValidator<string> {

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

export class Capitalized extends SubValidator<string> {

    override transform(input: string): string {
        return capitalize(input)
    }

}

export class Trimmed extends SubValidator<string> {

    override transform(input: string): string {
        return input.trim()
    }

}

abstract class StringValueSubValidator extends SubValidator<string> {

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

