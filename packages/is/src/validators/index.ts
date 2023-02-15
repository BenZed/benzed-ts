import { $$settings, ValidatorStruct, ValidationContext } from '@benzed/schema'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Exports ////

export * from './type-validator'

export * from './value-validator'

export * from './sub-validator'

export * from './shape-validator'

export interface SettingsValidator<I, O extends I = I> extends ValidatorStruct<I, O> {

    readonly name: string 

    message(ctx: ValidationContext<I>): string 

    get [$$settings](): Pick<this, 'name' | 'message'> 

}

export type AnySettingsValidator = SettingsValidator<any,any>