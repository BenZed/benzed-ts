import { ceil, floor, round } from '@benzed/math'

import {
    toNameErrorId,
    ValidationErrorInput,
    SimpleValidator,
    SubValidator
} from '@benzed/schema'

import {
    isFinite,
    isNumber,
    SignatureParser 
} from '@benzed/util'

//// Helper ////

const toPrecisionSettings = new SignatureParser({
    by: isNumber,
    ...toNameErrorId.types
}).addLayout('by', 'error', 'name', 'id')
    .addLayout('by', 'error', 'id')
    .addLayout('by', 'id') 

type PrecisionSettingsSignature = [
    by: number, 
    error?: ValidationErrorInput<number>, 
    name?: string, 
    id?: symbol
]

//// Helper ////

abstract class Precision extends SimpleValidator<number, 'by'> {

    constructor(...input: PrecisionSettingsSignature) {
        const { by, ...settings } = toPrecisionSettings(...input)
        super('by', by, settings)
    }

    override error(): string {
        const detail = this.by === 1 ? '' : ` by ${this.by}`
        return `Must be ${this.name.toLowerCase()}ed${detail}`
    }
}

//// Exports ////

export class Round extends Precision {
    override transform(input: number): number {
        return round(input, this.by)
    }
}

export class Ceil extends Precision {
    override transform(input: number): number {
        return ceil(input, this.by)
    }
}

export class Floor extends Precision {
    override transform(input: number): number {
        return floor(input, this.by)
    }
}

export class Finite extends SubValidator<number> {

    override isValid(input: number): boolean {
        return isFinite(input)
    }

}