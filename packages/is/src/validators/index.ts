import { Structural } from '@benzed/immutable'
import { ValidationContext, Validator } from '@benzed/schema'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Exports ////

export * from './instance-validator'

export * from './type-validator'

export * from './value-validator'

export * from './sub-validator'

export * from './shape-validator'

export interface SettingsValidator<I = any, O extends I = I> extends Validator<I, O> {

    readonly name: string 

    message?(input: I, ctx: ValidationContext<I>): string 

    get [Structural.state](): Pick<this, 'name' | 'message'> 

}
