
/*** Lint ***/

/* eslint-disable 
    @typescript-eslint/no-non-null-assertion,
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

/**
 * Component is just an entity with state
 */
abstract class Component<I = any, O = any, S extends object = object> {

    public abstract execute(input: I): O

    public constructor(public readonly settings: Readonly<S>) {}

}

/*** Exports ***/

export default Component

export {
    Component
}

