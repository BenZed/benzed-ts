import { nil } from '@benzed/util'

//// Validate ////

export interface ValidateOptions {

    /**
     * Are transformations allowed for this validation?
     */
    readonly transform?: boolean
    
    readonly path?: readonly (string | number | symbol)[]

}

export interface ValidateContext extends Required<ValidateOptions> {

    readonly input: unknown

}

export function context(ctx?: Partial<ValidateContext>): ValidateContext {

    return {

        path: [],
        transform: true,
        input: nil,

        ...ctx,

    }
}