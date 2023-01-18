import { TypeValidatorSettings } from '../../../../validator'
import Type from '../type'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

export type InstanceInput = 
    (new (...args: any) => object) |
    (abstract new (...args: any) => object)

interface InstanceSettings<C extends InstanceInput> extends TypeValidatorSettings<InstanceType<C>> {
    Type: C
}

//// Main ////

class Instance<C extends InstanceInput> extends Type<InstanceType<C>> {

    get Type(): C {
        return (this._getTypeValidator() as unknown as InstanceSettings<C>).Type
    }

    override get name(): string {
        const { Type } = this
        return Type.name ? `isInstanceOf${Type.name}` : 'isInstance'
    }

    constructor(Type: C) {

        super({

            name: Type.name,

            is(i: unknown): i is InstanceType<C> {
                return i instanceof this.Type
            },

            Type

            // TODO add support for implicit extended ValidatorSettings
        } as InstanceSettings<C>)

    }

}

//// Exports ////

export default Instance

export {
    Instance
}