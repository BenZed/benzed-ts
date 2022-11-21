import { nil } from '@benzed/util'
import { equals } from '@benzed/immutable'

//// Types ////

type Keys = readonly (string | number | symbol)[]

type Equals = (a: unknown, b: unknown) => boolean

//// Validate ////

export interface ValidateOptions {

    /**
     * Are transformations allowed for this validation?
     * false to disable transformations
     * equality method to enable transformations and check that they are valid.
     * 
     * Uses deep equality by default.
     */
    readonly transform?: false | Equals

    readonly path?: Keys

}

export interface ValidateContext extends Required<ValidateOptions> {

    readonly input: unknown

}

export function context(ctx?: Partial<ValidateContext>): ValidateContext {

    return {

        path: [],
        transform: equals,
        input: nil,

        ...ctx,

    }
}