import is from '@benzed/is'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Compute ***/

/**
 * Pure function that gives an output from a single input
 */
export interface Compute<I = unknown, O = I> {
    (input: I): O
}

/**
 * Input of the given Compute or Component type
 */
export type InputOf<T> = T extends Compute<infer I, any> | Component<infer I, any>
    ? I
    : unknown

/**
 * Output of the given Compute or Component type 
 */
export type OutputOf<T> = T extends Compute<any, infer O> | Component<any, infer O>
    ? O
    : unknown

/*** Component ***/
    
/**
 * Input that can be turned into a component
 */
export type FromComponent<I = any, O = I> = Component<I,O> | Compute<I,O>

/**
 * Wrap a compute type as a component type 
 */
export type ToComponent<C extends Component<any> | Compute<any>> = C extends Component<any> 
    ? C
    : Component<InputOf<C>, OutputOf<C>>

type DefineComponentSettings<C extends Component> = {
    [K in keyof C as K extends 'compute' ? never : K]: C[K]
}

/**
 * A component a simply an object that wraps a compute method
 */
export abstract class Component<I = unknown, O = I> {

    /**
     * Quickly define a component 
     */
    static define<C extends Component, S extends DefineComponentSettings<C> = DefineComponentSettings<C>>(
        construct: (settings: S) => (i: InputOf<C>) => OutputOf<C>
    ): (settings: S) => C {

        return (settings: S) => {

            const component = { 
                compute: construct(settings)
            } 

            for (const key in settings)
                (component as any)[key] = settings[key]

            return component as C
        }
    }

    /**
     * Is the given input a component?
     */
    static is<I = unknown, O = I>(input: unknown): input is Component<I,O> {
        return input instanceof Component || 
            is.object<Partial<Component>>(input) && 
            is.function(input.compute)
    }

    /**
     * Create a component from a given compute method
     */
    static from<I,O>(
        compute: (input: I) => O,
    ): Component<I,O>

    /**
     * Ensure the given input is a component
     */
    static from<C extends FromComponent>(
        compute: C
    ): ToComponent<C> 
    
    static from(compute: unknown): unknown {
        return (
            is.function(compute) 
                ? { compute } 
                : compute
        )
    }

    abstract compute(input: I): O

    constructor() {

        const { compute } = this
        // compute may not be defined in the constructor if it's an initalized
        // property in extended classes
        if (compute) 
            this.compute = compute.bind(this)

    }

}

