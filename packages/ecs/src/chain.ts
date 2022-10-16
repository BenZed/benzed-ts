import Component, { ComponentInput, ComponentOutput, ComponentRef } from './component/component'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Types ***/

type Components = readonly Component<any,any,any>[]

type ChainInput<C extends Components> = C[0] extends Component<any,any,any>
    ? ComponentInput<C[0]>
    : void

type ChainOutput<C extends Components> = 
    LastComponent<C> extends Component<any,any,any>
        ? ComponentOutput<LastComponent<C>>
        : void

type LastComponent<C extends Components> =    
    C extends [...any, infer CL] | [ infer CL ]
        ? CL 
        : never

type PushComponent<C extends Components> = 
    LastComponent<C> extends Component<any,any,any>
        ? Component<ChainOutput<C>, any, any>
        : Component<any,any,any>

type ChainRefs<C extends Components> = LastComponent<C> extends Component<any,any,any> 
    ? ComponentRef<LastComponent<C>>
    : Component<ChainOutput<C>>

/*** Chain ***/

class Chain<
    C extends Components
> extends Component<ChainInput<C>, ChainOutput<C>, ChainRefs<C>> {

    private constructor(
        public readonly components: C
    ) {
        super()
    }

    public static create<C1 extends Components>(
        ...input: C1
    ): Chain<C1> {
        return new Chain(input)
    }

    public execute(
        input: ChainInput<C>, 
        refs: ChainRefs<C>[]
    ): {
            output: ChainOutput<C>
            next: ChainRefs<C> | null 
        } {
        
        let output = input as ChainOutput<C>
        let next: ChainRefs<C> | null = null

        for (let i = 0; i < this.components.length; i++) {

            const component = this.components[i]

            const result = component.execute(output, refs)

            const isAtLast = i = this.components.length - 1
            if (isAtLast)
                next = result.next

            output = result.output
        }

        return {
            output,
            next
        }
    }

    public push<C1 extends PushComponent<C>>(
        component: C1
    ): Chain<[...C, C1]> {
        return new Chain([
            ...this.components, 
            component
        ])
    }
}

/*** Export ***/

export default Chain

export {
    Chain,
    ChainInput,
    ChainOutput
}