import { StringKeys } from '@benzed/util'

import { Entity, InputOf, OutputOf } from './entity'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** System ***/

type Links = readonly string[]

type System = { [key: string]: { entity: Entity, links: Links } }

type SystemInput<S extends System, I extends string> = InputOf<S[I]['entity']>

type SystemOutput<S extends System, I extends string> = OutputOf<SystemEndLinkEntities<S, I>>

type SystemEndLinkEntities<
    S extends System, 
    L extends keyof S
> = 
    {
        [K in L]: S[K]['links'] extends [] 
            ? S[K]['entity']
            : SystemEndLinkEntities<S, S[K]['links'][number] | EndLinks<S, L>>
    }[L]

type EndLinks<S extends System, L extends keyof S> = keyof {
    [K in L as S[K]['links'] extends [] ? K : never]: unknown
}

/*** Node ***/

type AddEntity<S extends System, F extends StringKeys<S>> = 
    Entity<OutputOf<S[F]['entity']>>
    
class Node<S extends System = any, I extends string = any> 
    extends Entity<SystemInput<S,I>, SystemOutput<S,I>> {

    public static create<I1 extends string, E extends Entity>(
        ...input: [I1, E]
    ): Node<{ [K in I1]: { entity: E, links: []} }, I1> {

        const [ name, entity ] = input

        return new Node({ 
            [name]: { 
                entity, 
                links: []
            } 
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

            [K in StringKeys<S> | T]: {
                entity: K extends T ? E : S[K]['entity']
                links: K extends T 
                    ? [] 
                    : K extends F[number] 
                        ? [...S[K]['links'], T] 
                        : S[K]['links']
            }
        }, I> {

        const [ froms, to, entity ] = input

        return new Node(
            {

                ...froms.reduce<System>((sys, from) => {
                    sys[from] = {
                        entity: this.system[from].entity,
                        links: [
                            ...this.system[from].links, 
                            to
                        ]
                    }
                    return sys
                }, this.system),

                [to]: {
                    entity, 
                    links: []
                }

            }, 
            this._inputKey
        ) as any
    }

}

export {
    Node
}