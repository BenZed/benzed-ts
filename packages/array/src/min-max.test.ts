import { min, max } from './min-max'

class Role {

    constructor(
        public name: string,
        public worth: number
    ) { }

    valueOf(): number {
        return this.worth
    }
}

const admin = new Role('admin', 3)
const producer = new Role('producer', 2)
const staff = new Role('staff', 1)
const freelance = new Role('freelance', 0)

for (const boundary of [max, min]) {

    const isMax = boundary === max

    describe(boundary.name + '(...params)', () => {

        it(`returns the ${isMax ? 'highest' : 'lowest'} value`, () => {
            const value = boundary(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
            expect(value).toEqual(isMax ? 10 : 1)
        })

        it('throws if no arguments are provided', () => {
            expect(() => boundary()).toThrow('At least one argument must be provided.')
        })

        it('works on objects implementing valueOf', () => {
            expect(boundary(admin, producer, staff, freelance))
                .toEqual(isMax ? admin : freelance)
        })
    })
}