import { ValidatorSettings } from '@benzed/schema'
import Type, { TypeExtendSettings } from '../type'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

export type InstanceInput = 
    (new (...args: any) => object) |
    (abstract new (...args: any) => object)

interface InstanceExtendsSettings<C extends InstanceInput> extends TypeExtendSettings<InstanceType<C>> {

}

interface InstanceSettings<C extends InstanceInput> extends InstanceExtendsSettings<C> {
    Type: C
}
//// Main ////

class Instance<C extends InstanceInput> extends Type<InstanceType<C>> {

    get Type(): C {
        const [ main ] = this.validators
        return (main as ValidatorSettings<InstanceType<C>> as { Type: C }).Type
    }

    override get name(): string {
        const { Type } = this
        return Type.name ? `isInstanceOf${Type.name}` : 'isInstance'
    }

    constructor(settings: InstanceSettings<C>) {
        super({

            name: Type.name,

            ...settings,

            isValid(this: InstanceSettings<C>, i: unknown): i is InstanceType<C> {
                return i instanceof this.Type
            }

        })
    }
}

//// Exports ////

export default Instance

export {
    Instance,
    InstanceSettings,
    InstanceExtendsSettings
}