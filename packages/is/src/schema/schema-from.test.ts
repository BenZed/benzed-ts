import { schemaFrom } from './schema-from'

import { EnumSchema } from '../schemas'

import { expectTypeOf } from 'expect-type'

//// Signatures ////

test('enum signature', () => {
    const emotions = schemaFrom('happy', 'sad')

    expect(emotions).toBeInstanceOf(EnumSchema)
    expectTypeOf(emotions).toEqualTypeOf<EnumSchema<['happy', 'sad']>>()
})