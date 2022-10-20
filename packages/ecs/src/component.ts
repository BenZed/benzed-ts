
/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Execute ***/

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

    return input !== null && 
        typeof input === 'object' && 
        typeof (input as { [key:string]: unknown }).compute === 'function'

}

/**
 * For quickly defining components with props/state
 */
export function component <C extends Component<any>> (
    compute: Compute<any>, 
    settings: object
): C {
    const component = { compute, ...settings } as unknown as C
    component.compute = component.compute.bind(component)
    return component
}
