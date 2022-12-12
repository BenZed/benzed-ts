import { copy } from '@benzed/immutable'

import { Module } from './module'
import { Modules } from './modules'

const _modules = [
    new Module(0),
    new Module(1),
    new Module(2)
]

const modules = new Modules(..._modules)

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
