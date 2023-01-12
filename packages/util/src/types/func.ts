/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

export type TypeGuard<O extends I, I = unknown> = (input: I) => input is O
type _TypeGuard = TypeGuard<unknown>

export type TypeAssertion<O extends I, I = unknown> = (input: I) => asserts input is O
type _TypeAssertion = TypeAssertion<unknown>

export type TypeOf<F extends _TypeGuard | _TypeAssertion> = 
    F extends TypeGuard<infer T> | TypeAssertion<infer T> 
        ? T 
        : unknown 

type _TypeMethod = _TypeGuard | _TypeAssertion

type _TypeMethods = _TypeMethod[] | readonly _TypeMethod[]

export type TypesOf<F extends _TypeMethods> = 
    F extends [infer F1, ...infer Fr]
        ? F1 extends TypeGuard<infer T1> 
            ? Fr extends _TypeMethods
                ? [T1, ...TypesOf<Fr>]
                : [T1]
            : Fr extends _TypeMethods
                ? TypesOf<Fr>
                : []
        : []

export type Func = (...args: any) => any 

export const isFunc = <F extends Func = Func>(i: unknown): i is F => typeof i === 'function'

