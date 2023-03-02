
import { StringValueSubValidator } from './string-value-sub-validator'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// StrinValue SubValidator  ////

export class EndsWith extends StringValueSubValidator {

    override message(): string {
        return `must end with ${this.value}`
    }

    override transform(input: string): string {
        return input.endsWith(this.value) ? input : input + this.value 
    }

}

