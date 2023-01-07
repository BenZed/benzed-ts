import { schemaFrom } from './schema-from'

import { IsEnum } from './schemas'

import { expectTypeOf } from 'expect-type'

//// Signatures ////

test('enum signature', () => {
    const emotions = schemaFrom('happy', 'sad')

    expect(emotions).toBeInstanceOf(IsEnum)
    expectTypeOf(emotions).toEqualTypeOf<IsEnum<['happy', 'sad']>>()
})