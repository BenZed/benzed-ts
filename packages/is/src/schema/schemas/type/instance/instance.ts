import { Property } from '@benzed/util'
import Type from '../type'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

export type InstanceInput = 
    (new (...args: any) => object) |
    (abstract new (...args: any) => object)

//// Main ////

class Instance<C extends InstanceInput> extends Type<InstanceType<C>> {

    override get name(): string {
        const { Type } = this
        return Type.name ? `isInstanceOf${Type.name}` : 'isInstance'
    }

    constructor(readonly Type: C) {

        const is = Property.name(
            function(this: Instance<C>, i: unknown): i is InstanceType<C> {
                return i instanceof this.Type
            },
            Type.name ? `isInstanceOf${Type.name}` : 'isInstance'
        )

        super({
            name: Type.name,
            is
        })

    }

}

//// Exports ////

export default Instance

export {
    Instance
}