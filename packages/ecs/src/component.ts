import { pass } from '@benzed/util/lib'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Compute ***/

export interface Compute<I = unknown, O = unknown> {
    (input: I): O
}

export type InputOf<T> = T extends Compute<infer I, any> | Component<infer I, any>
    ? I
    : unknown

export type OutputOf<T> = T extends Compute<any, infer O> | Component<any, infer O>
    ? O
    : unknown

/*** Component ***/

export abstract class Component<I = unknown, O = I> {

    static plain<O>(
        compute: (input: any) => O,
    ): Component<any,O>

    static plain<I,O>(
        compute:(input: I) => O,
        canCompute:(value: unknown) => value is I
    ): Component<I,O> 
    
    static plain(
        compute: any,
        canCompute = pass as any
    ): Component<any> {
        return {
            compute,
            canCompute
        }
    }

    /**
     * Returns true if this component can compute the given input
     */
    abstract canCompute(value: unknown): value is I

    abstract compute(input: I): O

}

/**
 * Is the given a value a component?
 */
export function isComponent<I = unknown, O = I>(input: unknown): input is Component<I,O> {

    return input instanceof Component || 
        
        input !== null && 
        typeof input === 'object' && 
        typeof (input as any).compute === 'function' && 
        typeof (input as any).canCompute === 'function'

}

