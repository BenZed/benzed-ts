/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Entity ***/

type InputOf<E extends Entity> = E extends Entity<infer I> 
    ? I 
    : never

type OutputOf<E extends Entity> = E extends Entity<any, infer O> 
    ? O 
    : never 

abstract class Entity<I = any, O = any> {

    private readonly input!: I
    private readonly output!: O

    public execute( // TODO make abstract 
        input: I,
    ): O {
        return void input as unknown as O
    }

}

/*** Exports ***/

export default Entity

export {
    Entity,
    InputOf,
    OutputOf
}