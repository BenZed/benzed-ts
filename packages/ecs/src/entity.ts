/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Entity ***/

type InputOf<E extends Entity> = E extends Entity<infer I, any> 
    ? I 
    : never

type OutputOf<E extends Entity> = E extends Entity<any, infer O> 
    ? O 
    : never 

abstract class Entity<I = any, O = any> {

    private readonly _input!: I
    private readonly _output!: O

    public abstract execute(
        input: I,
        refs: Entity<O>[]
    ): {
        output: O
        next: Entity<O> | null
    } 

}

/*** Exports ***/

export default Entity

export {
    Entity,
    InputOf,
    OutputOf
}