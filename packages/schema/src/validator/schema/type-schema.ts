import { TypeValidator } from '../validators'
import { ContractSchema } from './contract-schema'
import { SubValidators } from './schema'

//// Quick ////

export class TypeSchema<V extends TypeValidator, S extends SubValidators<V>> extends ContractSchema<V,S> {

    default(def: V['default']): this {
        return this._applyMainValidator({
            default: def
        } as V)
    }

    cast(cast: V['cast']): this {
        return this._applyMainValidator({
            cast
        } as V)
    }

}
