import { match } from './match'

//// Setup ////

//// Tests ////

it('match() should throw an error', () => {
    expect(() => match())
        .toThrow('match expression requires at least one value')
})

it.todo('create an iterable match for a value')

it.todo('create an iterable match for a set of values')

