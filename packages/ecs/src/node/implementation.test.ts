import { Node } from './implementation'
import { Module } from '../module'
import { expectTypeOf } from 'expect-type'

import { describe, it, expect } from '@jest/globals'

describe('Node interface is described by it\'s modules', () => {

    class Foo extends Module {

        getState(): string {
            return 'bar'    
        }

        setState(state: string): void {
            void state
        }

    }

    class Bar extends Module {

        state = 100

        getState(): number {
            return this.state
        }

        setState(state: number): void {
            this.state = state
        }

        get countX2(): number {
            return this.state * 2
        }

        protected _getCountX2(): number {
            return this.countX2
        }
    }

    class Generic<T> extends Module {

        constructor(readonly state: T) {
            super()
        }

        getState(): T {
            return this.state
        }

    }

    const foo = Node.create(new Foo())
    const foobar = Node.create(new Foo(), new Bar())
    // const barfoo = Node.create(new Bar(), new Foo())
    const bar = Node.create(new Bar())

    it('inherits methods', () => {
        expect(foo.getState()).toEqual('bar')
    })

    it('first defined properties take precedence', () => {
        expect(foobar.getState()).toEqual('bar')

        foobar.setState('bar')
        // @ts-expect-error Should not be a call signature
        foobar.setState(100)
    })

    it('does not inherit private properties', () => {
        // @ts-expect-error Should not be accessible
        expect(() => bar._getDoubleCount())
            .toThrow('_getDoubleCount is not a function')
    })

    it('only inherits methods', () => {
        const getter: keyof Bar = 'countX2'
        expect(getter in bar).toEqual(false)
        expect(bar[getter]).toBe(undefined)

        const value: keyof Bar = 'state'
        expect(value in bar).toEqual(false)
        expect(bar[value]).toBe(undefined)
    })

    it('correct <this> context', () => {
        expect(bar.getState()).toBe(100)
    })

    it('works with generics', () => {
        const node = Node.create(new Generic(true))
        const state = node.getState()
        expect(state).toBe(true)
        expectTypeOf(state).toMatchTypeOf<boolean>()
    })

})