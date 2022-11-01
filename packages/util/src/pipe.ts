
//// Types ////

interface Pipe<I = unknown, O = unknown> {
    (input: I): O
}

interface PipeBuilder<
    Ix = unknown, // Input Original
    I = unknown, // Input 
    O = unknown // Output
> {

    <Ox>(f: Pipe<O, Ox>): PipeBuilder<Ix, I, Ox>
    //   ^ Output new

    [Symbol.iterator](): Iterator<Pipe<Ix, O>>

    build(): Pipe<Ix, O>
}

//// Main ////

/**
 * Run an input through a series of type-matched pipes
 */
function pipe<T>(p: Pipe<T,T> | readonly Pipe<T,T>[], input: T): T 

/**
 * Build a typesafe pipe method by incrementally adding
 * pipes that mutate the input/output types1
 */
function pipe<I, O = I>(p: Pipe<I, O>): PipeBuilder<I, I, O> 

function pipe(p: unknown, i?: unknown): unknown {

    // Handle apply signature
    if (Array.isArray(p)) {
        for (const _f of p) 
            i = _f(i)
        return i
    }

    // Handle build signature
    const pipes: Pipe[] = [p as Pipe]

    const _pipe = ((n: Pipe): PipeBuilder => {
        pipes.push(n)

        return _pipe
    }) as PipeBuilder

    _pipe[Symbol.iterator] = function* () {
        yield _pipe.build()
    }

    _pipe.build = () => (x: unknown) => {
        for (const p of pipes)
            x = p(x)
        return x
    }

    return _pipe 
}

//// Exports ////

export default pipe

export {
    pipe,
    Pipe,
    PipeBuilder
}