
/* eslint-disable 
    @typescript-eslint/no-non-null-assertion
*/

/*** Types ***/

type Input<E extends Entity> = E extends Entity<infer I, unknown> ? I : unknown 
type Output<E extends Entity> = E extends Entity<unknown, infer O> ? O : unknown 

/*** Main ***/

abstract class Entity<I = unknown, O = unknown> {

    public abstract execute(input: I): O

}

/*** Exports ***/

export default Entity

export {
    Entity,
    Input,
    Output
}