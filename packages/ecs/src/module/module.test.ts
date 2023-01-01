import { $$copy, $$equals, copy, equals } from '@benzed/immutable'
import { describe, it, test, expect } from '@jest/globals'

import { ModuleFinder } from './module-finder'
import { Module } from './module'
import { Node } from '../node'

//// Setup ////

class Rank<S extends string> extends Module<S> {  

    static of<Sx extends string>(rank: Sx): Rank<Sx> {
        return new Rank(rank)
    }

    getRank(): S {
        return this.data
    }

}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createFamilyTreeWithModules = () => {

    const uncle = Node.Builder.create(Rank.of('uncle'))

    const son = Node.Builder.create(
        Rank.of('son')
    )

    const you = Node.Builder.create(
        {
            son
        },
        Rank.of('you'),
    )

    const neice = Node.Builder.create(Rank.of('neice'))
    const nephew = Node.Builder.create(Rank.of('nephew'))

    const sister = Node.Builder.create({
        neice,
        nephew
    }, 
    Rank.of('sister'))

    const mom = Node.Builder.create(
        {
            you,
            sister
        },
        Rank.of('mom')
    )

    const tree = Node.Builder.create({
        uncle,
        mom
    })

    return [tree, tree.getNode('mom').getNode('you')] as const
}

//// Tests ////

describe('relationships', () => {

    describe('.parent', () => {

        const module = Module.data('hey' as const)
        const node = Node.Builder.create(module)
    
        it('gets module parent', () => {
            expect(node.modules).toContain(module)
            expect(module.node).toBe(node)
        })

        it('throws if no parent', () => {
            expect(() => Module.data(0).node).toThrow('does not have a node')
        })
    
        describe('_setParent(parent?) @internal', () => {
    
            const parents: Node[] = [] 
    
            class ModuleSpy extends Module<number> {
                override _setNode(node: Node): void {
                    parents.push(node)
                    super._setNode(node)
                }
            }
    
            const spy = new ModuleSpy(100)
            const node = Node.Builder.create(spy)
    
            it('sets module parent', () => {
    
                expect(node.modules).toContain(spy)
                expect(parents).toContain(node)
            })
    
            it('throws if parent has already been set', () => {
                expect(() => spy._setNode(node)).toThrow('already has a node')
            })
    
            it('throws if parent does not contain module', () => {
                const liar = Node.Builder.create()
                expect(() => new ModuleSpy(0)._setNode(liar)).toThrow('is not included in Node\'s modules')
            })
        })
    })

    describe('.parents', () => {
        const [ , you ] = createFamilyTreeWithModules()

        it('contains all direct descendents to root', () => {
            expect(you.parents).toEqual([you.parent, you.parent.parent])
        })

        it('eachParent() iterator', () => {
            expect([...you.eachParent()]).toEqual(you.parents)
        })
        it('numParents', () => {
            expect(you.numParents).toEqual(you.parents.length)
        })
    })

    describe('.ancestors', () => {
        const [ ,you ] = createFamilyTreeWithModules()

        it('contains all ancestors up to root', () => {
            const ancestors = [ ...you.parent.parent.children, you.parent.parent ]

            expect(you.ancestors).toHaveLength(ancestors.length)
            expect(you.ancestors.every(a => ancestors.includes(a))).toBe(true)
        })

        it('eachAncestor() iterator', () => {
            expect([...you.eachAncestor()]).toEqual(you.ancestors)
        })
        it('numAncestors', () => {
            expect(you.numAncestors).toEqual(you.ancestors.length)
        })
    })

    describe('.root', () => {
        const [ tree, you ] = createFamilyTreeWithModules()

        it('contains root node', () => {
            expect(you.root).toEqual(tree)
        })

        it('defaults to self if unparented', () => {
            expect(tree.root).toEqual(tree)
        })
    })
})

test('.find', () => {

    const [, you] = createFamilyTreeWithModules()

    const find = you.findModule
    expect(find).toBeInstanceOf(ModuleFinder)

    const mom = you.findModule.inAncestors(Rank.of('mom'))
    expect(mom).toEqual(you.parent.modules[0])
})

test('.has', () => {
    const [, you] = createFamilyTreeWithModules()
    expect(you.hasModule).toBeInstanceOf(ModuleFinder)

    expect(you.hasModule.inChildren(Rank.of('son'))).toBe(true)
})

test('.assert', () => {

    const [ , you ] = createFamilyTreeWithModules()

    expect(you.assertModule).toBeInstanceOf(ModuleFinder)
    expect(() => you.assertModule(Rank.of('none'))).toThrow('Could not find')
    expect(() => you
        .assertModule
        .inChildren(
            Rank.of('steve'), 
            'Rank<"steve"> is required!'
        )
    ).toThrow('Rank<"steve"> is required!')
})

describe('CopyComparable', () => {
    test('@benzed/immutable copy()', () => {

        const m1 = Module.data({ foo: 'bar' })

        const m2 = copy(m1)

        expect(m2).not.toBe(m1)
        expect(m2).toBeInstanceOf(Module)
        expect(equals(m1.data, m2.data)).toBe(true)
    })

    test('@benzed/immutable equals()', () => {

        const m1 = Module.data({ id: 1 })
        const m2 = Module.data({ id: 2 })

        expect(equals(m1, m2)).toBe(false)
        expect(equals(m1, copy(m1))).toBe(true)

        expect(equals(m2, m2[$$copy]())).toBe(true)
        expect(m2[$$equals](m2[$$copy]())).toBe(true)
        
        expect(m2[$$equals](m1)).toBe(false)
        expect(m2[$$equals](m1[$$copy]())).toBe(false)
    })
})

describe('validate()', () => {
    it('is called on parent', () => {
        let called = false 

        class ValidateTest extends Module<void> {
            override validate(): void {
                called = true
            }
        }

        const test = new ValidateTest()
        void Node.Builder.create(test)

        expect(called).toBe(true)
    })
})
