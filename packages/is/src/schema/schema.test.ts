import { schema } from './schema'

const isString = (i: unknown): i is string => typeof i === 'string'

it('creates a schema', () => {

    const $string = schema(isString, 'Must be a string')
        .transforms(i => i.toLowerCase(), 'Must be lowercase')

    expect($string('ace')).toEqual('ace')
    expect(() => $string(100)).toThrow('Must be a string')
    expect(() => $string.assert('Ace')).toThrow('Must be lowercase')
})