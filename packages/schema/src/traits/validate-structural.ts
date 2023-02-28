import { Structural } from '@benzed/immutable'
import {Traits } from '@benzed/traits'
import { ValidateCopy } from './validate-immutable'

//// EsLint ////

export abstract class ValidateStructural extends Traits.merge(ValidateCopy, Structural) {

}