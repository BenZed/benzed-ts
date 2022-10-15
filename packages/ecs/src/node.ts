import { StringKeys } from '@benzed/util'

import { Entity, InputOf, OutputOf } from './entity'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** System ***/

type Links = readonly string[]

type System = { [key: string]: [Entity, ...Links] }

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

type LinksOf<E extends [Entity, ...Links] | [Entity]> = E extends [Entity, ...infer L]
    ? L 
    : []

type EndLinks<S extends System, L extends keyof S> = keyof {
    [K in L as LinksOf<S[K]> extends [] ? K : never]: unknown
}

type AddLink<E extends [Entity, ...Links] | [Entity], L extends string> = [
    E[0],
    ...LinksOf<E>,
    L
]

/*** Node ***/

type AddEntity<S extends System, F extends StringKeys<S>> = 
    Entity<OutputOf<S[F][0]>>
    
class Node<S extends System = any, I extends string = any> 
    extends Entity<SystemInput<S,I>, SystemOutput<S,I>> {

    /*** Static ***/
        
    public static create<I1 extends string, E extends Entity>(
        ...input: [I1, E]
    ): Node<{ [K in I1]: [E] }, I1> {

        const [ name, entity ] = input

        return new Node({ 
            [name]: [entity]
        }, name) as any
    }

    /*** Constructor ***/
    
    private constructor(
        public readonly system: S,
        private readonly _inputKey: I,
    ) {
        super() 
    }

    /*** Interface ***/
    
    public add<
        F extends StringKeys<S>[], 
        T extends string, 
        E extends AddEntity<S, F[number]>
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
                            [
                                ...sys[fromLink].splice(1), 
                                toLink
                            ]
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