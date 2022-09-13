import { isString } from '@benzed/is'

import { TypeValidator } from '../validator/type'
import { AddFlag, Flags, HasOptional } from './flags'

import Schema from './schema'
import NullSchema from './null'

for (const [Flag, getFlagKey, addFlagKey] of [
    [Flags.Optional, 'isOptional', 'optional'],
    [Flags.Mutable, 'isMutable', 'mutable']
] as const) {

    describe(`Flags.${Flags[Flag]}`, () => {

        const schemaWithFlag = new NullSchema(null, Flag)
        const schemaWithoutFlag = new NullSchema()

        describe(`.${getFlagKey}`, () => {

            for (const [currSchema, result] of [
                [schemaWithFlag, true],
                [schemaWithoutFlag, false]
            ] as const) {
                it(
                    `returns ${result} if flags ` +
                    `${result ? 'do' : 'do not'} ` +
                    `include Flags.${Flags[Flag]}`, () => {
                        expect(currSchema['_flags'].includes(Flag))
                            .toEqual(currSchema[getFlagKey])
                    }
                )
            }
        })

        describe(`.${addFlagKey}()`, () => {

            it(`creates a new instance of the schema with ${Flags[Flag]} flag`,
                () => {
                    expect(schemaWithFlag[getFlagKey]).toBe(true)
                    expect(schemaWithFlag).not.toBe(schemaWithoutFlag)
                })

            it('instance is of extended class', () => {
                expect(schemaWithFlag).toBeInstanceOf(NullSchema)
            })

            it('cannot be called on instances with flag', () => {
                expect(() => schemaWithFlag[addFlagKey]())
                    .toThrow(`Schema is already ${Flags[Flag]}`)
            })
        })
    })
}

class FooSchema<F extends Flags[]> extends Schema<void, 'foo', F> {

    protected override _typeValidator = new TypeValidator({
        name: 'foo',
        is: (input): input is 'foo' => input === 'foo',
        cast: input => isString(input) ? 'foo' : input
    })

    public override readonly optional!: HasOptional<
    /**/ F,
    /**/ never,
    /**/ () => FooSchema<AddFlag<Flags.Optional, F>>
    >

}
const fooSchema = new FooSchema()

describe('is() method', () => {

    it('is() returns true if type is correct', () => {
        expect(fooSchema.is('foo')).toBe(true)
    })

    it('is() returns false if type is incorrect', () => {
        expect(fooSchema.is('')).toBe(false)
        expect(fooSchema.is(1)).toBe(false)
    })

    it('works when dangling this context', () => {
        expect([1, 2, 3, 'foo'].some(fooSchema.is))
            .toBe(true)
    })

})

describe('assert() method', () => {

    it('assert() throws if type is incorrect', () => {

        expect(() => fooSchema.assert(''))
            .toThrow('is not foo')

        expect(() => fooSchema.assert('foo'))
            .not
            .toThrow()
    })

    it('works when dangling this context', () => {
        expect(() => ['bar'].forEach(fooSchema.assert)).toThrow('bar is not foo')
    })

})

describe('validate() method', () => {

    it('validates type', () => {
        expect(fooSchema.validate('foo'))
            .toEqual('foo')
    })

    it('casts to type', () => {
        expect(fooSchema.validate(''))
            .toEqual('foo')
    })

    it('throws if type cannot be cast', () => {
        expect(() => fooSchema.validate(1))
            .toThrow('1 is not foo')
    })

    it('considers optional properties', () => {
        expect(() => fooSchema.optional().validate(undefined))
            .not
            .toThrow()
    })

    it('works when dangling this context', () => {
        expect(['foo'].map(fooSchema.validate)).toEqual(['foo'])
    })

})

describe('cast() method', () => {

    const fooSchemaWithCustomCast = fooSchema.cast(() => 'foo')

    it('instances a new type validator with a different cast setting', () => {
        expect(fooSchemaWithCustomCast.validate({ this: 'would typically not work' }))
            .toEqual('foo')
    })

})

describe('default() method', () => {

    const fooSchemaWithDefault = fooSchema.default(() => 'foo')

    it('instances a new schema with a different default setting', () => {
        expect(() => fooSchema.validate(undefined))
            .toThrow('undefined is not foo')

        expect(fooSchemaWithDefault.validate(undefined))
            .toEqual('foo')
    })
})

describe('error() method', () => {

    const fooSchemaWithError = fooSchema.error('you fucked up')

    it('instances a new schema with a different type error setting', () => {
        expect(() => fooSchemaWithError.validate(undefined)).toThrow('you fucked up')
    })
})

describe('name() method', () => {

    const fooSchemaWithName = fooSchema.name('bar')

    it('instances a new schema with a different type name setting', () => {
        expect(() => fooSchemaWithName.validate(undefined))
            .toThrow('undefined is not bar')
    })

})
