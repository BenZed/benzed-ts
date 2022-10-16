import { createNode, defineNode, RefOf, LinksOf } from './node'
import { Entity, InputOf, OutputOf } from './entity'

import { expectTypeOf } from 'expect-type'

/*** Lint ***/

/* eslint-disable 
    @typescript-eslint/no-non-null-assertion,
    @typescript-eslint/no-explicit-any
*/

/*** Setup ***/

const x2 = createNode(
    (i: number) => i * 2, 
    refs => refs.at(0) ?? null
)

/*** Tests ***/

describe('createNode() method', () => {
    
    it('creates nodes', () => {
        expect(x2).toBeInstanceOf(Function)
        expect(x2.transfer).toBeInstanceOf(Function)
        expect(x2.links).toHaveLength(0)
    })

})

describe('defineNode() method', () => {
  
    it('returns a node create method with a predefined transfer', () => {

        const createLastRefNode = defineNode(
            refs => refs.at(-1) ?? null
        )

        const x3 = createLastRefNode((i: number) => i * 3)

        expect(x3.transfer([x2], 3, 9)).toEqual(x2)
        expectTypeOf<InputOf<typeof x3>>().toEqualTypeOf<number>()
        expectTypeOf<RefOf<typeof x3>>().toEqualTypeOf<Entity<any, any>>()
    })

    it.todo('input, entity signature')

    it.todo('input, output, entity signature')
    
})

describe('InputOf type', () => {

    it('gets input type of entity', () => {
        expectTypeOf<InputOf<typeof x2>>().toEqualTypeOf<number>()
    })

})

describe('OutputOf type', () => {

    it('gets input type of entity', () => {
        expectTypeOf<OutputOf<typeof x2>>().toEqualTypeOf<number>()
    })

})

describe('LinksOf type', () => {

    it('gets link type of entity', () => {
        const x2l = x2
            .addLink('cool')
            .addLink('beans')

        expectTypeOf<LinksOf<typeof x2l>>().toEqualTypeOf<['cool', 'beans']>()
    })

})

describe('node.transfer() method', () => {

    it('returns one of a given set of refs or null', () => {
        expect(x2.transfer([], 0, 0))
            .toEqual(null)
    })

})

describe('node.addLink() method', () => {

    const x2l = x2.addLink('ace')

    it('adds link to node', () => {
        expect(x2l.links).toEqual(['ace'])
    })

    it('is an immutable copy', () => {
        expect(x2l).not.toEqual(x2)
        expect(x2.links).toEqual([])
    })

})
