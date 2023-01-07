
import { isNil } from '@benzed/util'
import { ValidationError } from '../../validator'
import { ChainableSchema } from './chainable-schema'
import { Or } from './or'

//// Setup ////

class IsVoid extends ChainableSchema<void> {

    constructor() {
        super((i, ctx)=> isNil(i) ? ValidationError.throw({ ...ctx, input: i, transform: false, path: [] }, 'Must be void') : i)
    }
    
}

const isVoid = new IsVoid()

//// Tests ////

it('is abstact', () => {
    // @ts-expect-error abstract
    void new ChainableSchema()
})

it('has or method', () => {
    expect(isVoid.or).toBeInstanceOf(Or)
})

it.todo('has and method')