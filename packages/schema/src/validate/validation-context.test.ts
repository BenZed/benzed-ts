import { ValidationContext } from './validation-context'

import { it } from '@jest/globals'

//// Tests ////

it('transform is true by default', () => {
    const context = new ValidationContext(10)
    expect(context.transform).toBe(true)
})
