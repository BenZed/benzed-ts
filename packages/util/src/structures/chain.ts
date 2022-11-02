
//// Types ////

/**
 * Pure function that computes a single output from an input
 */
interface Link<I = unknown, O = unknown> {
    (input: I): O
}

interface Chain<I = unknown, O = unknown> extends Link<I,O> {

    /**
     * Add link(s) to the end of the chain
     * @param link 
     */
    append<Ox>(link: Link<O, Ox>, ...links: Link<Ox, Ox>[]): Chain<I, Ox>

    /**
     * Add link(s) to the beginning of the chain
     * @param link 
     */
    prepend<Ix>(link: Link<Ix, I>, ...links: Link<I, I>[]): Chain<Ix, O>

    links: readonly Link[]

    [Symbol.iterator](): Iterator<Link>

}

//// Helper ////

function * iterateLinks(this: Chain): Generator<Link> {
    for (const link of this.links)
        yield link
}

function flattenLinks(input: readonly Link[]): Link[] {
    const output: Link[] = []

    for (const link of input) {
        if (isChain(link))
            output.push(...link)
        else 
            output.push(link)
    }

    return output
}

function append(this: Chain, link: Link, ...s: Link[]): Chain {
    return chain(...this.links, link, ...s)
}

function prepend(this: Chain, link: Link, ...s: Link[]): Chain {
    return chain(link, ...s, ...this.links)

}

//// Main ////

function isChain(input: (i: unknown) => unknown): input is Chain {
    return 'append' in input && 'prepend' in input
}

/**
 * Create a chain out of an initial link
 */
function chain<I,O>(link: Link<I,O>): Chain<I,O>
 
/**
 * Create a chain out of many links with the same input/output type
 */
function chain<T>(...links: Link<T,T>[]): Chain<T,T>

function chain(...links: Link[]): Chain {

    links = flattenLinks(links)

    return Object.assign(
        function pipe(this: unknown, x: unknown) {
            for (const link of links) 
                x = this === undefined ? link(x) : link.call(this, x)

            return x
        },
        {

            prepend,

            append,

            links,

            [Symbol.iterator]: iterateLinks
        }

    ) as Chain

}

//// Exports ////

export default chain

export {
    Link, 

    chain,
    Chain,
    isChain
}