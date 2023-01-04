/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

export type TypeGuard<O extends I, I = unknown> = (input: I) => input is O

export type TypeGuardOutput<T extends TypeGuard<unknown>> = T extends TypeGuard<infer O>    
    ? O
    : unknown

export type TypeAssertion<O extends I, I = unknown> = (input: I) => asserts input is O

export type Func = (...args: any) => any 

export const isFunc = <F extends Func = Func>(i: unknown): i is F => typeof i === 'function'

