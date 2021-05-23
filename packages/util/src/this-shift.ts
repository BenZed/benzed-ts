/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Types ***/

type Func = (...args: any) => any

type FirstParameter<F extends Func> = Parameters<F>[0]

type LastParameter<F extends Func> = Parameters<F> extends [...unknown[], infer Last]
    ? Last
    : never

type AllButFirstParameter<F extends Func> = Parameters<F> extends [unknown, ... infer Rest]
    ? Rest
    : never

type AllButLastParameter<F extends Func> = Parameters<F> extends [... infer Rest, unknown]
    ? Rest
    : never

type ThisShifted<F extends Func> = (
    this: FirstParameter<F>,
    ...args: AllButFirstParameter<F>
) => ReturnType<F>

type ThisPopped<F extends Func> = (
    this: LastParameter<F>,
    ...args: AllButLastParameter<F>
) => ReturnType<F>

/*** Main ***/

/**
 * Returns an output function that shifts the first parameter of the input function,
 * placing it in the 'this' context
 * @param func Function to arg shift
 */
function thisShift<F extends Func>(
    func: F,
): ThisShifted<F> {

    return function (
        this: FirstParameter<F>,
        ...args: AllButFirstParameter<F>
    ): ReturnType<F> {
        return func(this, ...args) as ReturnType<F>
    }
}

/**
 * Returns an output function that pops the final parameter of the input function,
 * placing it in the 'this' context
 * @param func Function to arg pop
 */
function thisPop<F extends Func>(
    func: F,
): ThisPopped<F> {

    return function (
        this: LastParameter<F>,
        ...args: AllButLastParameter<F>
    ): ReturnType<F> {

        args.push(this)

        return func(...args) as ReturnType<F>
    }
}

/*** Exports ***/

export default thisShift

export {
    thisShift,
    thisPop,
    ThisShifted,
    ThisPopped,

    FirstParameter,
    LastParameter,

    AllButFirstParameter,
    AllButLastParameter
}