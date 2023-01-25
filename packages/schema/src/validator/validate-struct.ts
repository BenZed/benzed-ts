
import { CallableStruct, Struct, StructAssignState, StructState } from '@benzed/immutable'
import Validate, { AnyValidate } from './validate'

type ValidateSettings<V extends AnyValidate> = StructState<V>
type ValidateAssign<V extends AnyValidate> = StructAssignState<V>

// TODO hoist this up to @benzed/immutable
abstract class ValidateStruct<I,O extends I> extends CallableStruct<Validate<I,O>> {

    static override apply = Struct.apply

} 

export default ValidateStruct

export {
    ValidateStruct,
    ValidateSettings,
    ValidateAssign
}