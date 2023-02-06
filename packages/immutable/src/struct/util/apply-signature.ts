import { Callable, Func, provideCallableContext } from '@benzed/util'
import { Struct } from '../struct'

//// Main ////

function applySignature<T extends Struct>(struct: T, signature?: Func): T {
    return signature

        ? Callable.create(
            signature,
            struct,
            provideCallableContext
        ) as T

        : struct
}

//// Exports ////

export default applySignature

export {
    applySignature
}