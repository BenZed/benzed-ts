import { override } from './override'

const Numbers = {
    zero() {
        return 0
    },
    asyncZero() {
        return Promise.resolve(0)
    }
}

it('allows a method on an object to be temporarily overridden', () => {

    const doWhileOverridden = override(Numbers, 'zero', original => original() + 1)

    const result = doWhileOverridden(() => Numbers.zero())
    expect(result).toBe(1)

    // no longer overridden
    expect(Numbers.zero()).toEqual(0)
})

it('handles promises', async () => {

    const doWhileOverridden = override(Numbers, 'asyncZero', async (original) => {
        const zero = await original()
        return zero + 1
    })

    const result = await doWhileOverridden(() => Numbers.asyncZero())
    expect(result).toBe(1)

})
