import { MatchExpressionValueRequiredError } from './error'
import { match } from './match'

//// Setup ////

//// Tests ////

it('create an expression for a value', () => {

    const [ one ] = match(1)
        .case(1, 'One')

})

it.todo('create an expression for a set of values')

it('match() should throw an error', () => {
    expect(match)
        .toThrow(MatchExpressionValueRequiredError)
})