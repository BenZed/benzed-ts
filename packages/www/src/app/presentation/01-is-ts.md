# Presenting is-ts

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

> This was born out of a couple of desires. There many type-safe validation libraries out there, and they all seem fine to me. I built one mainly because I've always wanted to.

> On screen you'll see a couple of contrived examples of how the api might be used to create type guards, type assertions or validation methods.

> I'd also like to point out that right now you see it imported from my npm scoped library, but when it's actually released, it'll be import from is-ts.

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

> When I first transitioned to TypeScript, I became increasingly impressed with how the type system worked, and how malleable and powerful it was especially in comparison to other existing strongly typed languages. There's a lot of interesting things you can do in typescript that you can't do, for example, in C#.

> I remember having something of a eureka moment when learning about mapped types and conditional types years ago and thinking that there are some incredible opportunities for developer experience in this language. As a developer, at the time, I strongly wanted to gravitate away from javascript for it's deficiencies and I started learning rust, instead. Typescript made me stay.

> I looked at a couple of the other data validation libraries that were written with the same design goals in mind, such as ts-json-schema, or zod. I figured that actually building a library that was so closely tied to the type system would be a great way to learn the type system.

> As I learned more about typescript and worked extensively in the web ecosystem, I found myself writing a great deal of type guards, and I kept on imagining a library that could be used to guard types and create validation for them at the same time as I feel they're tightly coupled concepts, anyway.

> In the first example, you can see how a type can be defined with `is-ts`, and in the second you can see how validation could be created for an existing type in a type-safe manner.

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

> As we know, code is inherently a lot easier to write than to read, which is a phenomenon I've always found very frustrating. I very frequently have to exercise discipline not to re-write modules as opposed to sit down and parse them. The more anyone programs, the more focused they become on making their own code readable. I find myself imagining and building api's that are structured with readability as a prime directive.

> I think different languages have different readability strengths and generally the higher level languages are easier for humans to read than the lower levels ones, but not matter how you slice it, it's the responsibility of the coder. No disrespect to the author at all, but I open the zod repository, and I have difficulty making heads or tails of it.

> JavaScript and Typescript aren't exactly the most extensible languages, you can't define your own operators, for example, but the syntax is malleable enough that you can more or less make your own standards. JQuery comes to mind.

> In my own mono repo utility libraries, I've developed a number of these fluid apis. In my mind, the more often one depends on a library the more readable it's syntax should be. My creations borrow a lot from testing libraries like mocha or jest.

> In the examples on screen, you can see a couple of different ways of defining the same type of data. I like that, once the data types are written, they're structured exactly how I think about them in english.

> A "SerialInput", whatever that is, is a number or a string, or an array of numbers or strings.

## Type Fluidity


```ts
import { Is, Optional, ArrayOf, ReadOnly, Shape, Number } from '@benzed/is'
```

Type definitions are intended to be readable:

```ts
const isMaybeVectors = is.optional.array.of(isVector.readonly) satisfies
    Is<Optional<ArrayOf<ReadOnly<Shape<{ x: Number, y: Number  }>>>>>

isMaybeVectors.type satisfies 
    { readonly x: number, readonly y: number }[] | undefined
```

```ts
const isReadonlyVectors = is.readonly.array.of(isVector.optional) satisfies

    Is<ReadOnly<ArrayOf<Optional<Shape<{ x: Number, y: Number }>>>>>

isReadonlyVectors.type satisfies 
    readonly ({ x: number, y: number } | undefined)[]
```

> I think some of Typescript's less developer experience friendly aspects are the cryptic type errors and readability of complex or nested types, so in addition to the runtime syntax itself being readable, I'd like as much as possible for the types to be readable as well.

> You'll see in the examples the satisfies operand more or less has the same structure as the validator declaration itself. You can see that by exchanging the position of the modifiers, one gets a different type.

> I admit that the syntax highlighting in this example isn't as friendly as it is inside my IDE.

## Narrowing

**[is-ts](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/is)** allows complex narrowing through terms:

```ts
const isHashtag = is.string
    .startsWith('#')

const isShout = is.string
    .capitalized()
    .endsWith('!')

const isPort = is.integer
    .min(1025)
    .max(65536)
    .error('must be an accessible port')

const isObjectId = is.string
    .format(
        /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i,
        'must be in object-id format'
    )

```
> Since it-ts is a type-guard AND data validation library, it wouldn't be very useful if it weren't possible to narrow the scope of the types to specific forms.

> It's nice to be able to quickly write type guards for common or obvious shapes, but I'd also like to use the same library to sanitize user input or validate records being pushed up to a database.

> The examples on screen showcase some sub validation builder methods that one might expect to find.

## Immutability 

Each validator created by **[is-ts](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/is)** is an immutable data structure. Any methods or properties that are part of the configuration interface will create new instances. Thus, actions can be reversed:

```ts
const isRaisedVoice = isShout.capitalized(false)
```

Any terms with a function signature can be disabled or called with different configuration:
```ts
const isRestrictedPort = isPort.min(0).max(1024).message('must be a restricted port')
const isCurrency = isHashtag.startsWith('$', 'must be worth money')
```

## Readonly

**[is-ts](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/is)** uses naming conventions with typescript familiarity in mind.

Writing a readonly todo:
```ts

const isTodo = is({
    completed: is.readonly.boolean,
    description: is.string.readonly
}) 

isTodo.type satisfies {
    readonly completed: boolean,
    readonly description: string
}

```

Alternatively:
```ts
const isTodo = is({
    completed: is.boolean,
    description: is.string
}).readonly

isTodo.type satisfies Readonly<{
    completed: boolean,
    description: string
}>
```

# Optional / Partial

Writing an optional todo:
```ts
const isTodo = is({
    completed: is.boolean.optional,
    description: is.optional.string
})

isTodo.type satisfies {
    completed?: boolean,
    description?: string
}
```

Alternatively:
```ts
const isTodo = is({
    completed: is.boolean,
    description: is.string
}).partial

isTodo.type satisfies {
    completed?: boolean,
    description?: string
}
```

> is-ts is built with typescript conventions, utilities and theory in mind. The top example showcases that the readonly modifier could be prefixed or suffixed on individual properties of a shape or indexes of a tuple. Alternatively, the entire shape could be made readonly if the readonly modifier is hoisted up a level, much like using the readonly property modifiers or the Readonly utility type.

> In the second example we see similarily that the optional modifier can be prefixed or suffixed to individual properties, or the partial property could be used much like the Partial utility type. Using the .optional term for the Todo would make the entire value optional rather than each individual property, much like you'd expect the optional operator to behave.

# Required / Writable

```ts
is.optional.string 
    .type satisfies string | undefined

is.optional.string.required
    .type satisfies string

is.readonly.array.of.string
    .type satisfies readonly string[]

is.readonly.array.of.string.writable
    .type satisfies string[]
```

# Not

Validations can be negated:

```ts
if (is.not.string(input))
    input = String(input)
```

Negations can also be negated:

```ts
const isVector = is({
    x: is.number,
    y: is.number
})

const isNotVector = is.not(isVector)

is.not(isNotVector).type satisfies typeof isVector.type
```

Negations can work on narrowing validations:
```ts
const isLiquidTemp = is.number.min(0).max(100)
expect(() => isLiquidTemp.assert(125)).toThrow('must be below or equal 100')
expect(() => is.not(isLiquidTemp).assert(125)).not.toThrow()
```

> !!!Talk a little about the .not operator

> Talk about how type guarding works

