import { Validate, ValidatorSettings } from '@benzed/schema'
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

interface InstanceValidator<C extends InstanceInput> extends Validate<unknown, InstanceType<C>>, InstanceSettings<C> {}

//// Main ////

class Instance<C extends InstanceInput> extends Type<InstanceType<C>> {

    get Type(): C {
        return this._mainValidator.Type
    }

    override get _mainValidator(): InstanceValidator<C> {
        return this.validators[0] as InstanceValidator<C>
    }

    constructor(settings: InstanceSettings<C>) {
        super({

            name: settings.Type.name,

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