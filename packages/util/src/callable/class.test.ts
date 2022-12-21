import { createCallableClass } from './class'
import { toNil } from '../types/nil'

import { expectTypeOf } from 'expect-type'

import { it, describe, expect } from '@jest/globals'
import { get$$Callable } from './object'
import property from '../property'
import { Func, isFunc } from '../types'

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

it('gets all properties on prototype chain', () => {

    class Count {
        constructor(public count: number) {}

        get x2(){
            return this.count * 2
        }
    }

    const Count2 = createCallableClass(function increment () {
        return this.count++
    }, Count, 'Count2@')
    const count2 = new Count2(1)
    expect(count2.x2).toEqual(2)
    expect(count2.constructor).toBe(Count2)

    // @ts-expect-error It's fine
    class Count3 extends Count2 {
        get x3() {
            return this.count * 3
        }
    }
    const count3 = new Count3(1)
    expect(count3.x2).toEqual(2)
    expect(count3.x3).toEqual(3)
    expect(count3.constructor).toBe(Count3)

    class Count4 extends Count3 {
        get x4() {
            return this.count * 4
        }
    }

    const count4 = new Count4(1)

    expect(count4.x2).toEqual(2)
    expect(count4.x4).toEqual(4)
    expect(count4.x3).toEqual(3)
    expect(count4.constructor).toBe(Count4)
})

describe('instanceof', () => {

    it('is instanceof created class', () => {
        const v2 = new Vector(1,1)
        expect(v2).toBeInstanceOf(Vector)
    
        // making sure other values don't break the Symbol.hasInstance method
        for (const notInstance of [undefined, null, {}, toNil, class{}]) {
            expect(() => notInstance instanceof Vector).not.toThrow(Vector)
            expect(notInstance).not.toBeInstanceOf(Vector)
        }
    })

    it.only('is not an instance of extended classes', () => {

        class Base {}

        class Extension extends Base {}

        const Callable = createCallableClass(
            () => '',
            Extension,
        )

        console.log(...property.prototypesOf(Callable), Callable)

        expect(new Extension() instanceof Callable).toBe(false)
        
        // @ts-expect-error it's fine
        class CallableII extends Callable {}
        class CallableIII extends CallableII {}

        for (const Callable$ of [CallableII, CallableIII]) {
            expect(new Callable() instanceof Callable$).toBe(false)
            expect(new Callable$() instanceof Callable).toBe(true)
            expect(new Extension() instanceof Callable$).toBe(false)
            expect(new Extension() instanceof Base).toBe(true)
            expect(new Callable$() instanceof Base).toBe(true)
        }

    })

    it('in case someone is being a smartass', () => {
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
    expect(foo.name).toEqual('foo')

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
        },
        'Repeater'
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

it('extends with function argument', () => {

    interface Speak {
        (input: string): string
        speak(input: string): string
    }

    interface SpeakConstructor {
        new (speak: (input: string) => string): Speak
    }

    const Speak: SpeakConstructor = createCallableClass(function (input: string) {
        return this.speak(input)
    }, class {
        constructor(
            readonly speak: (input: string) => string
        ) {}
    })

    const speak = new Speak(i => i.trim().replace(/\.$/, '') + '.')
    expect(speak('Hi')).toEqual('Hi.')

    class Shout extends Speak {
        static from () {
            return new Shout()
        }
        constructor() {
            super(i => i + '!')
        }
    }

    expect(Shout.from).toBeInstanceOf(Function)

    const shout = new Shout()
    expect(shout('Hey')).toEqual('Hey!')

    expect(Shout.from).toBeInstanceOf(Function)

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

    it('does not overwrite name of instnace', () => {

        const Foo = createCallableClass(
            () => 'foo',
            class {
                get name () {
                    return this._name
                }
                constructor(private readonly _name: string) {}
            },
            'Foo'
        )

        const foo = new Foo('ace')
        expect(foo.name).toEqual('ace')
    })
})
