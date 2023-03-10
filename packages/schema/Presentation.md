# is-ts

I think it’s interesting that, while javascript and of course typescript are structural languages, a lot of meta programming in javascript is reasoned nominally: 

```ts

abstract class Shape {
    abstract get edges(): number
}

class Square extends Shape {
    get edges(): number {
        return 4
    }
}

```

As javascript developers, we’re a lot more likely to check if a given value is an instance of the Square class to determine if it’s a square rather than checking if it has an `edges` property with a value of `4`. We're a lot more likely to look at it's name, then it's shape. This is mostly mostly due to convenience, and why not?

Checking if an object is an instance of some named constructor's prototype works, and unless someone does some deliberately malicious refactoring, it's always going to work!

The relationship between an object's contract and its position in the prototype chain is only circumstantial. Typescript doesn't even know about the prototype chain. When you're writing `extend` clauses, you're *only* working with the shape of an object:

```ts

class Vector {
    constructor(readonly x: number, readonly y: number) {}
}

const vector = { x: 0, y: 0 }
expect(vector instanceof Vector).toBe(false)

type IsVector = typeof vector extends Vector ? true : false;
expectTypeOf<IsVector>().toEqualTypeOf<true>()

```

I have been doing a lot of exploration and experimentation into embracing the structural aspects of typescript. As the saying goes; if it waddles like a duck and it quacks like a duck... then I should be able to use it as a drop in replacement anywhere that my dependencies are consuming a duckable **API**.
