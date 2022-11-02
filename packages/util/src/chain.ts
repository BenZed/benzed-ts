
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
    append<Ox = O>(link: Link<O, Ox>, ...links: Link<Ox, Ox>[]): Chain<I, Ox>

    /**
     * Add link(s) to the beginning of the chain
     * @param link 
     */
    prepend<Ix = I>(link: Link<Ix, I>, ...links: Link<I, I>[]): Chain<Ix, O>

    links: readonly Link[]

    [Symbol.iterator](): Iterator<Link>

}

//// Main ////

function isChain(input: (i: unknown) => unknown): input is Chain {
    return 'append' in input && 'prepend' in input
}

function * iterateLinks(this: Chain): Generator<Link> {
    for (const link of this.links)
        yield link
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

    links = links.map(link => isChain(link) ? [...link] : link).flat()

    return Object.assign(
        function(this: unknown, x: unknown) {
            for (const link of links) 
                x = link.call(this, x)

            return x
        },
        {

            prepend(link: Link, ...s: Link[]) {
                return chain(link, ...s, ...links)
            },

            append(link: Link, ...s: Link[]) {
                return chain(...links, link, ...s)
            },

            links,

            [Symbol.iterator]: iterateLinks

        }

    ) as Chain

}

//// Exports ////

export default chain

export {
    chain,
    Chain,
    isChain
}