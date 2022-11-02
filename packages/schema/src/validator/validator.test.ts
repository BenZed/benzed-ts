import { copy, equals } from '@benzed/immutable'

import {
    AssertTransformEqualValidator,
    AssertTransformValidator,
    AssertValidator,
    ErrorSettings,
    TransformValidator,
    Validator
} from './validator'

describe(Validator.name, () => {

    class IdValidator extends Validator<unknown, string, { id: string }> {
        validate(input: unknown): string {
            if (input !== this.settings.id)
                throw new Error('incorrectd id')

            return input
        }
    }

    it('implements CopyComparable', () => {
        const isAdmin = new IdValidator({ id: 'admin' })

        const isAdminCopy = copy(isAdmin)

        expect(equals(isAdmin, isAdminCopy)).toBe(true)
        expect(isAdmin).not.toBe(isAdminCopy)
        expect(isAdmin.settings).toEqual(isAdminCopy.settings)
    })

    describe('settings getter', () => {
        it('gets settings', () => {
            const settings = { id: 'cake' }
            const isCake = new IdValidator(settings)
            expect(isCake.settings).toEqual(settings)
        })
    })

    describe('applySettings()', () => {
        const isJoe = new IdValidator({ id: 'joe' })
        const billSettings = { id: 'bill' }
        isJoe.applySettings(billSettings)

        it('applies settings', () => {
            expect(isJoe.settings).toEqual(billSettings)
        })

        it('immutably', () => {
            expect(isJoe.settings).not.toBe(billSettings)
        })

    })

})

describe(TransformValidator.name, () => {

    class MultiplyValidator extends TransformValidator<number, number, { by: number }> {
        protected _transform(input: number): number {
            return input * this.settings.by
        }
    }

    const byTwo = new MultiplyValidator({ by: 2 })

    it('applies transformations with true allowTransform arg', () => {
        expect(byTwo.validate(1, true))
            .toEqual(2)
    })

    it('does not apply transformations with false allowTransform arg', () => {
        expect(byTwo.validate(1, false))
            .toEqual(1)
    })

})

describe(AssertValidator.name, () => {

    class NonEmptyValidator<T extends ArrayLike<unknown>> extends
        AssertValidator<T, ErrorSettings<[input: T]>> {

        protected _assert(input: T): void {
            if (input.length === 0) {
                this._throwWithErrorSetting(
                    'must not be empty',
                    input
                )
            }
        }

    }

    it(`extends ${Validator.name}`, () => {
        expect(new NonEmptyValidator({}))
            .toBeInstanceOf(Validator)
    })

    describe('_throwWithErrorSetting()', () => {

        it('throws with configured setting', () => {
            const effortEmpty = new NonEmptyValidator<ArrayLike<unknown>>({
                error: 'put some effort into it'
            })

            expect(() => effortEmpty.validate([]))
                .toThrow('put some effort into it')
        })

        it('error method gets args', () => {
            const profaneEmpty = new NonEmptyValidator<string>({
                error: (value) => `"${value}" is an empty string you fucking fuck`
            })

            expect(() => profaneEmpty.validate(''))
                .toThrow('"" is an empty string you fucking fuck')
        })

        it('throws with default error if none configured', () => {
            const isntEmpty = new NonEmptyValidator<unknown[]>({})

            expect(() => isntEmpty.validate([]))
                .toThrow('must not be empty')
        })
    })
})

describe(AssertTransformValidator.name, () => {

    class DigitValidator extends AssertTransformValidator<string | number, number> {

        protected _transform(input: string | number): number {
            return typeof input === 'number'
                ? input
                : parseInt(input)
        }

        protected _assert(input: string | number): asserts input is number {
            if (typeof input === 'number' && !Number.isNaN(input) && isFinite(input))
                return

            this._throwWithErrorSetting(
                'must be a digit string or a finite number'
            )
        }
    }

    it(`extends ${TransformValidator.name}`, () => {
        expect(new DigitValidator({}))
            .toBeInstanceOf(TransformValidator)
    })

    it('throws errors with given setting', () => {
        expect(() =>
            new DigitValidator({ error: 'NaN is not allowed' })
                .validate(NaN, true)
        ).toThrow('NaN is not allowed')
    })

})

describe(AssertTransformEqualValidator.name, () => {

    class MultipleOfValidator extends
        AssertTransformEqualValidator<
        /**/ number,
        /**/ { modulo: number } & ErrorSettings<[modulo: number]>
        > {

        //// AssertTransformEqual Implementation ////

        protected _transform(input: number): number {
            return input - input % this.settings.modulo
        }

        protected _getErrorDefaultAndArgs(): [ifUnset: string, modulo: number] {
            return [
                `must be a multiple of ${this.settings.modulo}`,
                this.settings.modulo
            ]
        }

    }

    const isEven = new MultipleOfValidator({ modulo: 2, error: 'must be even' })

    it(`extends ${AssertTransformEqualValidator.name}`, () => {
        expect(isEven)
            .toBeInstanceOf(AssertTransformEqualValidator)
    })

    it('transforms', () => {
        expect(isEven.validate(5, true))
            .toEqual(4)
    })

    it('throws if input is not equal to the transform of that input', () => {
        expect(() => isEven.validate(10, false))
            .not
            .toThrow()

        expect(() => isEven.validate(5, false))
            .toThrow('must be even')
    })
})