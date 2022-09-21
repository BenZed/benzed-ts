import { expectTypeOf } from 'expect-type'
import { Flag, F } from './flags'

import { Schema } from './schema'
import { TypeOf as Infer, TypesOf as InferAll } from './types'

import TypeMethod from './type-methods'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/indent 
*/

/*** Test Helper ***/

class Foo {

}

const fakeSchema = <T>(): Schema<T> => {
    return null as unknown as Schema<T>
}

const fakeMethod = <T, F extends Flag.Is | Flag.Assert | Flag.Validate>(): TypeMethod<T, F> => {
    return null as unknown as TypeMethod<T, F>
}

const isString = (input: unknown, minLength: number): input is string => {
    return typeof input === 'string' && input.length >= minLength
}

function assertString(input: unknown, minLength: number): asserts input is string {
    if (typeof input !== 'string')
        throw new Error('not a string')

    if (input.length < minLength)
        throw new Error(`string must be at least ${minLength} characters long`)
}

/*** Tests ***/

describe('TypeOf', () => {

    it('infers types of schemas', () => {

        const stringSchema = fakeSchema<string>()
        expectTypeOf<Infer<typeof stringSchema>>().toMatchTypeOf<string>()

        const fooSchema = fakeSchema<Foo>()
        expectTypeOf<Infer<typeof fooSchema>>().toMatchTypeOf<Foo>()
    })

    it('infers types of constructors', () => {

        const foo = Foo
        const regexp = RegExp

        expectTypeOf<Infer<typeof foo>>().toMatchTypeOf<Foo>()
        expectTypeOf<Infer<typeof regexp>>().toMatchTypeOf<RegExp>()
    })

    for (const f of [F.Is, F.Assert, F.Validate] as const) {
        it(`infers types of ${F[f].toLowerCase()}-methods`, () => {

            type Flag = typeof f

            const $string = fakeMethod<string, Flag>()
            const $foo = fakeMethod<Foo, Flag>()

            expectTypeOf<Infer<typeof $string>>().toMatchTypeOf<string>()
            expectTypeOf<Infer<typeof $foo>>().toMatchTypeOf<Foo>()

        })
    }

    it('infers type of generic type guards', () => {

        expectTypeOf<Infer<typeof isString>>().toMatchTypeOf<string>()

    })

    it('infers type of generic asserters', () => {

        expectTypeOf<Infer<typeof assertString>>().toMatchTypeOf<string>()

    })
})

describe('TypesOf', () => {

    it('infers types of arrays of schemas', () => {

        const schemas = [
            fakeSchema<string>(),
            fakeSchema<boolean>(),
            fakeSchema<number>()
        ] as const

        expectTypeOf<InferAll<typeof schemas>>()
            .toMatchTypeOf<readonly [string, boolean, number]>()
    })

    it('infers types of arrays of type methods', () => {

        const schemas = [
            fakeMethod<string, F.Is>(),
            fakeMethod<boolean, F.Assert>(),
            fakeMethod<number, F.Validate>()
        ] as const

        expectTypeOf<InferAll<typeof schemas>>()
            .toMatchTypeOf<readonly [string, boolean, number]>()
    })

    it('infers types of arrays of generic type guards', () => {

        const schemas = [
            isString,
            assertString
        ] as const

        expectTypeOf<InferAll<typeof schemas>>()
            .toMatchTypeOf<readonly [string, string]>()
    })

})