/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Component ***/

type ComponentInput<C extends Component<any,any,any>> = C extends Component<infer I, any> 
    ? I 
    : never

type ComponentOutput<C extends Component<any,any,any>> = C extends Component<any, infer O> 
    ? O 
    : never 

type ComponentRef<C extends Component<any,any,any>> = C extends Component<any,any,infer T> 
    ? T 
    : Component

abstract class Component<
    I = any, 
    O = any, 
    R extends Component<O, any, any> = Component<O, any, any>
> {

    protected readonly _input!: I
    protected readonly _output!: O

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
    ComponentInput,
    ComponentOutput,
    ComponentRef

}