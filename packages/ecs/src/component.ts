import { $$copy, $$equals, CopyComparable } from '@benzed/immutable'
import type { Node } from './node'

/*** Main ***/

abstract class Component<I = unknown, O = I> 
implements CopyComparable<Component<I, O>> {

    protected _node: Node | null = null

    public abstract execute(...args: I extends void ? [] : [I]): O 

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