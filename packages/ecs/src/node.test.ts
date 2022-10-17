import { createNode, defineNode, TargetOf, LinksOf } from './node'
import defineComponent, { Component, InputOf, OutputOf } from './component'

import match from '@benzed/match'

import { expectTypeOf } from 'expect-type'

/*** Lint ***/

/* eslint-disable 
    @typescript-eslint/no-non-null-assertion,
    @typescript-eslint/no-explicit-any
*/

/*** Setup ***/

const x2 = createNode(
    (i: number) => i * 2, 
    ctx => ctx.targets.at(0) ?? null
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
            ctx => ctx.targets.at(-1) ?? null
        )

        const x3 = createLastRefNode((i: number) => i * 3)

        expect(
            x3.transfer({ targets: [x2 as any], input: 0, output: 3, source: x3 })
        ).toEqual(x2)

        expectTypeOf<InputOf<typeof x3>>().toEqualTypeOf<number>()
        expectTypeOf<TargetOf<typeof x3>>().toEqualTypeOf<Component<unknown, unknown>>()
    })

    it('complex definitions', () => {

        type Operation = '+' | '-' | '*' | '/'
    
        interface CalcInput extends 
            Component<{value: [number, number], operation: Operation }, [number,number]> {
        }
        interface CalcOutput<O extends Operation = Operation> extends 
            Component<[number, number], number> {
            operation: O
        }

        const createCalcInputNode = defineNode<CalcInput, CalcOutput>(
            // no type errors!
            ctx => ctx.targets.find(target => target.operation === ctx.input.operation) ?? null
        )

        const calcInputNode = createCalcInputNode(i => i.value)

        const createCalcOutputComponent = <O extends Operation>(operation: O): CalcOutput<O> => 
            defineComponent<CalcOutput<O>>(
                settings => ([a,b]) => 
                    match(settings.operation as Operation)
                    ('*', a * b)
                    ('+', a + b)
                    ('-', a - b)
                    ('/', a / b).next() 
            )({ operation })

        const add = createCalcOutputComponent('+')
        const subtract = createCalcOutputComponent('-')
        const multiply = createCalcOutputComponent('*')
        const divide = createCalcOutputComponent('/')

        const next = calcInputNode.transfer({
            source: calcInputNode,
            targets: [add, subtract, multiply, divide],
            input: { value: [10, 10], operation: '*' },
            output: [10,10]
        })

        expect(next).toBe(multiply)
        
    })
    
})

describe('InputOf type', () => {

    it('gets input type of component', () => {
        expectTypeOf<InputOf<typeof x2>>().toEqualTypeOf<number>()
    })

})

describe('OutputOf type', () => {

    it('gets input type of component', () => {
        expectTypeOf<OutputOf<typeof x2>>().toEqualTypeOf<number>()
    })

})

describe('LinksOf type', () => {

    it('gets link type of component', () => {
        const x2l = x2
            .addLink('cool')
            .addLink('beans')

        expectTypeOf<LinksOf<typeof x2l>>().toEqualTypeOf<['cool', 'beans']>()
    })

})

describe('node.transfer() method', () => {

    it('returns one of a given set of refs or null', () => {
        expect(x2.transfer({ targets: [], input: 0, output: 3, source: x2 }))
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
