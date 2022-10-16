
/* eslint-disable 
    @typescript-eslint/no-non-null-assertion,
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type Input<E extends Entity | EntityF> = 
    E extends Entity<infer I, any> | EntityF<infer I, any>
        ? I 
        : any 
type Output<E extends Entity | EntityF> = 
    E extends Entity<any, infer O> | EntityF<any, infer O>
        ? O 
        : any 

type EntityF<I = any, O = any> = (input: I) => O

/*** Main ***/

abstract class Entity<I = any, O = any> {

    public abstract execute(input: I): O

}

/*** Exports ***/

export default Entity

export {
    Entity,
    EntityF,
    Input,
    Output
}