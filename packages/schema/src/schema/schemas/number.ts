
import { ceil, floor, round } from '@benzed/math'
import { isBigInt, isBoolean, isFinite, isNumber, isObject, isString } from '@benzed/util'

import { SubValidator, SubValidatorSettings } from '../../validators'
import { ValidationErrorInput } from '../../validator'

import { 
    Schema
} from '../schema'
import { ApplySubValiator } from '../schema-types'

import { 
    Cast, 
    Type,
    defaultTypeSettings, 
    TypeAddSubValidatorSettings
} from './type'

import { $$id } from '../../symbols'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Symbol Ids ////

const $$precision = Symbol('precision-validator')
const $$range = Symbol('range-validator')

//// Sub Validators ////

interface PrecisionSettings extends SubValidatorSettings<number> {
    readonly by?: number
}

abstract class Precision extends SubValidator<number> {

    readonly by: number

    /**
     * @internal
     */
    readonly [$$id]: symbol = this[$$id] || $$precision

    constructor(
        ...input: 
        [ by?: number ] | 
        [ error: ValidationErrorInput<number> ] | 
        [ settings: PrecisionSettings ]
    ) {

        const settings = isObject<PrecisionSettings>(input[0])
            ? input[0]
            : isNumber(input[0]) 
                ? { by: input[0] }
                : { error: input[0] }

        const { by = 1, ...rest } = settings 

        super(rest)
        this.by = by
    }

    override error(): string {
        const detail = this.by === 1 ? '' : ` by ${this.by}`
        return `Must be ${this.name.toLowerCase()}ed${detail}`
    }
}

class Round extends Precision {
    override transform(input: number): number {
        return round(input, this.by)
    }
}

class Ceil extends Precision {
    override transform(input: number): number {
        return ceil(input, this.by)
    }
}

class Floor extends Precision {
    override transform(input: number): number {
        return floor(input, this.by)
    }
}

const Finite = new class Finite extends SubValidator<number> {
    override isValid(input: number): boolean {
        return isFinite(input)
    }
}

//// Number Validation Defaults ////

const castToNumber: Cast = (i) => {
    
    if (isBigInt(i))
        i = `${i}`

    if (isString(i))
        return parseFloat(i)

    if (isBoolean(i))
        return i ? 1 : 0

    return i
}

//// Number Schema Type ////

interface Number extends Type<number> {

    get settings(): TypeAddSubValidatorSettings<number, {
        finite: typeof Finite
        round: typeof Round
        floor: typeof Floor
        ceil: typeof Ceil
        // range: typeof Range
    }>

    round: ApplySubValiator<typeof Round, this>
    floor: ApplySubValiator<typeof Floor, this>
    ceil: ApplySubValiator<typeof Ceil, this>
    finite: ApplySubValiator<typeof Finite, this>
    // range: ApplySubValiator<typeof Range, this>
    // above: ApplySubValidator<typeof Above, this>
    // below: ApplySubValidator<typeof Below, this>
    // equalOrAbove: ApplySubValidator<typeof EqualOrAbove, this>
    // equalOrBelow: ApplySubValidator<typeof EqualOrBelow, this>
    // between: ApplySubValidator<typeof Between, this>

}

//// Number Schema Implementation ////

export default new Schema({

    ...defaultTypeSettings,

    name: 'number',

    isValid: isNumber,
    cast: castToNumber,
    finite: Finite,
    round: Round,
    floor: Floor,
    ceil: Ceil 

}).finite(true) as Number

//// Exports ////

export {
    Number,
}