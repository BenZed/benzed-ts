import { Component, Compute, InputOf, isAny, OutputOf } from './component'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Pipe Commponent ***/

type Components = readonly Component[]

type FirstComponent<C extends Components> = C extends [infer F, ...any] ? F : unknown

type LastComponent<C extends Components> = C extends [...any, infer L] | [infer L] ? L : unknown

type ComponentsInput<C extends Components> = InputOf<FirstComponent<C>>

type ComponentsOutput<C extends Components> = OutputOf<LastComponent<C>>

type ToComponent<C extends Component<any> | Compute<any>> = C extends Component<any> 
    ? C
    : Component<InputOf<C>, OutputOf<C>>

function toComponent<C extends Component<any> | Compute<any>>(input: C): ToComponent<C> {
    return (
        typeof input === 'function' 
            ? { compute: input, canCompute: isAny } 
            : input
    ) as ToComponent<C>
}

export class Pipe<C extends Components> extends Component<ComponentsInput<C>, ComponentsOutput<C>> {

    static create<Cx extends Component<any> | Compute<any>>(
        component: Cx): Pipe<[ToComponent<Cx>]> {
        return new Pipe(toComponent(component))
    }

    components: C
    private constructor(
        ...components: C
    ) {
        super()
        this.components = components
    }

    /*** Build Interface ***/

    add<Cx extends Component<ComponentsOutput<C>, any> | Compute<ComponentsOutput<C>, any>>(
        component: Cx
    ): Pipe<[...C, ToComponent<Cx>]> {
        return new Pipe(...this.components, toComponent(component))
    }

    get<I extends number>(index: I): C[I] {
        return this.components[index]
    }

    get first(): FirstComponent<C> {
        return this.components[0] as FirstComponent<C>
    }

    get last(): LastComponent<C> {
        return this.components[this.components.length - 1] as LastComponent<C>
    }

    /*** Component Implementation ***/

    canCompute(input: unknown): input is ComponentsInput<C> {
        return this.components[0].canCompute(input)
    }

    compute(input: ComponentsInput<C>): ComponentsOutput<C> {

        let output = input as ComponentsOutput<C>
        for (const component of this.components)
            output = component.compute(output) as ComponentsOutput<C>
    
        return output
    }

}
