# Presenting *is-ts*

**[is-ts](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/is)** is a syntactially fluid data validation composition library.

**[is-ts](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/is)** defines, identifies, asserts and transforms data into desired types.

```ts
import is from '@benzed/is'

const unknownValue = await someApi.getData()
```

**[is-ts](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/is)** creates type guards:

```ts
if (is.array.of.string(unknownValue))
    expect(unknownValue.join(' ')).toEqual(expect.any(String))
    //                 ^ typed as string[]
```

**[is-ts](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/is)** performs type assertions:

```ts
is.string.assert(unknownValue) // throws 'must be a string'
```

**[is-ts](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/is)** performs data validation:

```ts
is.string.validate(unknownValue) // throws 'must be a string'

const trimmed = is.string.trim().validate('   hello world   ')

expect(trimmed).toEqual('hello world')
```
> is-ts is a yet-to-be-released library I've been building in type script. It allows developers to compose type guards, type asserters and data validation schematics with a fluent and, I'm hoping, intuitive api.

> This was born out of a couple of desires. There many typesafe validation libraries out there, and they all seem fine to me. I built one mainly because I've always wanted to.

## Type Safety

Extract a type defined by a schematic:
```ts
const isVector = is({ x: is.number, y: is.number })

type Vector = typeof isVector.type // { x: number, y: number }
```

Alternatively, schematics can be created for existing types:
```ts
import { IsType } from '@benzed/is'

interface Vector {
    x: number,
    y: number
}

const isVector: IsType<Vector> = is({ x: is.number, y: is.number })

expect(isVector({ x: 0, y: 0 })).toBe(true)
```

> When I first transitioned to TypeScript, I became increasingly impressed with how the type system worked, and how malleable and powerful it was especially in comparison to other existing strongly typed languages. There's a lot of interesting things you can do in typescript that you can't do in, for example, C#.

> I looked at a couple of the other data validation libraries that were written with the same design goals in mind, such as ts-json-schema, or zod. When I was new to typescript, the source code in their respective repositories was greek to me. I figured that actually building a library that was so closely tied to the type system would be a great way to learn the type system.

> As I learned more about typescript and worked extensively in the web ecosystem, I found myself writing a great deal of type guards, and I kept on imagining a library that could be used to guard types and create validation for them at the same time as I feel they're tightly coupled concepts, anyway.

## Fluidity

Define complex types:

```ts
const isSerialInput = is
    .number.or.string
    .or
    .array.of.number.or.string
```

Different ways:

```ts
const isSerialInput = is.number.or(is.string)
    .or
    .arrayOf(is.number.or.string)
```

Composably:

```ts
const isNumberOrString = is.number.or.string 

const isSerialInput = is(isNumberOrString)
    .or
    .arrayOf(isNumberOrString)
```

Type Safe:

```ts
isSerialInput.type satisfies number | string | (number | string)[]

expect(isSerialInput('string')).toBe(true)
expect(isSerialInput(0)).toBe(true)
expect(isSerialInput([0, 'string'])).toBe(true)
```

> As we know, code is inherently a lot easier to write than to read, which is a phenomenon I've always found very frustrated. The more I've programmed, the more I've imagined api's I like to work with that I imagine make code easier to understand apon revisiting.

> I think different languages have different readability strengths and generally the higher level languages are easier for humans to read

> Javacript and Typescript arn't exactly the most extensible languages, but the structures are malleable enough that you can make your own standards. JQuery comes to mind.

> In my own mono repo utility libraries, I've developed a number of these fluid apis. In my mind, the more often one depends on a library the more readable it's interface should be. My creations borrowed a lot from testing libraries like mocha or jest.

> In the examples on screen, you can see a couple of ways of defining the same data structure. This is some contrived schematic for serial input.

## Type Fluidity

Type definitions are intended to be easily readable:

```ts
import { Is, Optional, ReadOnly, ArrayOf, Shape } from '@benzed/is'

const isVector = is({
    x: is.number,
    y: is.number
})

const isMaybeVectors = is.optional.array.of(isVector.readonly) satisfies

    Is<Optional<ArrayOf<ReadOnly<Shape<{ x: Number, y: Number  }>>>>>

isMaybeVectors.type satisfies 
    { readonly x: number, readonly y: number }[] | undefined
```

> I think some of typescripts less developer experience friendly aspects are the cryptic type errors and readability of complex or nested types, so in addition to the runtime syntax itself being readable, I'd like as much as possible for the types to be readable as well.

> You'll see in the example satisfies operand more or less has the same structure as the validator declaration itself.

> I admit that the syntax highlighting isn't as friendly as it is inside my IDE

## Inituitive API

```ts

const isReadonlyVectors = is.readonly.array.of(isVector.optional) satisfies

    Is<ReadOnly<ArrayOf<Optional<Shape<{ x: Number, y: Number }>>>>>

isReadonlyVectors.type satisfies 
    readonly ({ x: number, y: number } | undefined)[]
```

## Inituitive API

**[is-ts](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/is)** uses typescript theory and conventions
```ts

```
