
type Flip <A extends unknown[]> = A extends [ ... infer Ar, infer Ax]

    ? [Ax, ...Flip<Ar>]
    : []

//// Main ////

/**
 * Return a tuple with arguments in the reverse order that they're provided
 */
function flip<A extends unknown[]>(...args: A): Flip<A> {
    args.reverse()
    return args as unknown as Flip<A>
}

//// Exports ////

export default flip

export {
    flip,
    flip as reverse
}