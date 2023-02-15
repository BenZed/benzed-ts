import { ceil, floor, round } from '@benzed/math'
import { $$settings } from '@benzed/schema'

import { isFinite, pick } from '@benzed/util'

import { SubValidator } from '../../../validators'

//// Helper ////

// const toPrecisionSettings = new SignatureParser({
//     by: isNumber,
//     ...toNameErrorId.types
// }).addLayout('by', 'error', 'name', 'id')
//     .addLayout('by', 'error', 'id')
//     .addLayout('by', 'id') 

// type PrecisionSettingsSignature = [
//     by: number, 
//     message?: string | ValidationErrorMessage<number>,
//     name?: string
// ]

//// Helper ////

abstract class Precision extends SubValidator<number> {

    constructor(readonly by: number) {
        super()
    }

    override message(): string {
        const detail = this.by === 1 ? '' : ` by ${this.by}`
        return `Must be ${this.name.toLowerCase()}ed${detail}`
    }

    get [$$settings](): Pick<this, 'name' | 'enabled' | 'by' | 'message'> {
        return pick(this, 'name', 'enabled', 'by', 'message')
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