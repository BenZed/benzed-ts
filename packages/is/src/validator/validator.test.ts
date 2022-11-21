import { schema } from './validator'

it('creates a validator', () => {

    const string = schema()
        .asserts((i: unknown): i is string => typeof i === 'string')
        .transforms(i => i.toLowerCase())

    expect(string('ace')).toEqual('ace')
    expect(() => string(100)).toThrow('Validation failed.')

})