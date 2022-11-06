
import { AssertMethod } from './type-methods'

import { is, assert, validate } from './$'

import { expectTypeOf } from 'expect-type'

/*** Test Types ***/

class Foo { }

/*** Tests ***/

const methods = { is, assert, validate }
for (const name in methods) {

    const method = methods[name as keyof typeof methods]

    describe.skip(name, () => {

        const describeMethod = method === is ? 'guard' : name

        it('is named', () => {
            expect(method.name).toBe(name)
        })

        it.todo(`${describeMethod}s values against types`)

    })

}

describe.skip('assertions must-be-declared workaround', () => {

    const str: unknown = ''
    const foo: unknown = new Foo()

    it('asserts chained off the assert interface are typesafe', () => {

        void assert.string(str) // no assertions-must-be-declared error 
        // expectTypeOf(str).toEqualTypeOf<string>()
    })

    it('asserts declared off the assert interface need to be declared', () => {

        const assertString1 = assert.string
        // @ts-expect-error assertions-must-be-declared
        assertString1(str)
        expectTypeOf(str).toEqualTypeOf<unknown>()
    })

    it('asserts constructed from assert need to be declared', () => {

        // @ts-expect-error assertions-must-be-declared
        assert(Foo)(foo)
        expectTypeOf(foo).toEqualTypeOf<unknown>()

    })

    it('assert transitions are not typesafe', () => {

        void is.string.assert(str)
        expectTypeOf(str).toEqualTypeOf<unknown>()
    })

    it('assert methods can retain their type safety by being explicitly declared', () => {

        for (const schema of [assert.string, assert(is.string)]) {
            const assertString: AssertMethod<string> = schema
            assertString(str)
            expectTypeOf(str).toEqualTypeOf<string>()
        }

        const assertFoo: AssertMethod<Foo> = assert(Foo)
        assertFoo(foo)
        expectTypeOf(foo).toEqualTypeOf<Foo>()
    })

})