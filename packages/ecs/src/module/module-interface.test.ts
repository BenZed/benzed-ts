import { Module } from './module'
import { Node } from '../node'
import { ModuleInterface } from './module-interface'

import { expectTypeOf } from 'expect-type'

//// Setup ////

class Foo extends Module<void> {
    toBar(): Bar {
        return new Bar
    }
}

class Bar extends Module<void> {
    toFoo(): Foo {
        return new Foo
    }
}

const node = Node.Builder.create(
    Module.data(1 as const), 
    Module.data('string' as const), 
    new Foo
)

//// Tests ////

it('is on node', () => {
    expect(node.module).toBeInstanceOf(ModuleInterface)
})

it('aggregates module methods', () => {
    expect(node.module.getData()).toEqual(node.modules[0].getData())
})

it('first come, first serve', () => {
    expectTypeOf(node.module.getData).toEqualTypeOf<() => 1>()
})

it('methods that return modules replace the provided module array', () => {
    const nodeToBar = node.setModules(...node.module.toBar())
    expect(nodeToBar.modules).toEqual([
        Module.data(1), 
        Module.data('string'), 
        new Bar
    ])
})

it('includes AssertModule call signature', () => {
    const foo = node.module(Foo)
    expect(foo).toBeInstanceOf(Foo)
    expectTypeOf(foo).toEqualTypeOf(Foo.prototype)
})

it('includes getModule index siganture', () => {
    const foo = node.module(2)
    expect(foo).toBeInstanceOf(Foo)
    expectTypeOf(foo).toEqualTypeOf(Foo.prototype)
})