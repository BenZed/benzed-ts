import { intersect, Transform } from '../types'

//// Types ////

interface Pipe<I = unknown, O = unknown> extends Transform<I,O> {

    /**
     * Add link(s) to the end of the chain
     * @param transform 
     */
    to<Ox>(transform: Transform<O, Ox>, ...transforms: Transform<Ox, Ox>[]): Pipe<I, Ox>

    transforms: readonly Transform[]

    [Symbol.iterator](): Iterator<Transform>

}

//// Helper ////

function * iterateTransforms(this: Pipe): Generator<Transform> {
    for (const transform of this.transforms)
        yield transform
}

function flattenTransforms(input: readonly Transform[]): Transform[] {
    const output: Transform[] = []

    for (const transform of input) {
        if (isPipe(transform))
            output.push(...transform)
        else 
            output.push(transform)
    }

    return output
}

function to(this: Pipe, link: Transform, ...s: Transform[]): Pipe {
    return pipe(...this.transforms, link, ...s)
}

//// Main ////

function isPipe(input: (i: unknown) => unknown): input is Pipe {
    return 'to' in input && typeof input['to' as keyof typeof input] === 'function'
}

/**
 * Create a chain out of an initial link
 */
function pipe<I,O>(transform: Transform<I,O>): Pipe<I,O>
 
/**
 * Create a chain out of many links with the same input/output type
 */
function pipe<T>(...links: Transform<T,T>[]): Pipe<T,T>

function pipe(...transforms: Transform[]): Pipe {

    transforms = flattenTransforms(transforms)

    return intersect(
        function pipe(this: unknown, x: unknown) {
            for (const link of transforms) 
                x = this === undefined ? link(x) : link.call(this, x)

            return x
        },
        {
            to,
            transforms,
            [Symbol.iterator]: iterateTransforms
        }

    ) as Pipe

}

//// Exports ////

export default pipe

export {
    Transform,

    pipe,
    Pipe,
    isPipe
}