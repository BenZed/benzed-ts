
import { Entity } from './entity'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Component ***/

abstract class Component<
    I = any, 
    O = any, 
    R extends Entity<O, any> = Entity<O, any>
> extends Entity<I, O> {

    public abstract execute(
        input: I,
        refs: R[]
    ): {
        output: O
        next: R | null
    } 
    
}

/*** Exports ***/

export default Component

export {
    Component
}