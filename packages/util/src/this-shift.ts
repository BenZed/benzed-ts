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

type BindShifted<F extends Func> = (
    ...args: AllButFirstParameter<F>
) => ReturnType<F>

type BindPopped<F extends Func> = (
    ...args: AllButLastParameter<F>
) => ReturnType<F>

/*** Main ***/

/**
 * Returns a function that shifts the first parameter of the input function,
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
        return func(...args, this) as ReturnType<F>
    }
}

/**
 * Returns a function that shifts the first parameter off the input function,
 * using the provided argument instead.
 * @param func 
 * @param firstArg 
 * @returns 
 */
function bindShift<F extends Func, T>(
    func: F,
    firstArg: FirstParameter<F>,
): BindShifted<F> {

    return function (
        this: T,
        ...args: AllButFirstParameter<F>
    ) {
        return func.call(this, firstArg, ...args)
    }
}

/**
 * Returns a function that pops the last parameter off the input function,
 * using the provided argument instead.
 * @param func 
 * @param firstArg 
 * @returns 
 */
function bindPop<F extends Func, T>(
    func: F,
    lastArg: LastParameter<F>
): BindPopped<F> {

    return function (
        this: T,
        ...args: AllButLastParameter<F>
    ) {
        return func.call(this, ...args, lastArg)
    }
}

/*** Exports ***/

export default thisShift

export {

    thisShift,
    thisPop,

    bindShift,
    bindPop,

    ThisShifted,
    ThisPopped,

    BindShifted,
    BindPopped,

    FirstParameter,
    LastParameter,

    AllButFirstParameter,
    AllButLastParameter
}