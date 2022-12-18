import { $$copy, $$equals, copy, equals } from '@benzed/immutable'

import { Module } from './module'
import { Modules } from './modules'

import { describe, it, test, expect } from '@jest/globals'
import { Finder } from './find'

describe('parent', () => {

    const m1 = new Module(0)
    const ms = new Modules(m1)

    it('gets module parent', () => {
        expect(ms.modules).toContain(m1)
        expect(m1.parent).toBe(ms)
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

const children = [
    new Module(0),
    new Module(1),
    new Module(2)
]

const parent = new Modules(...children)

test('.modules', () => {
    expect(children).toEqual(parent.modules)
})

test('.siblings', () => {
    const child = parent.modules[0]
    expect(child.siblings).not.toContain(child)
    expect(child.siblings).toEqual(parent.modules.slice(1))
})

test('.root', () => {
    const child = parent.modules[0]
    const grandParent = new Modules(parent)
    expect(grandParent.root).toBe(grandParent)
    expect(parent.root).toEqual(grandParent)
    expect(child.root).toEqual(grandParent)
})

test('.find', () => {
    const find = parent.find
    expect(find).toBeInstanceOf(Finder)

    const zero = parent.find(new Module(0))
    expect(zero).toEqual(new Module(0))
})

test('.has', () => {
    const has = parent.has
    expect(has).toBeInstanceOf(Finder)

    expect(parent.has(new Module(2))).toBe(true)
})

test('.assert', () => {
    expect(parent.assert()).toBeInstanceOf(Finder)
    expect(() => parent.assert(new Module(4))).toThrow('Could not find')
    expect(() => parent.assert('Module<4> is required!').inChildren(new Module(4))).toThrow('Module<4> is required!')
})

describe('CopyComparable', () => {
    test('@benzed/immutable copy()', () => {

        const m1 = new Module({ foo: 'bar' })

        const m2 = copy(m1)

        expect(m2).not.toBe(m1)
        expect(m2).toBeInstanceOf(Module)
        expect(equals(m1.state, m2.state)).toBe(true)
    })

    test('@benzed/immutable equals()', () => {

        const m1 = new Module({ id: 1 })
        const m2 = new Module({ id: 2 })

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