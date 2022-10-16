
/*** Lint ***/

/* eslint-disable 
    @typescript-eslint/no-non-null-assertion,
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

interface Entity<I = any, O = any> {
    (input: I): O
}

type InputOf<E extends Entity> = E extends Entity<infer I> ? I : unknown

type OutputOf<E extends Entity> = E extends Entity<any, infer O> ? O : unknown 

/*** Exports ***/

export {
    Entity,
    InputOf,
    OutputOf
}
