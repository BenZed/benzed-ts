
import { StringValueSubValidator } from './string-value-sub-validator'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Exports  ////

export class StartsWith extends StringValueSubValidator {

    override message(): string {
        return `must start with ${this.value}`
    }

    override transform(input: string): string {
        return input.startsWith(this.value) ? input : this.value + input
    }

}