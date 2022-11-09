import Component, { ComponentConstructor, Components } from './component'
import Entity from './entity'

import { Compile, StringKeys } from '@benzed/util'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

/*** Main ***/

type ComponentConstructorParams<T extends ComponentConstructor> = ConstructorParameters<T> extends [Component, ...infer R]
    ? R 
    : []

type SystemEntity<M extends Components, T extends SystemComponents> = Entity<M> & {
    [K in StringKeys<T> as `use${K}`]: (...params: ComponentConstructorParams<T[K]>) => SystemEntity<[...M, InstanceType<T[K]>], T>
}

type SystemComponents = { [key: string]: ComponentConstructor }

type MergeComponents<T extends SystemComponents, Tx extends SystemComponents> =
     Compile<T & Tx, ComponentConstructor, false>

//// Main ////

class System<T extends SystemComponents> {

    static create(): System<{}> {
        return new System({})
    }

    private constructor(readonly types: T) {}

    extend<Tx extends SystemComponents>(types: Tx): System<MergeComponents<T, Tx>> {

        return new System({
            ...this.types,
            ...types
        }) as any
    }

    create(): SystemEntity<[], T> {
        const entity = Entity.create()

        return entity as SystemEntity<[], T>
    }

}

//// Exports ////

export default System 

export {
    System
}