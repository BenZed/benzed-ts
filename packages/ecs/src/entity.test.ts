import Module from './component'
import Node, { Entity } from './entity'

it(`is sealed`, () => {
    // @ts-expect-error Sealed
    void class extends Entity<[]> {}
})
