/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Entity ***/

type InputOf<C extends Component> = C extends Component<infer I, any> 
    ? I 
    : never

type OutputOf<C extends Component> = C extends Component<any, infer O> 
    ? O 
    : never 

type RefOf<C extends Component> = C extends Component<any,any,infer T> 
    ? T 
    : Component

abstract class Component<
    I = any, 
    O = any, 
    R extends Component<O, any, any> = Component<O, any, any>
> {

    private readonly _input!: I
    private readonly _output!: O

    public get name(): string {
        return this.constructor.name
    }

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
    Component,
    InputOf,
    OutputOf,
    RefOf
}