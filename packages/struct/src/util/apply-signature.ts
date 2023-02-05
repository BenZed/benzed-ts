import { Callable, Func, provideCallableContext } from '@benzed/util'
import { AnyState } from '../state'

//// Main ////

function applySignature<T extends AnyState>(struct: T, signature?: Func): T {
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