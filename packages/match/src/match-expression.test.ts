import { MatchExpressionValueRequiredError } from './error'
import { match } from './match'

//// Setup ////

//// Tests ////

it.todo('create an expression for a value')

it.todo('create an expression for a set of values')

it('match() should throw an error', () => {
    expect(match)
        .toThrow(MatchExpressionValueRequiredError)
})