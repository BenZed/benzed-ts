import { StringKeys } from '@benzed/util'

import { Entity, InputOf, OutputOf } from './entity'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** System ***/

type Links = readonly string[]
type E$ = 0
type L$ = 1

type System = { [key: string]: [Entity, Links] }

type SystemInput<S extends System, I extends string> = InputOf<S[I][E$]>

type SystemOutput<S extends System, I extends string> = OutputOf<SystemEndLinkEntities<S, I>>

type SystemEndLinkEntities<
    S extends System, 
    L extends keyof S
> = 
    {
        [K in L]: S[K][L$] extends [] 
            ? S[K][E$]
            : SystemEndLinkEntities<S, S[K][L$][number] | EndLinks<S, L>>
    }[L]

type EndLinks<S extends System, L extends keyof S> = keyof {
    [K in L as S[K][L$] extends [] ? K : never]: unknown
}

/*** Node ***/

type AddEntity<S extends System, F extends StringKeys<S>> = 
    Entity<OutputOf<S[F][E$]>>
    
class Node<S extends System = any, I extends string = any> 
    extends Entity<SystemInput<S,I>, SystemOutput<S,I>> {

    public static create<I1 extends string, E extends Entity>(
        ...input: [I1, E]
    ): Node<{ [K in I1]: [E,[]] }, I1> {

        const [ name, entity ] = input

        return new Node({ 
            [name]: [entity, []]
        }, name) as any
    }

    private constructor(
        public readonly system: S,
        private readonly _inputKey: I,
    ) {
        super() 
    }

    public add<F extends StringKeys<S>[], T extends string, E extends AddEntity<S, F[number]>>(
        ...input: [F, T, E]
    ): Node<{

            [K in StringKeys<S> | T]: [
                K extends T ? E : S[K][E$],
                K extends T 
                    ? [] 
                    : K extends F[number] 
                        ? [...S[K][L$], T] 
                        : S[K][L$]

            ]
        }, I> {

        const [ fromLinks, toLink, entity ] = input

        return new Node(
            {
                ...fromLinks.reduce<System>((sys, fromLink) => 

                    Object.assign(sys, {
                        [fromLink]: [
                            sys[fromLink][0],
                            [
                                ...sys[fromLink][1], 
                                toLink
                            ]
                        ]
                    })

                , this.system),

                [toLink]: [entity, []]

            }, 
            this._inputKey
        ) as any
    }

}

export {
    Node
}