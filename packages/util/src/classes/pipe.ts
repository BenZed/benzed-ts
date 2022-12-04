import callable from '../callable'
import { Func } from '../types'

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

type ContextOf<F extends Func> = F extends (input: any, ctx: infer Cx) => any ? Cx : unknown

interface Pipe<I = unknown, O = unknown> extends Transformer<Transform<I,O>> {

    /**
     * Append another transformation onto the end of this pipe.
     */
    to<Ox>(transform: Transform<O, Ox>): Pipe<I, Ox>
    to<Ox, C>(transform: ContextTransform<O, Ox, C>): ContextPipe<I, Ox, C>

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
    to<Ox>(transform: ContextTransform<O, Ox, C>): ContextPipe<I, Ox, C>

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
    to<Ox>(transform: ContextTransform<O, Ox, C>): BoundPipe<I, Ox, C>

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
    flatten<I,O>(transforms: Transform<I,O>[]): Transform<I,O>[]

    from<I,O,C>(transform: ContextTransform<I,O,C>): unknown extends C 
        ? Pipe<I,O>
        : ContextPipe<I,O,C>
    from<I,O>(transform: Transform<I,O>): Pipe<I,O>

    /** 
     * Create a pipe from a multiple transform methods with the same type as input and output.
     */
    from<T>(...transforms: Transform<T,T>[]): Pipe<T,T>

    /**
     * Convert a function with a *this* context to a context pipe
     */
    convert<I,O,C>(func: (this: C, input: I) => O): ContextPipe<I,O,C>

}

//// Main ////

const Pipe = callable(
    function transform(x: unknown, ctx?: unknown): unknown {

        const _ctx = callable.getContext(this as Pipe) ?? ctx

        for (const transform of this.transforms) 
            x = (transform as ContextTransform).call(_ctx, x, _ctx)

        return x
    }, class {

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
                throw new Error('Must convert a function with a <this> context.')
            return this.from(transform)
        }

        readonly transforms: readonly Transform[]

        constructor(...transforms: Transform[]) {
            this.transforms = Pipe.flatten(transforms)
        }

        to(this: Pipe, transform: Transform): Pipe {
            return callable.transferContext(this, Pipe.from(this, transform)) as Pipe
        }

        from(this: Pipe, transform: Transform): Pipe {
            return callable.transferContext(this, Pipe.from(transform, this)) as Pipe
        }

        bind(this: Pipe, ctx: unknown): Pipe {
            const bound = callable.bindContext(Pipe.from(this), ctx) as Pipe
            return bound
        }

        *[Symbol.iterator](this: Pipe): Iterator<Transform> {
            yield* this.transforms
        }
    },
    'Pipe'
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
    ContextOf
}