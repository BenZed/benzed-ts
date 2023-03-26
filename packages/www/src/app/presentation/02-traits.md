# Dependencies and Theory

    <!-- @Prompt -->
    Before we get to the actual validation library itself, I'm going to take a little time to talk about theory and the dependencies that are the basis of the `is-ts` library, because they're used extensively throughout.

    <!-- @Prompt -->
    Not ALL of the dependencies, you can see quite a list there, but a couple of them.

    <!-- @Prompt -->
    The most fun I have programming is playing around with theory, experimenting with useful data structures, or making my own implementations of them, and then burning it all down and starting from scratch. I've thrown out a lot more code than exists in all of my personal packages combined, and to me, that's part of the fun.

```json
{
    "name": "@benzed/is",
    "alias": "is-ts",
    "description": "Type guard/validation library.",
    "main": "./lib",
    "version": "3.1.3",
    "scripts": {
        "test": "jest --run-in-band --all",
        "test:dev": "jest --run-in-band --only-changed --verbose --watch",
        "lint": "eslint src/**/*.ts --fix",
        "build": "npm run lint && npm run tsc",
        "tsc": "shx rm -rf lib && mkdir lib && tsc"
    },
    "repository": {
        "type": "git",
        "url": "git+https://github.com/BenZed/benzed-ts.git"
    },
    "dependencies": {
        "@benzed/string": "^3.2.3",
        "@benzed/util": "^3.9.1",
        "@benzed/math": "^3.1.4",
        "@benzed/schema": "^0.3.0",
        "@benzed/signature-parser": "^1.0.0",
        "@benzed/traits": "^1.0.0",
        "@benzed/immutable": "^4.0.0",
        "@benzed/array": "^3.2.3"
    }
}
```

# Nominal vs Structural Types

    <!-- @Prompt -->
    While javascript and of course typescript are structural languages, a lot of meta programming in javascript is reasoned nominally.

```ts
abstract class Animal {
    abstract walk: string
    abstract noise: string
}
```

```ts
class Duck extends Animal {
    readonly walk = 'waddle'
    readonly noise = 'quack'
}
```

    <!-- @Prompt -->
    Javascript developers are a lot more likely to check if a given value is an instance of the Duck class to determine if it’s a duck rather than, for example, checking if it's walk is equal to 'waddle' and it's noise is equal to 'quack'

    <!-- @Prompt -->
    We're a lot more likely to look at it's name than it's shape. This is mostly mostly due to convenience, and why not? That's what the instanceof operator is there for.

    <!-- @Prompt -->
    Checking if an object is an instance of some named constructor's prototype works, and unless someone does some deliberately malicious refactoring, it's always going to work! In practice it's fine, but I do not like it in theory.

    <!-- @Prompt -->
    The relationship between an object's contract and its position in the prototype chain is only circumstantial. Typescript doesn't even know about the prototype chain. When you're writing `extend` clauses, you're *only* working with the shape of an object.

# Embracing The Structural Aspects of Typescript

    <!-- @Prompt -->
    I have been doing a lot of exploration and experimentation into embracing the structural aspects of typescript.

    <!-- @Prompt -->
    Don't get me wrong, I really like the syntactic sugar that was added to javascript in the form of class expressions and other Es6 features almost... 10 years ago now, jesus.

    <!-- @Prompt -->
    I believe there's room for some standards and conventions in typescript that will invite developers to reason more in terms of composition than inheritance, which is generally the direction that the ethos of programming is moving as a whole.

    <!-- @Prompt -->
    As the saying goes; if it waddles like a duck and it quacks like a duck, then...

```ts
class Duck extends Animal {
    readonly walk = 'waddle'
    readonly noise = 'quack'
}
```

```ts
const duck = { walk: 'waddle', noise: 'quack' }
expect(duck instanceof Duck).toBe(false)

duck satisfies Duck // no type error
```

    <!-- @Prompt -->
    Then I should be able to use it as a drop in replacement anywhere that my dependencies are consuming a duckable **API**, exactly.

    <!-- @Prompt -->
    In example on screen, the object named duck obviously is not an instance of the Duck class and it wont pass it's instanceof test, but as far as typescript is concerned, it's a duck.


## Traits

### [@benzed/traits](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/traits)



```ts
import { isShape, isTuple, isNumber } from '@benzed/util' 

class Colorful extends Trait {

    static override readonly is: (input: unknown) =    <!-- @Prompt -->
    input is Colorful 
    = isShape({
            color: isTuple(isNumber, isNumber, isNumber)
        })

    abstract get color(): [red: number, green: number, blue: number]

}

class Green extends Colorful {

    static override readonly is: (input: unknown) =    <!-- @Prompt -->
    input is Green = 
        Colorful.is(input) &&
        input[0] === 0 &&
        input[1] === 255 &&
        input[2] === 0

    get color(): [0,255,0] {
        return [0,255,0]
    }
}
```
    <!-- @Prompt -->
    At it's core, my trait library allows developers to create classes with properties combined from a number of other classes, which I call traits. It's basically a set of conventions for working with typescript mixins.

    <!-- @Prompt -->
    On screen you'll see an example trait, the 'colorful' trait, which implores consumers to implement a 'color' property, which is a tuple containing data for three color channels.

    <!-- @Prompt -->
    Note the isShape, isTuple and isNumber methods imported from my utility library. Like `is-ts` they're a set of methods that can be composed to create type guards, but the syntax is much much simpler and they're used to create type-guards only, not validation. 

## Trait Characteristics

### [@benzed/traits](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/traits)

    <!-- @Prompt -->
    Despite being declared as classes, Traits are never actually constructed. Their types and prototypal implementations are transposed to consuming classes as a mixin. Per convention, if they are ever constructed, an error is thrown. A trait is basically a template, and should not be used as anything else.

    <!-- @Prompt -->
    Because their prototypal implementations are transposed, Traits never end up in a consuming classes prototype chain. All of their properties exist on the consuming classes in structure only. Nothing is ever actually an instance of, for example, Green.

Each Trait, by convention, has a static 'is' type-guard that structurally determines if a given input fulfills it's contract. 

    <!-- @Prompt -->
    Since Traits can't be instanced, their `instanceof` operator has been overloaded to use the static `is` method on its own constructor. A Trait's static `is` method is a type guard that checks if an object structurally conforms to the contract of the Trait. If a Trait hasn't overloaded it's static `is` method, it'll throw an error.

    <!-- @Prompt -->
    In other words, if an object is considered to pass the Green.is type-guard, it'll also pass the `Green` `instanceof` operator. In the example you can see a `Todo` class that has been extended to consume the `Green` trait giving us the `GreenTodo` class. We also see that any object which implements the color property is considered `Green`. 


    <!-- @Prompt -->
    Now, despite the fact that this works, I avoid using the instanceof operator when comparing instances to Traits because it's non-idiomatic, but I feel like it's better than the instanceof operator not doing anything at all. I use the `is` method on `StructuralClass`

    <!-- @Prompt -->
    Here-forth, I'll use the term `StructuralClass` when describing constructors that use this `instanceof` overloading behavior and have a static `is` method.

```ts
class Todo {
    constructor(
        public description: string,
        public completed: boolean
    ) {}
}

class GreenTodo extends Trait.add(Todo, Green) {}

const greenTodo = new GreenTodo('Mow the lawn.', false)

expect(greenTodo instanceof Green).toEqual(true)
expect(Green.is(greenTodo)).toEqual(true)

expect({ color: [ 0, 255, 0 ]} instanceof Green).toEqual(true)
expect(Green.is({ color: [ 0, 255, 0 ]})).toEqual(true)
```

## Copyable Trait

### [@benzed/immutable/traits/copyable](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/immutable/src/traits/copyable)

```ts
import { isShape, isFunc } from '@benzed/util'
import { Traits } from '@benzed/traits'

//// Symbol ////

const $$copy = Symbol('=')

//// Main ////

abstract class Copyable extends Traits {

    /**
     * Symbolic key used to implement a copyable method.
     */
    static readonly copy: typeof $$copy = $$copy

    /**
     * Copy an object from a given object's prototype.
     * No constructor logic applied or non-prototypal properties
     * transferred.
     */
    static createFromProto<T extends object>(object: T): T {
        return Object.create(object.constructor.prototype)
    }

    static override readonly is: (input: unknown) =    <!-- @Prompt -->
    input is Copyable = isShape({
        [$$copy]: isFunc
    })

    abstract [$$copy](): this 

}

//// Exports ////

export default Copyable

export {
    Copyable
}
```
    <!-- @Prompt -->
    Okay, let's talk about some actual traits. 

    <!-- @Prompt -->
    I'm a big fan of immutable data structures, as anyone who has spent any time in front-end-land has to be. There are a number of strategies for creating and comparing deep copies of objects.

    <!-- @Prompt -->
    Most people have a `deepCopy` and `deepEqual` method in their rolodex somewhere. There's the recent addition of the `structuredClone` function to the global namespace that allows everyone to do deep copying natively.

    <!-- @Prompt -->
    Mine comes in the form of a trait: the `Copyable` trait. The `Copyable` trait is an export in my immutable library, which has a number of Traits and methods for defining and dealing with immutable data.

    <!-- @Prompt -->
    When writing Traits that are intended to be consumed generically, I avoid using string name properties that may cause collisions. Instead, consumers of generic traits will typically have to implement a Symbolic property. In this case, an object is considered to be Copyable if it implements the symbolic copy method, which should return a structural clone of the object.

    <!-- @Prompt -->
    The immutable library exports a `copy` method, which works like the `structuredClone` method or any `deepCopy` method, except that it checks if an object has a Copyable implementation before proceeding with a generic one.

## Comparable Trait
### [@benzed/immutable/traits/comparable](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/immutable/src/traits/comparable)

    <!-- @Prompt -->
    Along with the `Copyable` trait is the `Comparable` trait. Rust aficionados in the audience might notice that this terminology is starting to look pretty familiar. Yep, you're right, I completely and shamelessly ripped Rust off.

    <!-- @Prompt -->
    The `Comparable` trait is similar to the `Copyable` trait, but it's used by the immutable library's exported `equals` method to determine if two objects are `value-equal`.

```ts
import { isShape, isFunc } from '@benzed/util'
import { Trait } from '@benzed/traits'

//// Symbol ////

const $$equals = Symbol('==')

//// Main ////

abstract class Comparable extends Trait {

    /**
     * Symbolic key used to implement the comparable method.
     */
    static readonly equals: typeof $$equals = $$equals

    static override readonly is: (input: unknown) =    <!-- @Prompt -->
    input is Comparable = isShape({
        [$$equals]: isFunc
    })

    abstract [$$equals](other: unknown): other is this 

}

//// Exports ////

export default Comparable

export {
    Comparable
}
```

# CopyCompare Implementation 

```ts
import { Copyable, Comparable } from '@benzed/immutable'
import { isShape, isNumber, isIntersection } from '@benzed/util'

//// Vector2 //// 

class Vector2 extends Trait.use(Copyable, Comparable) {

    static readonly is: (input: unknown) =    <!-- @Prompt -->
    input is Vector2 = 
        isIntersection(
            Copyable.is,
            Comparable.is,
            isShape({
                x: isNumber,
                y: isNumber
            })
        )

    constructor(readonly x: number, readonly y: number) {}

    [Copyable.copy]() {
        return new Vector2(this.x, this.y)
    }

    [Comparable.equals](other: unknown): other is this {
        return Vector2.is(other)
            && other.x === this.x
            && other.y === this.y
    }
}
```

    <!-- @Prompt -->
    Here is an example of a Structural class that implements the Copyable and Comparable traits.

    <!-- @Prompt -->
    Structurally, a Vector2 is a Copyable/Comparable object with a numeric x and y property. Fantastic! We have a completely immutable vector class.

# Extending Immutable Objects

```ts
class Vector3 extends Vector2 {
    static readonly is: (input: unknown) =    <!-- @Prompt -->
    input is Vector2 = 
        isIntersection(
            Vector.is,
            isShape({
                z: isNumber
            })
        )

    constructor(x: number, y: number, readonly z: number) {
        super(x,y)
    }

    [Copyable.copy](): Vector {
        return new Vector3(this.x, this.y, this.z)
    }

    [Comparable.equals](other: unknown): other is this {
        return super[Comparable.equals](other) &&
            other.z === this.z
    }
}
```
    <!-- @Prompt -->
    Say we we want to extend our shiny new Vector2 to add more properties, in this case a z numeric property so it can be used in 3d space.

    <!-- @Prompt -->
    To do so, we have to implement another constructor, to get our new z property. We also have to extend our Copyable.copy method, otherwise when the object is copied it'll only have x and y properties, and we also need to extend our Comparable.equals method, otherwise the z property won't be taken into consideration when doing comparisons.

    <!-- @Prompt -->
    That is a lot of extending just for the addition of a single property. How about a Trait that can help?

# Stateful Trait
### [@benzed/immutable/traits/stateful](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/immutable/src/traits/stateful.ts)

```ts
import { Trait } from '@benzed/traits'
import { assign, define, each, isKeyed, isObject, isString } from '@benzed/util'

//// Symbol ////

const $$state = Symbol('state')

//// Types ////

type StateOf<T extends Stateful    <!-- @Prompt -->
    = T[typeof $$state]

//// Main ////

/**
 * Stateful trait allows custom logic for getting/setting
 * an object's state.
 */
abstract class Stateful extends Trait {

    static override readonly is: (input: unknown) =    <!-- @Prompt -->
    input is Stateful =
        isKeyed($$state)

    /**
     * Apply a state to a given object.
     */
    static set<T extends Stateful>(object: T, state: StateOf<T>): void {
        const descriptor = each
            .defined
            .descriptorOf(object)
            .find(([k]) =    <!-- @Prompt -->
    k === Stateful.state)?.[1]

        if (descriptor?.set)
            object[$$state] = state

        else if (isObject(state)) {
            assign(object, state)

        } else
            throw new Error(`State ${state} is invalid.`)
    }

    /**
     * Get the state of an object using the State trait
     */
    static get<T extends Stateful>(object: T): StateOf<T    <!-- @Prompt -->
    {
        return object[$$state]
    }

    /**
     * The symbolic key for the state accessor trait users need 
     * to implement
     */
    static readonly state: typeof $$state = $$state

    //// Stateful ////

    abstract get [$$state](): unknown

}

export {
    Stateful,
    StateOf
}
```

    <!-- @Prompt -->
    The Stateful trait allows an object to define stateful properties, typically any enumerable own properties that are assigned during construction, in a type safe manner. In the case of a Vector3, it's stateful properties could be considered x,y and z.

    <!-- @Prompt -->
    As a convention, Immutable objects only use their constructors for setting state properties. This convention allows us to use the Stateful trait to apply the state of one object to another when making copies of it, without having to extend the Copyable/Comparable traits with each class extension.

# Transposing State

```ts
import { Trait } from '@benzed/traits'
import { Copyable, Comparable, Stateful, equals } from '@benzed/immutable'

//// GameData ////

abstract class GameData extends Trait.use(Copyable, Comparable, Stateful) {

    [Copyable.copy](): this {
       const clone = Object.create(this.constructor.prototype)
       const state = Stateful.get(this)
       Stateful.set(clone, state)

       return clone
    }

    [Comparable.equals](other: unknown): other is this {
        if (
            other instanceof GameData && 
            other.constructor === this.constructor
        )
            return equals(other.state, this.state)
    }
}
```

```ts
import { pick } from '@benzed/util'

//// VectorGameData //// 

class VectorGameData extends GameData {

    constructor(readonly x: number, readonly y: number) {
        super()
    }

    get [Stateful.state](): Pick<this, 'x' | 'y'    <!-- @Prompt -->
    {
        return pick(this, 'x', 'y')
    }
}
```

    <!-- @Prompt -->
    Here is a hypothetical immutable GameData class implementing our Copyable, Comparable and Stateful traits.

    <!-- @Prompt -->
    When copied, it creates a new instance of itself by providing it's prototype to the Object.create method, which creates a new instance of an object without executing it's constructor. 

    <!-- @Prompt -->
    If extended classes follow the convention of only using the constructor to set state, then only the state getter needs to be overridden in extended classes, as we see in our second example. 

# Structural Trait 

### [@benzed/immutable/traits/structural](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/immutable/src/traits/structural.ts)

```ts

abstract class Structural extends Trait.merge(Copyable, Comparable, Stateful) {

    // ...abridged

    [Copyable.copy](): this {
       const clone = Object.create(this.constructor.prototype)
       const state = Stateful.get(this)
       Stateful.set(clone, state)
       return clone
    }

    [Comparable.equals](other: unknown): other is this {
        if (
            Structural.is(other) && 
            other.constructor === this.constructor
        )
            return equals(other.state, this.state)
    }
}

```

    <!-- @Prompt -->
    Traits can be merged together. The Structural trait, similarly to the GameData implementation we saw previously, provides a Copyable and Comparable implementation that simplifies the creation of extendable Immutable classes. The Validators in the `is-ts` library heavily depend on the `Structural` trait. 

# Callable Trait

### [@benzed/traits/callable](https://github.com/BenZed/benzed-ts/blob/is-presentation/packages/traits/src/callable/callable.ts)

```ts
import { Callable, Trait } from '@benzed/traits' 

class Multiply extends Trait.use(Callable<(i: number) =    <!-- @Prompt -->
    number>) {

    constructor(readonly by: number) {
        super()
        return Callable.apply(this)
    }

    get [Callable.signature]() {
        return this.multiply
    }

    multiply(input: number): number {
        return input * this.by
    }
}
```

```ts
const x5 = new Multiply(5)

expect(x5(5)).toEqual(25)
expect(x5.by).toEqual(5)
```

    <!-- @Prompt -->
    The Callable Trait, which is by far my favorite, allows developers to write classes with call signatures. The Multiply class we see on the screen shows an example of what this looks like.

    <!-- @Prompt -->
    In accordance with the mantra of embracing the structural aspects of typescript, the Callable trait helps to address a large chasm between typescript and javascript: There is a great deal of type information associated with functions that has no runtime counterpart. 

    <!-- @Prompt -->
    At runtime, you can only really check the name and length properties of a function. Implementing the Callable trait allows for additional properties that can be used in narrowing runtime function type checks.

    <!-- @Prompt -->
    The Validators in the `is-ts` library heavily depend on the `Callable` trait.

# Mutate Trait

### [@benzed/traits/mutate](https://github.com/BenZed/benzed-ts/blob/is-presentation/packages/traits/src/mutate/mutate.ts)

```ts
abstract class Damage {
    abstract amount(): number 
}

abstract class RandomDamage implements Damager {
    abstract get min(): number
    abstract get max(): number

    amount(): number {
        const delta = this.max - this.min
        return Math.round(Math.random() * delta) + this.min
    }
}

class FireDamage extends RandomDamage {
    constructor(readonly min: number, readonly max: number) {
        super()
    }
}

const LIGHTNING_BASE_DAMAGE = 5
class LightningDamage implements Damager {
    constructor(readonly chainedZaps: number) {}
    amount(): number {
        return this.chainedZaps * LIGHTNING_BASE_DAMAGE
    }
}

```

```ts
type Multiply<T extends Damage    <!-- @Prompt -->
    = T & { readonly by: number }

interface MultiplyConstructor {
    new <T extends Damage>(damager: T, by: number): Multiply<T>
}

// Implementation
const Multiply = class Multiply extends Trait.use(Mutate<Damage>) {

    constructor(target: Damager, readonly by: number) {
        super()
        this[Mutate.target] = target
    }

    amount(): number {
        return this[Mutate.target].amount() * this.by
    }

} as MultiplyConstructor
```

```ts
const burny = new FireDamage(7,9)
expect(burny.amount()).toBeGreaterThanOrEqual(7)
expect(burny.amount()).toBeLessThanOrEqual(9)


const zappy = new LightingDamage(5)
expect(zappy.amount()).toEqual(25)

const x2Burny = new Multiply(burny, 2)
expect(x2Burny.amount()).toBeGreaterThanOrEqual(14)
expect(x2Burny.amount()).toBeLessThanOrEqual(18)
expect(x2Burny).toHaveProperty('min', 7)
expect(x2Burny).toHaveProperty('max', 9)

const x3Zappy = new Multiply(zappy, 3)
expect(x3Zappy.amount()).toEqual(75)
expect(x3Zappy).toHaveProperty('chainedZaps', 5)
```

    <!-- @Prompt -->
    Okay, last one: the Mutate Trait. The Mutate Trait leverages Proxies to make what I call dynamic inheritance possible. Rather than extending a specific class with a static set of properties, a Mutator defines a target object, and inherits all of the properties of it's target. Two instances of an identical mutation could have entirely different properties based on whatever their target object is.

    <!-- @Prompt -->
    In our example on screen, we have a damage base class and a number of contrived extensions.

    <!-- @Prompt -->
    Then we have a Multiply mutator. The Multiply mutator accepts any object that implements the Damage interface. It will multiply the output of it's targets amount() method, and through the power of proxies, it will redirect access to other properties to the target object itself.

    <!-- @Prompt -->
    There is still a bit of trickery that needs to be done in order to allow Typescript to be aware of the mutator's contract. This is why the Multiply class is defined the way it is. Faking a constructor makes it possible to declare arbitrary instance types that would be otherwise impossible with a regular class definition.

    <!-- @Prompt -->
    Many `Validators` within `is-ts` depend on `Mutators`, such as the `Optional`, `Not` and `Readonly` modifiers showcased at the beginning of this presentation. The `Is` interface *itself* is a Mutator.

    <!-- @Prompt -->
    Alright, with all this out of the way, we can move on to actual Validation logic. Do we have any questions before I continue?