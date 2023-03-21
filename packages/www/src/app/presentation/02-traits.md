# Nominal vs Structural Types

> I think it’s interesting that, while javascript and of course typescript are structural languages, a lot of meta programming in javascript is reasoned nominally.

```ts
abstract class Shape {
    abstract get edges(): number
}
```

```ts
class Square extends Shape {
    get edges(): number {
        return 4
    }
}
```

> As javascript developers, we’re a lot more likely to check if a given value is an instance of the Square class to determine if it’s a square rather than checking if it has an `edges` property with a value of `4`

> We're a lot more likely to look at it's name than it's shape. This is mostly mostly due to convenience, and why not?

> Checking if an object is an instance of some named constructor's prototype works, and unless someone does some deliberately malicious refactoring, it's always going to work!

> But, the relationship between an object's contract and its position in the prototype chain is only circumstantial. Typescript doesn't even know about the prototype chain. When you're writing `extend` clauses, you're *only* working with the shape of an object:

```ts
const square = { edges: 4 }
expect(square instanceof Square).toBe(false)

square satisfies Square // quack quack
```

> In the second example, the contrived object obviously isn't a square and wont pass it's instance test, but as far as typescript is concerned, it's a square.

> I have been doing a lot of exploration and experimentation into embracing the structural aspects of typescript.

> As the saying goes; if it waddles like a duck and it quacks like a duck... then I should be able to use it as a drop in replacement anywhere that my dependencies are consuming a duckable **API**.

## Traits

### [@benzed/traits](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/traits)

> I'm not going to spend much time on this because `Trait`s are a convention that I've started to use in my own libraries, they're imperfect and I'm not going to campaign to get my employers to use them, but they're used frequently throughout the rest of this presentation, so here's a primer.

> What I call a Trait is basically an interface with optional or partial implementation and runtime type support.

> The Trait implementation you're seeing here is basically a typescript mixin library with added conventions.

```ts
class Colorful extends Trait {

    static override readonly is: (input: unknown) => input is Colorful 
    = isShape({
            color: isTuple(isNumber, isNumber, isNumber)
        })

    abstract get color(): [number, number, number]

}

class Green extends Colorful {

    static override readonly is: (input: unknown) => input is Green = 
        Colorful.is(input) &&
        input[0] === 0 &&
        input[1] === 255 &&
        input[2] === 0

    get color(): [0,255,0] {
        return [0,255,0]
    }
}
```

## Trait Characteristics

### [@benzed/traits](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/traits)

> Despite being declared as classes, Traits are never actually constructed. Their types and prototypcal implementations are transposed to consuming classes as a mixin. If they are ever constructed, an error is thrown.

> Because their prototypal implementations are transposed, Traits never end up in a consuming classes prototype chain. Each Trait, by convention, has a static 'is' typeguard that structurally determines if a given input fulfills it's contract. 

> Since Traits can't be instanced, their `instanceof` operator is overloaded to use the static 'is' typeguard instead.

> In other words, as you can see in the example, if an object is considered to pass the Green.is typeguard, it'll also pass the `instanceof` operand.

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

> I'm a big fan of immutable data structures, as anyone who has spent any time in front-end-land is. There are a number of strategies for creating and comparing deep copies of objects.

> Most people have a `deepCopy` and `deepEqual` method in their rolledex somewhere. There's the recent addition of the `structuredClone` function to the global namespace that allows everyone to do deep copying natively.

> Mine comes in the form of trait. The `Copyable` trait.

```ts
import { copy, Copyable, Comparable } from '@benzed/immutable'
import { isShape, isNumber } from '@benzed/util'

class Vector extends Trait.use(Copyable, Comparable) {

    static readonly is: (input: unknown) => input is Vector = isShape({
        x: isNumber,
        y: isNumber
    })

    constructor(readonly x: number, readonly y: number) {}

    [Copyable.copy]() {
        return new Vector(this.x, this.y)
    }

    [Comparable.equals](other: unknown): other is this {
        return Vector.is(other)
            && other.x === this.x
            && other.y === this.y
    }
}
```

## Comparable Trait
### [@benzed/immutable/traits/comparable](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/immutable/src/traits/comparable)

> Along with the `Copyable` trait is the `Comparable` trait. Rust afficinados in the audience might notice that this terminology is starting to look pretty familiar. Yep, you're right, I completely and shamelessly ripped Rust off.