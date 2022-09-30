
/*** Types ***/

type Pipe<I = unknown, O = unknown> = (input: I, ...args: unknown[]) => O

interface PipeBuilder<
    Ix = unknown, // Input Original
    I = unknown, // Input 
    O = unknown // Output
> {

    <Ox>(f: Pipe<O, Ox>): PipeBuilder<Ix, I, Ox>
    //  ^ Output new

    [Symbol.iterator](): Iterator<Pipe<Ix, O>>

    merge(): Pipe<Ix, O>
}

/*** Main ***/

/**
 * Pipe a series of methods together sending the output 
 * of the previous into the input of the next.
 */
function pipe<I, O = I>(f: Pipe<I, O>): PipeBuilder<I, I, O> {

    const _f: Pipe[] = [f as Pipe]

    const _pipe = ((n: Pipe): PipeBuilder => {
        _f.push(n)

        return _pipe
    }) as PipeBuilder

    _pipe[Symbol.iterator] = function* () {
        yield _pipe.merge()
    }

    _pipe.merge = () => (x: unknown) => {
        for (const f of _f)
            x = f(x)
        return x
    }

    return _pipe as PipeBuilder<I, I, O>
}

/*** Exports ***/

export default pipe

export {
    pipe,
    Pipe
}