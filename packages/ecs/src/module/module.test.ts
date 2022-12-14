import { $$copy, $$equals, copy, equals } from '@benzed/immutable'
import { isBoolean, isDefined } from '@benzed/util'

import { Module } from './module'
import Modules from './modules'

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
            _setParent(parent: Module): void {
                parents.push(parent)
                super._setParent(parent)
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

describe('find', () => { 

    class Zero extends Module<0> {
        constructor() {
            super(0)
        }
    }

    class Four extends Module<4> {
        constructor() {
            super(4)
        }
    }

    class Missing extends Module<(-1)> {
        constructor(){
            super(-1)
        }
    }

    const heirarchy = new Modules(
        new Zero(),
        new Modules(
            new Module(1 as const),
            new Modules(
                new Module(2 as const),
                new Module(5 as const),
                new Modules(
                    new Module(3 as const),
                    new Modules(
                        new Four()
                    )
                )
            )
        )
    )

    const index = heirarchy.modules[1].modules[1].modules[0]
    void index

    for (const scope of ['siblings', 'children', 'parents', undefined] as const) {
        for (const type of ['instance', 'constructor', 'typegard', undefined] as const) {
            for (const required of [true, false, undefined]) {

                const elements = [type, scope && `${scope}`, required].filter(isDefined)
                const isValidSignature = elements.length > 0 && !isBoolean(elements[0])
                if (!isValidSignature)
                    continue   

                test(`.find(${[type, scope && `${scope}`, required].filter(isDefined)})`, () => {

                    const _required = required ? 1 : 0
                    const _scope = scope ?? 'siblings'
                    
                    const needle = type === 'instance'
                        ? {
                            siblings: required ? index.siblings[0] : new Missing(),
                            children: required ? index.parent?.modules.at(-1)?.modules[0] : new Missing(),
                            parents: required ? index.parent?.siblings[0] : new Missing()
                        }[_scope]
                        : type === 'constructor'
                            ? {
                                siblings: required ? Modules : Missing,
                                children: required ? Four : Missing,
                                parents: required ? Zero : Missing
                            }[_scope]
                            : {
                                siblings: (m: Module) => m.state === (required ? 5 : -1),
                                children: (m: Module) => m.state === (required ? 3 : -1),
                                parents: (m: Module) => m.state === (required ? 1 : -1)
                            }[_scope]

                    const args = [needle, scope, required].filter(isDefined)

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const result = (index as { find(...args: any[]): Module[]}).find(...args)
                    expect(result).toHaveLength(_required) 
                })
            }
        }
    }

    it('required can be number or boolean', () => {
        expect(() => index.find('parents', 6)).toThrow('in required amount (6)')
    })

    it('required number must be positive integer', () => {
        expect(() => index.find('siblings', 1.25)).toThrow('must be a positive integer')
        expect(() => index.find('siblings', -1)).toThrow('must be a positive integer')
    })

    it('find children of children edge case', () => {

        const results = index.parent?.find(Modules, 'children') ?? []
        expect(results).toHaveLength(2)
        expect(results).toEqual([index.siblings.at(-1), index.siblings.at(-1)?.modules.at(-1)])
    })

    test('.has(type, scope?)', () => {

        expect(index.has(Zero, 'children')).toBe(false)
        expect(index.has(Zero, 'parents')).toBe(true)

        const isOne = (input: Module): input is Module<1> => input.state === 1
        expect(index.has(isOne, 'parents')).toBe(true)
        expect(index.has(isOne, 'children')).toBe(false)
        
        expect(index.has(new Four(), 'parents')).toBe(false)
        expect(index.has(new Four(), 'children')).toBe(true)

    })

    test('.assert(type, scope?)', () => {

        expect(() => index.assert(Zero, 'parents')).not.toThrow()
        expect(() => index.assert(Zero, 'children')).toThrow('Could not find')

        const isThree = (input: Module): input is Module<1> => input.state === 3
        expect(() => index.assert(isThree, 'parents')).toThrow('Could not find')
        expect(() => index.assert(isThree, 'children')).not.toThrow()
        
        expect(() => index.assert(new Four(), 'children')).not.toThrow()
        expect(() => index.assert(new Four(), 'parents')).toThrow('Could not find')
    })

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