import { MutateValidator, ValidateOutput, Validator } from '@benzed/schema'
import { TypeGuard } from '@benzed/util'

//// Types ////

type Is<V extends Validator> =  
    TypeGuard<ValidateOutput<V>>

//// Implementation ////

