import { $$copy, $$equals, CopyComparable } from '@benzed/immutable'

/* eslint-disable @typescript-eslint/no-explicit-any */ 

/*** Types ***/

/*** Helper ***/

/*** Main ***/

abstract class Component<N extends string = any> implements CopyComparable<Component<N>> {

    protected abstract readonly _name: N
    public get name(): N {
        return this._name
    }

    public [$$copy](): this {
        const ThisEntity = this.constructor as (new () => this)
        return new ThisEntity()
    }

    public [$$equals](other: unknown): other is this {
        return other instanceof Component
    }

}

/*** Exports ***/

export default Component

export {
    Component
}