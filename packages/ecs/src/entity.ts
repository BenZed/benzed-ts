import { Component } from './component'

/*** Lint ***/

/* eslint-disable 
    @typescript-eslint/no-non-null-assertion,
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

interface Entity<I = any, O = any> {
    (input: I): O
}

type EntitySettings<E> = {
    [K in keyof E]: E[K]
}

type EntityDefinition<E extends Entity> = 
    (settings: EntitySettings<E>) => (input: InputOf<E>) => OutputOf<E>

type InputOf<E extends Entity | Component> = 
    E extends Entity<infer I> | Component<infer I>
        ? I 
        : unknown

type OutputOf<E extends Entity| Component > = 
    E extends Entity<any, infer O> | Component<any, infer O>
        ? O 
        : unknown 

/*** Main ***/

function defineEntity<I, O, S extends object>(
    def: (settings: S) => Entity<I,O>
): (settings: S) => Entity<I,O> & S

function defineEntity<E extends Entity>(
    def: EntityDefinition<E>
): (settings: EntitySettings<E>) => E 

function defineEntity(def: any): any {
    return (settings: any) => {

        const entity = def(settings)
        for (const key in settings)
            (entity as any)[key] = settings[key]

        return entity
    }
}

/*** Exports ***/

export default defineEntity

export {
    defineEntity,

    Entity,
    InputOf,
    OutputOf
}
