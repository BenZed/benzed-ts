
interface ValidateOptions {

    readonly transform?: boolean

    readonly path?: readonly (symbol | string | number)[]

}

interface ValidateContext<T> extends Required<ValidateOptions> {

    readonly input: T

}

//// Exports ////

export {
    ValidateContext,
    ValidateOptions
}