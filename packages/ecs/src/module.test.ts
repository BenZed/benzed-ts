import { $$copy, $$equals, copy, equals } from '@benzed/immutable'

import { Module } from './module'

import { describe, it, test, expect } from '@jest/globals'
import { Finder } from './find'
import { Node } from './node'
import { Modules } from './modules'

//// Setup ////

class Rank<S extends string> extends Module<S> {

    static of<Sx extends string>(rank: Sx): Rank<Sx> {
        return new Rank(rank)
    }

    getRank(): S {
        return this.state
    }

}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createFamilyTree = () => {
    
    const tree = Node.create(
        Node.create(
            Rank.of('uncle')
        ),
        Node.create(
            Rank.of('mom'),
            Node.create(
                Rank.of('brother'),
            ),
            Node.create(
                Rank.of('you'),
                Node.create(
                    Rank.of('son')
                ),
                Node.create(
                    Rank.of('daughter'),
                    Node.create(
                        Rank.of('grandson')
                    )
                )
            ),
            Node.create(
                Rank.of('sister'),
                Node.create(
                    Rank.of('neice'),
                ),
                Node.create(
                    Rank.of('nephew')
                )
            )
        ),
        Node.create(
            Rank.of('uncle')
        )
    )
    const you = tree.get(1).get(2)
    return [tree, you] as const
}
//// Tests ////

describe('relationships', () => {

    describe('.parent', () => {

        const child = Module.for('hey' as const)
        const parent = Node.create(child)
    
        it('gets module parent', () => {
            expect(parent.modules).toContain(child)
            expect(child.parent).toBe(parent)
        })

        it('throws if no parent', () => {
            expect(() => Module.for(0).parent).toThrow('does not have a parent')
        })
    
        describe('_setParent(parent?) @internal', () => {
    
            const parents: Module[] = [] 
    
            class ModuleSpy extends Module<number> {
                override _setParent(parent: Modules): this {
                    parents.push(parent)
                    return super._setParent(parent)
                }
            }
    
            const spy = new ModuleSpy(100)
            const modules = new Modules(spy)
    
            it('sets module parent', () => {
    
                expect(modules.modules).toContain(spy)
                expect(parents).toContain(modules)
            })
    
            it('throws if parent has already been set', () => {
                expect(() => spy._setParent(modules)).toThrow('Parent already set')
            })
    
            it('throws if parent does not contain module', () => {
                const liar = new Modules()
                expect(() => new ModuleSpy(0)._setParent(liar)).toThrow('Parent invalid')
            })
        })
    })

    describe('.siblings', () => {
        const [, you ] = createFamilyTree()

        it('contains all parent children except this node', () => {
            expect(you.siblings).toEqual(you.parent.children.filter(c => c !== you))
        })
        it('eachSibling() iterator', () => {
            expect([...you.eachSibling()]).toEqual(you.siblings)
        })
    })

    describe('.parents', () => {
        const [ , you ] = createFamilyTree()

        it('contains all direct descendents to root', () => {
            expect(you.parents).toEqual([you.parent, you.parent.parent])
        })

        it('eachParent() iterator', () => {
            expect([...you.eachParent()]).toEqual(you.parents)
        })
    })

    describe('.ancestors', () => {
        const [ ,you ] = createFamilyTree()

        it('contains all ancestors up to root', () => {
            expect(you.ancestors).toEqual([ you.parent, ...you.parent.siblings, you.parent.parent ])
        })

        it('eachAncestor() iterator', () => {
            expect([...you.eachAncestor()]).toEqual(you.ancestors)
        })
    })

    describe('.root', () => {
        const [ tree, you ] = createFamilyTree()

        it('contains root node', () => {
            expect(you.root).toEqual(tree)
        })

        it('defaults to self if unparented', () => {
            expect(tree.root).toEqual(tree)
        })
    })

})

test('.find', () => {

    const [, you] = createFamilyTree()

    const find = you.find
    expect(find).toBeInstanceOf(Finder)

    const mom = you.find.inSiblings(Rank.of('mom'))
    expect(mom).toEqual(you.siblings[0])

})

test('.has', () => {
    const [, you] = createFamilyTree()
    expect(you.has).toBeInstanceOf(Finder)

    expect(you.has(Node.create(
        Rank.of('son')
    ))).toBe(true)
})

test('.assert', () => {

    const [ , you ] = createFamilyTree()

    expect(you.assert()).toBeInstanceOf(Finder)
    expect(() => you.assert(Rank.of('none'))).toThrow('Could not find')
    expect(() => you
        .assert('Rank<"steve"> is required!')
        .inChildren(
            Rank.of('steve')
        )
    ).toThrow('Rank<"steve"> is required!')
})

describe('CopyComparable', () => {
    test('@benzed/immutable copy()', () => {

        const m1 = Module.for({ foo: 'bar' })

        const m2 = copy(m1)

        expect(m2).not.toBe(m1)
        expect(m2).toBeInstanceOf(Module)
        expect(equals(m1.state, m2.state)).toBe(true)
    })

    test('@benzed/immutable equals()', () => {

        const m1 = Module.for({ id: 1 })
        const m2 = Module.for({ id: 2 })

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
        void new Modules(test)

        expect(called).toBe(true)
    })

})