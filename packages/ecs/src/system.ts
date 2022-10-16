import { StringKeys } from '@benzed/util'

import { Component, InputOf, OutputOf, RefOf } from './component/component'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-non-null-assertion
*/

/*** Nodes ***/

type Links = readonly string[]

type Node = [Component, ...Links] | [Component]

type Nodes = { [key: string]: Node }

type NodesInput<S extends Nodes, I extends string> = 
    InputOf<S[I][0]>

type NodesOutput<S extends Nodes, I extends string> = 
    OutputOf<EndLinkNodes<S, I>>

type EndLinkNodes<
    S extends Nodes, 
    L extends keyof S
> = 
    {
        [K in L]: LinksOf<S[K]> extends [] 
            ? S[K][0]
            : EndLinkNodes<S, LinksOf<S[K]>[number] | EndLinks<S, L>>
    }[L]

type LinksOf<N extends Node> = N extends [Component, ...infer L]
    ? L 
    : []

type EndLinks<S extends Nodes, L extends keyof S> = keyof {
    [K in L as LinksOf<S[K]> extends [] ? K : never]: unknown
}

type AddLink<N extends Node, L extends string> = [
    N[0],
    ...LinksOf<N>,
    L
]

type AddComponent<S extends Nodes, F extends StringKeys<S>> = 
    RefOf<S[F][0]>

/*** System ***/
    
class System<S extends Nodes = any, I extends string = any> 
    extends Component<NodesInput<S,I>, NodesOutput<S,I>> {

    /*** Static ***/
        
    public static create<I1 extends string, C extends Component>(
        ...input: [I1, C]
    ): System<{ [K in I1]: [C] }, I1> {

        const [ name, entity ] = input

        return new System({ [name]: [entity] }, name) as any
    }

    public get input(): Component<NodesOutput<S,I>> {
        return this.system[this._inputKey][0]
    }

    /*** Constructor ***/
    
    private constructor(
        public readonly system: S,
        private readonly _inputKey: I,
    ) {
        super() 
    }

    /*** Build Interface ***/
    
    public link<
        F extends StringKeys<S>[], 
        T extends string, 
        E extends AddComponent<S, F[number]>
    >(...input: [F, T, E]): System<{

        [K in StringKeys<S> | T]: K extends T 
            ? [E]
            : K extends F[number]
                ? AddLink<S[K], T> 
                : S[K]
    }, I> {

        const [ fromLinks, toLink, entity ] = input

        return new System(
            {

                ...fromLinks.reduce<Nodes>((sys, fromLink) => 
                    Object.assign(sys, {
                        [fromLink]: [
                            sys[fromLink][0],
                            ...sys[fromLink].splice(1), 
                            toLink
                        ]
                    })
                , this.system),

                [toLink]: [entity]

            }, 
            this._inputKey
        ) as any
    }

    /*** Entity Implementation ***/    

    public execute(
        input: NodesInput<S,I>,
        outRefs: Component<NodesOutput<S,I>>[]
    ): {
            output: NodesOutput<S,I>
            next: Component<NodesOutput<S,I>> | null
        } {

        const { system, _inputKey } = this

        let [next, ...links] = system[_inputKey] as [Component | null, ...Links]
        let output = input as NodesOutput<S,I>

        do {

            const refs = links.length === 0 
                ? outRefs 
                : links.map(link => system[link][0])

            const result = next!.execute(output, refs)
            if (!result.next && links.length > 0) {
                throw new Error(
                    `Premature transfer flow termination: ${next!.name} did not ` + 
                    `return a component when given links: ${links}`
                )
            }

            next = result.next 
            output = result.output
            links = links.reduce<string[]>((links, link) => system[link][0] === next 
                ? system[link].slice(1) as string[] 
                : links, 
            [])

            // next component is being handled by a different node
            if (refs === outRefs)
                break

        } while(next)

        return { 
            output,
            next
        } 
    }

}

export { System }