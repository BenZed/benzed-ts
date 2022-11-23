import { Map as Link } from '../types'

//// Types ////

interface Chain<I = unknown, O = unknown> extends Link<I,O> {

    /**
     * Add link(s) to the end of the chain
     * @param link 
     */
    link<Ox>(link: Link<O, Ox>, ...links: Link<Ox, Ox>[]): Chain<I, Ox>

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

function link(this: Chain, link: Link, ...s: Link[]): Chain {
    return chain(...this.links, link, ...s)
}

//// Main ////

function isChain(input: (i: unknown) => unknown): input is Chain {
    return 'link' in input && typeof input['link' as keyof typeof input] === 'function'
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
            link,
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