import { Callable } from '../classes'
import { Func, nil, isNil, isPromise, isFunc } from '../types'

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

type CallableConstructor = typeof Callable
interface PipeConstructor extends CallableConstructor {

    /**
     * Given a number of transforms, get a flattened array of just transforms 
     * from any pipes that may have been in the input
     */
    flatten<T>(transforms: readonly Transform<Awaited<T>,T>[]): readonly Transform<T,T>[]

    from<I, O, C>(transform: ContextTransform<Awaited<I>, O, C>): unknown extends C 
        ? Pipe<I, O>
        : ContextPipe<I, O, C>
    from<I,O>(transform: Transform<Awaited<I>,O>): Pipe<I,O>

    /** 
     * Create a pipe from a multiple transform methods with the same type as input and output.
     */
    from<T>(...transforms: Transform<Awaited<T>,T>[]): Pipe<T,T>

    /**
     * Convert a pipe to a bound pipe.
     * @param func 
     */
    convert<I, O, C>(transforms: readonly Transform<I,O>[] | readonly ContextTransform<I,O,C>[], ctx: C): BoundPipe<I,O,C>

    /**
     * Convert a function with a *this* context to a context pipe
     */
    convert<I, O, C>(
        func: ((this: C, input: Awaited<I>) => O) 
    ): ContextPipe<I,O,C>

}

//// Transform ////

function applyTransforms(
    this: readonly ContextTransform[],
    ctx: unknown,
    value: unknown
): unknown {

    const transforms = Array.from(this).reverse()

    while (transforms.length > 0) {
        const transform = transforms.pop() as ContextTransform

        value = transform.call(ctx, value, ctx)
        if (isPromise(value)) 
            return value.then(applyTransforms.bind(transforms.reverse(), ctx))
    } 

    return value
}

//// Main ////

const Pipe = (class extends Callable<Func> {

    static flatten(input: readonly Transform[]): readonly Transform[] {

        const pipes: Pipe[] = []

        let bound: { ctx: unknown } | nil = nil
        let transforms: Transform[] = []

        const unchecked = Array.from(input).reverse()
        while (unchecked.length > 0) {

            const transform = unchecked.pop() as Transform
            const pipe = transform instanceof this ? transform : nil
            if (!pipe)
                transforms.push(transform)
            else if (!pipe.bound)
                transforms.push(...pipe.transforms)
            else {

                if (transforms.length > 0)
                    pipes.push(Pipe.convert(transforms, bound))

                bound = pipe.bound
                transforms = [...pipe.transforms]
            }
        }

        if (bound && transforms.length > 0)
            pipes.push(Pipe.convert(transforms, bound))

        return [...transforms, ...pipes]  
    }

    static from(...transforms: (Transform | ContextTransform)[]): Pipe | ContextPipe {
        return this.convert(transforms, nil)
    }

    static convert(
        ...args:
        [(this: unknown, input: unknown) => unknown] | 
        [transforms: readonly (Transform | ContextTransform)[], ctx: unknown]
    ): Pipe | ContextPipe | BoundPipe {

        const isBindSignature = isFunc(args[0]) 
        
        const transforms = (isBindSignature ? [args[0]] : args[0]) as Transform[]
        const ctx = isBindSignature ? nil : args[1]

        if (transforms.length === 0)
            throw new Error('At least one transform required.')

        if (isBindSignature && 'prototype' in transforms[0] === false)
            throw new Error('Must convert a prototypal function')

        return new this(transforms, isNil(ctx) ? nil : { ctx }) as Pipe | ContextPipe
    }

    constructor(readonly transforms: readonly Transform[], private readonly bound?: { ctx: unknown }) {

        transforms = Pipe.flatten(transforms)

        super(bound
            ? applyTransforms.bind(transforms, bound.ctx)
            : function transform(this: unknown, input: unknown, ctx: unknown = this): unknown {
                return applyTransforms.call(transforms, ctx, input)
            }
        )
    }

    to(transform: Transform): Pipe {
        return Pipe.convert([...this.transforms, transform], this.bound?.ctx)
    }

    from(transform: Transform): Pipe {
        return Pipe.convert([transform, ...this.transforms], this.bound?.ctx)
    }

    override bind(ctx: unknown): Pipe {
        if (this.bound)
            throw new Error(`${this.constructor.name} is already bound.`)

        return Pipe.convert(this.transforms, ctx)
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
