import { createCallableClass } from './class'
import { toNil } from '../types/nil'

import { expectTypeOf } from 'expect-type'

/* eslint-disable 
    @typescript-eslint/explicit-function-return-type
*/

const Vector = createCallableClass(
    function magnitude () {
        return Math.sqrt(this.x ** 2 + this.y ** 2)
    },
    class Vector {
        constructor(public x: number, public y: number) {}
    }
)

it('extends a class to have a call signature', () => {

    const vector = new Vector(0,10)

    expect(vector.x).toBe(0)
    expect(vector.y).toBe(10)
    expect(vector()).toBe(10)
})

it('call method keeps sync \'this\' context', () => {

    const vector = new Vector(10, 0)
    expect(vector()).toBe(10)

    vector.x = 5 

    expect(vector.x).toBe(5)
    expect(vector()).toBe(5)
})

it('call signature does not need \'this\' context', () => {
    const Path = createCallableClass(
        () => '/' as const,
        class Path {
            constructor(readonly path: `/${string}`) {}
        }
    ) 

    const path = new Path('/hey')
    expect(path()).toEqual('/')
})

it('retains static properties', () => {

    const Planet = createCallableClass(
        function () {
            return this.mass
        },
        class _Planet {

            static shape = 'round'
            
            static create(mass: number) {
                return new Planet(mass)
            }
            
            constructor(readonly mass: number) {}
        },
        'Planet'
    )

    expect(Planet.shape).toEqual('round')

    const planet1 = new Planet(1000)
    const planet2 = Planet.create(1000)

    expectTypeOf(planet1).toEqualTypeOf(planet2)
    expect(planet1()).toEqual(planet2())
    expect(planet1.mass).toEqual(planet2.mass)
})

it('supports getters/setters', () => {

    const Word = createCallableClass(
        function () {
            return this.quiet
        },
        class {
            constructor(public quiet: string) {}

            get loud(): string {
                return `${this.quiet}!`
            }

            set loud(value: string) {
                this.quiet = value.replace('!', '')
            }
        }
    )

    const word = new Word('bar')
    expect(word.loud).toEqual('bar!')

    word.loud = 'yo!'
    expect(word.loud).toEqual('yo!')
    expect(word.quiet).toEqual('yo')
})

it('instanceof', () => {
    const v2 = new Vector(1,1)
    expect(v2).toBeInstanceOf(Vector)

    // making sure other values don't break the Symbol.hasInstance method
    for (const notInstance of [undefined, null, {}, toNil, class{}]) {
        expect(() => notInstance instanceof Vector).not.toThrow(Vector)
        expect(notInstance).not.toBeInstanceOf(Vector)
    }

    // In case someone is a smartass
    const InstanceTroll = createCallableClass(
        toNil,
        class Troll {
            
            nestedInstance: unknown
            constructor() {
                this.nestedInstance = this 
            }
            getNestedInstance () {
                return this.nestedInstance
            }
        }
    )

    const instance = new InstanceTroll().getNestedInstance()
    expect(instance).toBeInstanceOf(InstanceTroll)
})

it('handles property definition conflicts', () => {

    const TrafficLight = createCallableClass(
        function () {
            return this.light
        },
        class {

            getLight() {
                return this.light
            }

            constructor(readonly light: 'red' | 'green' | 'yellow') {
                this.getLight = this.getLight.bind(this)
            }
        }
    )

    const { getLight } = new TrafficLight('red')
    expect(getLight()).toEqual('red')
})

it('does not alter input method', () => {

    const foo = () => 'bar'

    const Foo = createCallableClass(foo, class {
        bar = 0 
    })

    const foo2 = new Foo()

    expect(foo2).not.toEqual(foo)
    expect(foo2.name).toEqual(foo.name)

    expect(foo).not.toHaveProperty('bar')
})

it('can be extended', () => {

    interface Repeater {
        (times: number): string
        value: string 
    }

    interface RepeaterConstructor {
        create(value: string): Repeater
        new (value: string): Repeater
    }

    const Repeater: RepeaterConstructor = createCallableClass(
        function (count: number) {
            return this.value.repeat(count)
        },
        class {
            static create(value: string) {
                return new Repeater(value)
            }
            constructor(readonly value: string) {}
        }
    )

    const repeater = new Repeater('hey')
    expect(repeater(2)).toEqual('hey'.repeat(2))
    
    expect(Repeater.create('fool')(3)).toEqual('fool'.repeat(3))

    class X2Repeater extends Repeater {
        constructor(value: string) {
            super(value.repeat(2))
        }
    }

    const x2Repeater = new X2Repeater('holy')
    expect(x2Repeater(2)).toEqual('holy'.repeat(4))

})

describe('name option', () => {

    it('determines the name of the class', () => {

        const Greeter = createCallableClass(
            function () {
                return this.greeting
            },
            class {
                constructor(readonly greeting: string) {}
            },
            'Greeter'
        )

        expect(Greeter.name).toBe('Greeter')
    })

    it('appends "Callable" as a default', () => {
        const Foo = createCallableClass(
            () => 'foo',
            class Foo {}
        )
        expect(Foo.name).toBe('CallableFoo')
    })

    it('uses "Callable" on anonymous classes', () => {
        const Bar = createCallableClass(
            () => 'bar',
            class {}
        )
        expect(Bar.name).toBe('Callable')
    })

})