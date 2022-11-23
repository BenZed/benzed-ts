import { is } from '@benzed/is'
import { log } from '@benzed/math'

import { TypeValidator } from '../validator/type'
import { AddFlag, Flags, HasOptional } from './flags'

import Schema from './schema'
import EnumSchema from './enum'
import StringSchema from './string'
import NumberSchema from './number'

for (const [Flag, getFlagKey, addFlagKey] of [
    [Flags.Optional, 'isOptional', 'optional'],
    [Flags.Mutable, 'isMutable', 'mutable']
] as const) {

    describe(`Flags.${Flags[Flag]}`, () => {

        const schemaWithFlag = new EnumSchema([null], Flag)
        const schemaWithoutFlag = new EnumSchema([null])

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
                expect(schemaWithFlag).toBeInstanceOf(EnumSchema)
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
        cast: input =>is.string(input) ? 'foo' : input
    })

    override readonly optional!: HasOptional<
    /**/ F,
    /**/ never,
    /**/ FooSchema<AddFlag<Flags.Optional, F>>
    >

    override readonly mutable: unknown
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
            .toThrow('must be foo')

        expect(() => fooSchema.assert('foo'))
            .not
            .toThrow()
    })

    it('works when dangling this context', () => {
        expect(() => ['bar'].forEach(fooSchema.assert)).toThrow('must be foo')
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
            .toThrow('must be foo')
    })

    it('considers optional properties', () => {
        expect(() => 

            fooSchema
                .optional 
                .validate(undefined)

        ).not.toThrow()
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
            .toThrow('is required')

        expect(fooSchemaWithDefault.validate(undefined))
            .toEqual('foo')
    })
})

describe('error() method', () => {

    const fooSchemaWithError = fooSchema.error('you fucked up')

    it('instances a new schema with a different type error setting', () => {
        expect(() => 
            fooSchemaWithError
                .validate(100)
        ).toThrow('you fucked up')
    })
})

describe('name() method', () => {

    const fooSchemaWithName = fooSchema.name('bar')

    it('instances a new schema with a different type name setting', () => {
        expect(() => fooSchemaWithName.validate(200))
            .toThrow('must be bar')
    })

    it('has optional article property', () => {
        expect(() => fooSchemaWithName.name({ article: 'a'}).validate(200))
            .toThrow('must be a bar')
    })

})

describe('custom validator methods', () => {

    it('.validates() allows the addition of custom validators', () => {
        
        const doctorName = new StringSchema().validates(
            i => i.startsWith('Dr.') ? i : 'Dr. ' + i.trimStart(), 
            i => `${i} must be a doctor`
        )

        expect(doctorName.validate('James')).toEqual('Dr. James')
        expect(() => doctorName.assert('James')).toThrow('James must be a doctor')
    })

    it('.transforms() allows the addition of custom transformers', () => {

        const exclaim = new StringSchema().transforms(i => i + '!')

        expect(exclaim.validate('Hello?')).toEqual('Hello?!')
        expect(() => exclaim.assert('Hello?')).not.toThrow()
        
    })

    it('.asserts() allows the addition of custom asserters', () => {

        const powerOfTwo = new NumberSchema().asserts(
            i => log(i) / log(2) % 1 === 0, 
            'must be a power of 2'
        )

        expect(powerOfTwo.validate(8))  
            .toEqual(8)

        expect(() => powerOfTwo.validate(12))
            .toThrow('must be a power of 2')
    })

})