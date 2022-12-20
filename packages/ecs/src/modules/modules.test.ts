import { copy } from '@benzed/immutable'

import { Module, ModuleArray } from '../module'
import { Modules } from './modules'

//// Setup ////

const _modules = [
    Module.data(0),
    Module.data(1),
    Module.data(2)
]

class GenericModules<M extends ModuleArray> extends Modules<M> {

    replace<Mx extends ModuleArray>(modules: Mx): GenericModules<Mx> {
        return new GenericModules(...modules)
    }

}

const modules = new GenericModules(..._modules)

//// Tests ////

it('throws if multiple instances of the same module exist in the parent', () => {
    const module = Module.data(0)
    expect(() => new GenericModules(module, module)).toThrow('Parent may only contain single reference of child')
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

test('children', () => {
    expect(modules.children).toEqual(modules.modules)
    expect([...modules.eachChild()]).toEqual(modules.modules)
})

test('descendents', () => {

    const modules = new GenericModules(
        new GenericModules(
            Module.data(0),
            Module.data(1)
        )
    )

    expect(modules.descendents).toEqual([modules.get(0), ...modules.get(0).modules])
    expect([...modules.eachDescendent()]).toEqual(modules.descendents)
    expect(modules.numDescendents).toEqual(modules.descendents.length)
})