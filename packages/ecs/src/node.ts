import { StringKeys } from '@benzed/util'
import Component from './component'

import { Entity, InputOf, OutputOf } from './entity'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-non-null-assertion
*/

/*** System ***/

type Links = readonly string[]

type System = { [key: string]: [Component, ...Links] }

type SystemInput<S extends System, I extends string> = 
    InputOf<S[I][0]>

type SystemOutput<S extends System, I extends string> = 
    OutputOf<SystemEndLinkEntities<S, I>>

type SystemEndLinkEntities<
    S extends System, 
    L extends keyof S
> = 
    {
        [K in L]: LinksOf<S[K]> extends [] 
            ? S[K][0]
            : SystemEndLinkEntities<S, LinksOf<S[K]>[number] | EndLinks<S, L>>
    }[L]

type LinksOf<E extends [Component, ...Links] | [Entity]> = E extends [Component, ...infer L]
    ? L 
    : []

type EndLinks<S extends System, L extends keyof S> = keyof {
    [K in L as LinksOf<S[K]> extends [] ? K : never]: unknown
}

type AddLink<E extends [Component, ...Links] | [Component], L extends string> = [
    E[0],
    ...LinksOf<E>,
    L
]

/*** Node ***/

type AddComponent<S extends System, F extends StringKeys<S>> = 
    Component<OutputOf<S[F][0]>>
    
class Node<S extends System = any, I extends string = any> 
    extends Component<SystemInput<S,I>, SystemOutput<S,I>> {

    /*** Static ***/
        
    public static create<I1 extends string, C extends Component>(
        ...input: [I1, C]
    ): Node<{ [K in I1]: [C] }, I1> {

        const [ name, entity ] = input

        return new Node({ [name]: [entity] }, name) as any
    }

    public get input(): Component<SystemOutput<S,I>> {
        return this.system[this._inputKey][0]
    }

    public execute(
        input: SystemInput<S,I>,
        outRefs: Component<SystemOutput<S,I>>[]
    ): {
            output: SystemOutput<S,I>
            next: Component<SystemOutput<S,I>> | null
        } {

        const { system, _inputKey } = this

        let [next, ...links] = system[_inputKey] as [Component | null, ...Links]
        let output = input as SystemOutput<S,I>

        do {

            const refs = links.length === 0 
                ? outRefs 
                : links.map(link => system[link][0])

            const result = next!.execute(output, refs)

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

    /*** Constructor ***/
    
    private constructor(
        public readonly system: S,
        private readonly _inputKey: I,
    ) {
        super() 
    }

    /*** Interface ***/
    
    public link<
        F extends StringKeys<S>[], 
        T extends string, 
        E extends AddComponent<S, F[number]>
    >(...input: [F, T, E]): Node<{

        [K in StringKeys<S> | T]: K extends T 
            ? [E]
            : K extends F[number]
                ? AddLink<S[K], T> 
                : S[K]
    }, I> {

        const [ fromLinks, toLink, entity ] = input

        return new Node(
            {

                ...fromLinks.reduce<System>((sys, fromLink) => 
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

}

export { Node }