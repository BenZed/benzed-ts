import { isBoolean, isNumber, isString, pass, swap } from '@benzed/util'
import { ValidatorPipe } from './validator-pipe'

import { testValidator } from '../util.test'

//// Tests ////

testValidator(
    new ValidatorPipe({ isValid: isBoolean }).asserts(i => i, 'Must be true'),

    'add assertions',

    { input: true, output: true },
    { input: false, error: 'ust be true'}
)

testValidator(
    new ValidatorPipe<{ foo: string }>({ 
        isValid(i: { foo: string }) {
            return i.foo.length > 0
        },
        error: 'Foo must not be empty'
    }).transforms(i => i.foo === 'foo' ? { ...i, foo: 'bar' } : i, 'must not equal "foo" '),

    'add transforms',

    { input: { foo: '' }, error: 'ust not be empty' },
    { input: { foo: 'bar' }, output: { foo: 'bar' } },
    { input: { foo: 'foo' }, output: { foo: 'bar' } },
    { input: { foo: 'foo' }, error: 'must not equal "foo"', transform: false }
)

testValidator(
    new ValidatorPipe({ isValid: isString })
        .validates({ 
            transform(input: string) {
                return input.toLowerCase()
            },
            error: 'Must be lower case.'
        }),

    'add validators',

    { input: 'Foo', output: 'foo' },
    { input: 'Foo', error: 'ust be lower case.', transform: false },
)

//// With Ids ////

const $$integer = Symbol('integer')
const $$finite = Symbol('finite')
const $$axis = Symbol('axis')

const withIds = new ValidatorPipe({ isValid: isNumber })
    .transforms(Math.round, 'Must be an integer', $$integer)
    .asserts(Number.isFinite, 'Must be finite', $$finite)
    .validates({
        transform: i => Math.max(i, 0),
        error: 'Must be positive',
        id: $$axis
    })

testValidator(
    withIds,
    'with-ids',
    { input: -5, output: 0 },
    { input: 3.5, output: 4 },
    { input: -5, error: 'Must be positive', transform: false },
    { input: 3.5, error: 'Must be an integer', transform: false },
    { input: Infinity, error: 'Must be finite' }
)

const swapped = withIds
    .transforms(Math.floor, 'Must be an integer', $$integer)
    .transforms(i => Math.min(i, 0), 'Must be negative', $$axis)
    .asserts(pass, $$finite)

testValidator( 
    swapped,
    'swapped',
    { input: 5, output: 0 },
    { input: 5, error: 'Must be negative', transform: false },
    { input: -3.5, output: -4 },
    { input: -3.5, error: 'Must be an integer', transform: false },
    { input: -Infinity, output: -Infinity }
) 