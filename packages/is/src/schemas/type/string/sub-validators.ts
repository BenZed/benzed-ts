
import { capitalize, toCamelCase } from '@benzed/string'

import { SubValidator, ValueValidator } from '@benzed/schema'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Symbol Ids ////

const $$case = Symbol('case-validator')

//// Helper Types ////

abstract class CaseValidator extends SubValidator<string> {

    constructor() {
        super($$case)
    }

    override error(): string {
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

export class Capitalized extends CaseValidator {

    override transform(input: string): string {
        return capitalize(input)
    }

    override error(): string {
        return `Must be ${this.name}`
    }
}

export class Trimmed extends SubValidator<string> {

    override transform(input: string): string {
        return input.trim()
    }

}

export class EndsWith extends ValueValidator<string> {

    override error(): string {
        return `Must end with ${this.value}`
    }

    override transform(input: string): string {
        return input.endsWith(this.value) ? input : input + this.value 
    }

}

export class StartsWith extends ValueValidator<string> {

    override error(): string {
        return `Must start with ${this.value}`
    }

    override transform(input: string): string {
        return input.startsWith(this.value) ? input : this.value + input
    }

}

export class Includes extends ValueValidator<string> {

    override error(): string {
        return `Must include ${this.value}`
    }

    override transform(input: string): string {
        return input.startsWith(this.value) ? input : this.value + input
    }

}

