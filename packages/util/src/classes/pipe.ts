import { Callable } from '../classes'
import { applyResolver, iterate } from '../methods'
import { Func, nil } from '../types'

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

interface ParamTransform<I = unknown, O = unknown, P extends unknown[] = []> {
    (input: I, ...params: P): O
}

type Transformer<T extends Func> = Iterable<T> & {
    readonly transforms: readonly Transform[]
} & T

type InputOf<F extends Func> = F extends (input: infer I, ...params: unknown[]) => unknown ? I : unknown
type OutputOf<F extends Func> = F extends (...params: unknown[]) => infer O ? O : unknown

type ResolveAsyncOutput<I,O> = I extends Promise<any> 
    ? Promise<Awaited<O>>
    : O

interface Pipe<I = unknown, O = unknown> extends Transformer<Transform<I,O>> {

    /**
     * Append another transformation onto the end of this pipe.
     */
    to<Ox>(transform: Transform<Awaited<O>, Ox>): Pipe<I, ResolveAsyncOutput<O, Ox>>
    to<Ox, P extends unknown[]>(transform: ParamTransform<Awaited<O>, Ox, P>): ParamPipe<I, ResolveAsyncOutput<O, Ox>, P>

    /**
     * Prepend a transformation onto the beginning of this pipe.
     */
    from<Ix>(transform: Transform<Ix, I>): Pipe<Ix, O>
    from<Ix, P extends unknown[]>(transform: ParamTransform<Ix, I, P>): ParamPipe<Ix, O, P>

    bind(ctx: unknown): Pipe<I, O>

}

interface ParamPipe<I = unknown, O = unknown, P extends unknown[] = []> extends Transformer<ParamTransform<I,O,P>> {

    /**
     * Append another transformation onto the end of this pipe.
     */
    to<Ox>(transform: ParamTransform<Awaited<O>, Ox, P>): ParamPipe<I, ResolveAsyncOutput<O, Ox>, P>

    /**
     * Prepend a transformation onto the beginning of this pipe.
     */
    from<Ix>(transform: ParamTransform<Ix, I, P>): ParamPipe<Ix, O, P>

    bind(ctx: unknown): ParamPipe<I, O, P>
}

interface PipeConstructor {

    /**
     * @internal
     */
    new (transforms: readonly Transform[], _bound?: { ctx: unknown }): Pipe<unknown,unknown>

    /**
     * Given a number of transforms, get a flattened array of just transforms 
     * from any pipes that may have been in the input
     */
    flatten<T>(transforms: readonly Transform<Awaited<T>,T>[]): readonly Transform<T,T>[]

    from<I, O, P extends unknown[]>(transform: ParamTransform<Awaited<I>, O, P>): P extends [] 
        ? Pipe<I, O>
        : ParamPipe<I, O, P>
    from<I, O>(transform: Transform<Awaited<I>, O>): Pipe<I, O>

    /** 
     * Create a pipe from a multiple transform methods with the same type as input and output.
     */
    from<T>(...transforms: Transform<Awaited<T>,T>[]): Pipe<T,T>

}

//// Main ////

const Pipe = (class extends Callable<Func> {

    static flatten(input: readonly Transform[]): readonly Transform[] {

        const pipes: Pipe[] = []

        let bound: { ctx: unknown } | nil = nil
        let transforms: Transform[] = []

        const remaining = Array.from(input).reverse()
        while (remaining.length > 0) {

            const transform = remaining.pop() as Transform
            const pipe = transform instanceof this ? transform : nil
            if (!pipe)
                transforms.push(transform)

            else if (!pipe._bound)
                transforms.push(...pipe.transforms)

            else {

                if (transforms.length > 0)
                    pipes.push(new Pipe(transforms, bound))

                bound = pipe._bound
                transforms = [...pipe.transforms]
            }
        }

        if (bound && transforms.length > 0) {
            pipes.push(new Pipe(transforms, bound))
            return pipes
        }

        return [...transforms, ...pipes]  
    }

    static from(...transforms: (Transform | ParamTransform)[]): Pipe | ParamPipe {
        return new Pipe(transforms)
    }

    readonly transforms: readonly Transform[]

    constructor (transforms: readonly Transform[], private readonly _bound?: { ctx: unknown }) {
        super(
            function transform(this: [unknown, Pipe], input: unknown, ...params: unknown[]): unknown {

                const [ ctx, pipe ] = this

                const results = iterate(

                    pipe.transforms as ParamTransform<unknown,unknown,unknown[]>[],

                    transform => applyResolver(
                        transform.call(ctx, input, ...params), 
                        output => {
                            input = output 
                        }
                    )
                )

                return applyResolver(results, () => input)
            },
            (ctx, pipe) => [ _bound ? _bound.ctx : ctx, pipe ]
        )

        this.transforms = Pipe.flatten(transforms)
    }

    to(transform: Transform): Pipe {
        return new Pipe([...this.transforms, transform], this._bound)
    }

    from(transform: Transform): Pipe {
        return new Pipe([transform, ...this.transforms], this._bound)
    }

    override bind(ctx: unknown): Pipe {
        if (this._bound)
            throw new Error(`${this.constructor.name} is already bound.`)

        return new Pipe(this.transforms, { ctx })
    }

    *[Symbol.iterator](this: Pipe): Iterator<Transform> {
        yield* this.transforms
    }

}) as PipeConstructor

//// Exports ////

export default Pipe

export {

    Transform,
    ParamTransform, 

    Pipe,
    ParamPipe,

    InputOf,
    OutputOf,

    ResolveAsyncOutput
}
