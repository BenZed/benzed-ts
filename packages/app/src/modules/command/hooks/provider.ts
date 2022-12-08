import { CommandHook, RuntimeCommand } from '../command'

//// Helper ////

type Provided<I extends object, P> = I extends [infer Ix, ...infer Ir]
    ? [Ix, ...Ir, P]
    : [I, P]

type Provide<I extends object, O = unknown> = (cmd: RuntimeCommand<I>, input: I) => O

type Provider<I extends object, O> = CommandHook<I, Provided<I,O>>

//// Main ////

const provider = <I extends object, P extends Provide<I>>(
    provider: P
): CommandHook<I, Provided<I, ReturnType<P>>> => 
    function (this: RuntimeCommand<I>, input: I) {
        return [input, provider(this, input)].flat() as Provided<I, ReturnType<P>>
    }

//// Exports ////

export default provider

export {
    provider,
    Provider,
}