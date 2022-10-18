
/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Execute ***/

export type Execute<I = unknown, O = unknown> = (input: I) => O

export type InputOf<T> = T extends Execute<infer I, any> | Component<infer I, any>
    ? I
    : unknown

export type OutputOf<T> = T extends Execute<any, infer O> | Component<any, infer O>
    ? O
    : unknown

/*** Component ***/

export abstract class Component<I = unknown, O = I> {

    public abstract execute(input: I): O

}

/**
 * Is the given a value a component?
 */
export function isComponent<I = unknown, O = I>(input: unknown): input is Component<I,O> {

    return input !== null && 
        typeof input === 'object' && 
        typeof (input as { [key:string]: unknown }).execute === 'function'

}