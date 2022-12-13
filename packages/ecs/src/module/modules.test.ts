import { copy } from '@benzed/immutable'

import { Module } from './module'
import { Modules } from './modules'

//// Setup ////

const _modules = [
    new Module(0),
    new Module(1),
    new Module(2)
]

const modules = new Modules(..._modules)

//// Tests ////

it('throws if multiple instances of the same module exist in the parent', () => {
    const module = new Module(0)
    expect(() => new Modules(module, module)).toThrow('Parent may only contain single reference of child')
})

test('.modules', () => {
    expect(modules.modules.every((m, i) => m === _modules[i]))
        .toBe(true)
})

it('sets parent on constructed modules', () => {
    expect(modules.modules.every(m => m.parent === modules))
})

it('parent is preserved on copy', () => {
    const m2 = copy(modules)
    expect(m2.modules.every(m => !_modules.includes(m) && m.parent === m2))
        .toBe(true)
})

it('iterates modules', () => {
    expect([...modules]).toEqual(modules.modules)
})

describe('get()', () => {

    class Text<T extends string> extends Module<T> {

        get text(): T {
            return this.state
        }

        setText<Tx extends string>(text: Tx): Text<Tx> {
            return new Text(text)
        }

        getText(): T {
            return this.text
        }

    }  

    const n1 = new Modules(
        new Text('zero'),
        new Text('one'),
    )

    it('get node at index', () => {
        const [ zero, one ] = n1.modules
        expect(n1.get(0)).toEqual(zero)
        expect(n1.get(1)).toEqual(one)
    })

    it('throws if index out of bounds', () => {
        // @ts-expect-error invalid index
        expect(() => n1.get(2)).toThrow('Invalid index')
    })

})