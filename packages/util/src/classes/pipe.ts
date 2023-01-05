import { Callable } from '../classes'
import { through } from '../methods'
import { Func, indexesOf, isPromise } from '../types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

/**
 * Function that takes a single input, returns a single output.
 */
interface Transform<I = unknown, O = unknown> {
    (input: I): O
}

interface ContextTransform<I = unknown, O = unknown, C = unknown> {
    (input: I, ctx: C): O
}

type Transformer<T extends Func> = Iterable<T> & {
    readonly transforms: readonly Transform[]
} & T

type InputOf<F extends Func> = F extends (input: infer I, ...args: any) => any ? I : unknown
type OutputOf<F extends Func> = F extends (...args: any) => infer O ? O : unknown
type ContextOf<F extends Func> = F extends (input: any, ctx: infer Cx) => any ? Cx : void

type ResolveAsyncOutput<I,O> = I extends Promise<any> 
    ? Promise<Awaited<O>>
    : O

interface Pipe<I = unknown, O = unknown> extends Transformer<Transform<I,O>> {

    /**
     * Append another transformation onto the end of this pipe.
     */
    to<Ox>(transform: Transform<Awaited<O>, Ox>): Pipe<I, ResolveAsyncOutput<O, Ox>>
    to<Ox, C>(transform: ContextTransform<Awaited<O>, Ox, C>): ContextPipe<I, ResolveAsyncOutput<O, Ox>, C>

    /**
     * Prepend a transformation onto the beginning of this pipe.
     */
    from<Ix>(transform: Transform<Ix, I>): Pipe<Ix, O>
    from<Ix, C>(transform: ContextTransform<Ix, I, C>): ContextPipe<Ix, O, C>

    bind<C>(ctx: C): BoundPipe<I, O, C>

}

interface ContextPipe<I = unknown, O = unknown, C = unknown> extends Transformer<ContextTransform<I,O,C>> {

    /**
     * Append another transformation onto the end of this pipe.
     */
    to<Ox>(transform: ContextTransform<Awaited<O>, Ox, C>): ContextPipe<I, ResolveAsyncOutput<O, Ox>, C>

    /**
     * Prepend a transformation onto the beginning of this pipe.
     */
    from<Ix>(transform: ContextTransform<Ix, I, C>): ContextPipe<Ix, O, C>

    bind(ctx: C): BoundPipe<I, O, C>
    call(ctx: C, input: I): O
    apply(ctx: C, input: [I]): O
}

interface BoundPipe<I = unknown, O = unknown, C = unknown> extends Transformer<Transform<I,O>> {

    /**
     * Append another transformation onto the end of this pipe.
     */
    to<Ox>(transform: ContextTransform<Awaited<O>, Ox, C>): BoundPipe<I, ResolveAsyncOutput<O, Ox>, C>

    /**
     * Prepend a transformation onto the beginning of this pipe.
     */
    from<Ix>(transform: ContextTransform<Ix, I, C>): BoundPipe<Ix, O, C>

    bind: never
    call(ctx: C, input: I): O
    apply(ctx: C, input: [I]): O
}

interface PipeConstructor {

    /**
     * Given a number of transforms, get a flattened array of just transforms 
     * from any pipes that may have been in the input
     */
    flatten<T>(transforms: Transform<Awaited<T>,T>[]): Transform<T,T>[]

    from<I, O, C>(transform: ContextTransform<Awaited<I>, O, C>): unknown extends C 
        ? Pipe<I, O>
        : ContextPipe<I, O, C>
    from<I,O>(transform: Transform<Awaited<I>,O>): Pipe<I,O>

    /** 
     * Create a pipe from a multiple transform methods with the same type as input and output.
     */
    from<T>(...transforms: Transform<Awaited<T>,T>[]): Pipe<T,T>

    /**
     * Convert a function with a *this* context to a context pipe
     */
    convert<I, O, C>(
        func: ((this: C, input: Awaited<I>) => O) 
    ): ContextPipe<I,O,C>

}

//// Transform ////

function applyTransforms(
    input: unknown, 
    ctx: unknown, 
    transforms: readonly ContextTransform[],
    start: number
): unknown {

    for (const index of indexesOf(transforms, start)) {
        const transform = transforms[index]

        const output = transform.call(ctx, input, ctx)
        if (isPromise(output)) 
            return output.then(resolved => applyTransforms(resolved, ctx, transforms, index + 1))
        else 
            input = output
    }

    return input
}

//// Main ////

const Pipe = (class extends Callable<Func> {

    static flatten(transforms: Transform[]): Transform[] {
        return transforms.flatMap(transform => transform instanceof this 
            ? transform.transforms 
            : transform
        )
    }

    static from(...transform: (Transform | ContextTransform)[]): Pipe | ContextPipe {
        return new this(...transform as Transform[]) as Pipe | ContextPipe
    }

    static convert(transform: (this: unknown, input: unknown) => unknown): ContextPipe {
        if ('prototype' in transform === false)
            throw new Error('Must convert a prototypal function')
        return this.from(transform)
    }

    readonly transforms: readonly Transform[]

    constructor(...transforms: Transform[]) {

        super(
            function transform(this: unknown, input: unknown, ctx?: unknown): unknown {
                return applyTransforms(
                    input, 
                    this ?? ctx,
                    pipe.transforms,
                    0
                )
            }
        )

        this.transforms = Pipe.flatten(transforms).filter(t => t !== through)
        const pipe = this

    }

    to(this: Pipe, transform: Transform): Pipe {
        return Pipe.from(this, transform)
    }

    from(this: Pipe, transform: Transform): Pipe {
        return Pipe.from(transform, this)
    }

    override bind(this: Pipe, ctx: unknown): Pipe {
        return Pipe.from(this.bind(ctx))
    }

    *[Symbol.iterator](this: Pipe): Iterator<Transform> {
        yield* this.transforms
    }
}
) as PipeConstructor

//// Exports ////

export default Pipe

export {

    Transform,
    ContextTransform, 

    Pipe,
    ContextPipe,
    BoundPipe,

    InputOf,
    OutputOf,
    ContextOf,

    ResolveAsyncOutput
}
