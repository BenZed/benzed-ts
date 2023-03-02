import { ContractValidator, SubValidator } from '@benzed/schema'
import { isFinite } from '@benzed/util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Exports ////

export class Finite extends ContractValidator<number> implements SubValidator<number> {

    readonly enabled: boolean = false

    override isValid(input: number): boolean {
        return isFinite(input)
    }

}