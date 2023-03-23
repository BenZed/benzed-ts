# Presenting is-ts

**[is-ts](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/is)** is a data validation library with static type inference. 

```ts
import is from '@benzed/is'
```

**[is-ts](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/is)** defines, identifies, asserts and transforms data into desired types.

```ts
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
expect(() => is.string.assert(unknownValue))
    .toThrow('must be a string')
```

**[is-ts](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/is)** performs data validation:

```ts
is.string.validate(unknownValue) // throws 'must be a string'

const trimmed = is.string.trim().validate('   hello world   ')

expect(trimmed).toEqual('hello world')
```
> is-ts is a yet-to-be-released library I've been building in type script. It allows developers to compose type guards, type asserters and data validation schematics with a fluent and intuitive api.

> This was born out of a couple of desires. There many type-safe validation libraries out there, and they all seem fine to me. I built one mainly because I've always wanted to.

> On screen you'll see a couple of contrived examples of how is-ts might be used to create type guards, type assertions or validation methods.

> I'd also like to point out that right now you see it imported from my npm scoped library, but when it's actually released, it'll be import from is-ts.

## Static Type Inference

**[is-ts](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/is)** can be used to define inferrable types:

```ts
const isVector = is({ x: is.number, y: is.number })

type Vector = typeof isVector.type // { x: number, y: number }
```

Alternatively, schematics can be created for an existing type:

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

> I remember having something of a eureka moment when learning about mapped types and conditional types years ago and thinking that there are some incredible opportunities for developer experience in this language. As a developer, at the time, I strongly wanted to gravitate away from javascript for it's deficiencies. I wanted to stay in C# or delve into rust, but Typescript made me stay.

> I looked at a couple of the other data validation libraries that were written with the same design goals in mind, such as ts-json-schema, or zod. Now that mine is close to done, I've noticed a lot of them being released lately, actually.

> As I learned more about typescript and worked extensively in the web ecosystem, I found myself writing a great deal of type guards, and I kept on imagining a library that could be used to guard types and create validation for them at the same time as I feel they're tightly coupled concepts, anyway.

> In the first example, you can see how a type can be defined with `is-ts`, and in the second you can see how a schematic could be created for an existing type in a type-safe manner.

## Fluidity

Define complex schematics using fluid chainable terms:

```ts
const isSerialInput = is.number.or.string
    .or
    .array.of.number.or.string
```

Many terms are optionally callable:

```ts
const isSerialInput = is.number.or(is.string)
    .or
    .array.of(is.number.or.string)
```

```ts
isSerialInput.type satisfies number | string | (number | string)[]

expect(isSerialInput('string')).toBe(true)
expect(isSerialInput(0)).toBe(true)
expect(isSerialInput([0, 'string'])).toBe(true)
```

> As we know, code is inherently a lot easier to write than to read, which is a phenomenon I've always found very frustrating. I very frequently have to exercise discipline not to re-write modules as opposed to sit down and parse them. The more anyone programs, the more focused they become on making their own code readable. I find myself imagining and building api's that are structured with readability as a prime directive.

> I think different languages have different readability strengths and generally the higher level languages are easier for humans to read than the lower levels ones, but no matter how you slice it, readability is the responsibility of the writer.

> JavaScript and Typescript aren't exactly the most extensible languages, you can't define your own operators, for example, but the syntax is malleable enough that you can more or less make your own standards. JQuery comes to mind.

> I have a mono repository of all my own utility libraries and  I've developed a number of interfaces focused on fluid readability. In my mind, ideally the more often one depends on a library the more readable it's syntax should be. My creations borrow a lot from testing libraries like mocha or jest.

> In the examples on screen, you can see a couple of different ways of defining the same type of data. I like writing a schematic that reads as english or pseudo code. 

> In this case a "SerialInput" is a number or a string, or an array of numbers or strings. I'm also showcasing how many terms are chainable or callable. 

## Type Fluidity


```ts
import { Is, Optional, ArrayOf, ReadOnly, Shape, Number } from '@benzed/is'
```

Defined types share a readable structure similarly to the structure of their written schematics:

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

> I think some of the unfriendly aspects of Typescript's developer experience are the cryptic type errors and readability of complex or nested types, so in addition to the runtime syntax itself being readable, I'd like as much as possible for the types to be readable as well.

> You'll see on line 2 in the second and third example that the satisfies operand more or less has the same structure as the schematic declaration itself. You can see that by exchanging the position of the modifiers, one gets a different type.

> The syntax highlighting in this example isn't as nice as it would be in an IDE.

## Narrowing

**[is-ts](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/is)** allows schematic narrowing through terms:

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

const isShoutedHashTag = isHashtag.and(isShout)

```
> Since it-ts is a type-guard AND data validation library, it wouldn't be very useful if it weren't possible to narrow the scope of the types to specific forms.

> It's nice to be able to quickly write type guards for common or obvious shapes, but I'd also like to use the same library to sanitize user input or validate records being pushed up to a database.

> The examples on screen showcase some sub validation builder methods that one might expect to find. A hashtag is a string that starts with a hash symbol, an accessible port is an integer between 1025 and 65536 and so on.

> The `.and` term works similarly to the `.or` term, creating an intersection of schematics that all have to pass. 

## Immutability 

Each schematic created by **[is-ts](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/is)** is an immutable data structure. Any methods or properties that change the configuration of the schematic create new instances.

Configuration terms can be called with options:
```ts

// Disabling a sub validator
const isRaisedVoice = isShout.capitalized(false)

// Enabling a sub validator:
const isTrimmedString = is.string.trimmed() // short for is.string.trimmed() 

// Enabling a sub validator with options arguments, in this case an error message:
const isLowerCaseString = is.string.lowerCase('no uppercase letters allowed') 

// Enable a sub validator with an explicit options object:
const isTag = is.string.startsWith({ 
    value: '@', 
    error: 'must be written as a @tag' 
})
```

> I'm a big fan of builder pattern, I use it very frequently when creating dev libraries in typescript, and is-ts is no exception. As you would expect from similar libraries, every term that changes the configuration of a schematic, or chains additional types onto a schematic will create a new instance.

> In the first example on screen, you can see how we've taken a schematic from the previous slide and we've disabled one of it's sub-validators, and there are couple of examples there that showcase the different signatures one can use when configuring a term.

> Every sub validation term can take a single false boolean, which disables it, so 'isShout' becomes 'isRaisedVoice' because it is no longer uppercase and simply must end with an exclamation mark. 

> Many sub validation terms don't require a configuration, so they can be passed a true boolean or just called without any arguments to enable them. And many sub validation terms, such as `startsWith` require some configuration input. A lot of signatures are available for developer experience and readability.

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
const isTodo = is.readonly({
    completed: is.boolean,
    description: is.string
})

isTodo.type satisfies Readonly<{
    completed: boolean,
    description: string
}>
```

The readonly modifier does not affect the schematics runtime behavior, only it's type inference.

> is-ts is intended to have terms and naming conventions that would be familiar to typescript developers. I've re-used a lot of names from utility types, where functionality is applicable.

> Many terms are only available when composing specific types, such as string specific or number specific terms, but the readonly is available generally everywhere.

> In the first example, you can see that we've declared both properties on the Todo shape as readonly, either as a prefix or suffix, functionally they do the same thing.

> In the second example, instead of defining each individual term as readonly, we've made the entire shape readonly. Functionally this does the same thing as the first example, I'm just showcasing the intuitive and composable nature of the terms.

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

> Like the previous example, properties in a shape can be made optional, and the optional clause is equivalently liberal with where it's declared. 

> In the second example, we're using the partial property on the shape in order to make all of it's properties optional, much like how you'd expect the Partial utility method to work. In this example, the .partial property is only available on shape schematics, so it can't prefixed, only suffixed.

> We *can* use the optional modifier on shapes as well, but as one would expect, that makes the entire value optional, rather than each individual property.

# Required / Writable

Modifier negation properties:
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

On shapes:
```ts
is.required({
    x: is.optional.number,
    y: is.optional.number
})
.type satisfies { x: number, y: number }
```

> Much like sub validators can be disabled, modifiers are properties can be removed, as well. 

> The examples on screen are silly and contrived, but they showcase that if you were taking existing schematics, you could change the modifiers on them for various purposes.

> You can see that an optional string could made required, or a readonly array could be made mutable. All modifiers are removable.

# Not

Validations can be negated:

```ts
const isLiquidTemp = is.number.min(0).max(100)
expect(() => isLiquidTemp.assert(125)).toThrow('must be below or equal 100')
expect(() => is.not(isLiquidTemp).assert(125)).not.toThrow()
```

Negations in properties:
```ts
const isUnsanitizedInput = is({
    data: is.not.boolean.or.number,
})

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

> The not modifier simply negates a validation. Unfortunately, it's not very useful by itself as a type guard. Negative type guards haven't been made possible to write, because one would just use the negate operator in an expression before a type-guard in order to exclude types from an input set rather than extract them.

> But the not modifier can still be useful for property validations or unions. 

> I'd also like to showcase how the not operator can be removed, because I think it's funny. It's not-not a vector? Great, so it's a vector. Ha-ha.

# Pick

Shape schematics have a number of useful utility methods.

Given a complex shape:

```ts
const isLettersOnly = is.string.format(/^[A-z]$/, 'may only contain letters')
const isAboveZero = is.integer.positive()

const isPerson = is.readonly({
    firstName: isLettersOnly,
    lastName: isLettersOnly,
    title: is.optional.string,
    age: isAboveZero
    gender: is.optional.string
})
```

Much like the `Pick` utility method, a new shape can be created
by defining inclusive property keys:

```ts
const isName = isPerson.pick('firstName', 'lastName')

isName.type satisfies {
    readonly firstName: string,
    readonly lastName: string
}
```

> I'm going to quickly showcase some other utility methods available on shape schematics, but that's only because it took a lot of iteration to get the types to work with acceptable performance in the IDE.

> One thing I'd like to address with this library, is that many of the other validation libraries with static type inference invariably depend on recursive conditionals, which can lead to a great deal of type instantiation and slow typescript slow. My library is decent, but there is still more optimization to be done. The modifier stack I've come up with alleviates a lot of the pressure.

> Shape.pick, like the `Pick` utility type, creates a new shape from a subset of given properties.

# Omit 

Much like the `Omit` utility method, a new shape can be created by defining *exclusive* property keys:

```ts
const isAnonymous = isPerson.omit('firstName', 'lastName', 'title')

isAnonymous.type satisfies {
    readonly age: number,
    readonly gender?: string
}
```

> Shape.omit, like the `Omit` utility type, creates a new shape from an exclusive subset of given properties.

# Shape And

If used on a shape, `.and` combines the properties from two shapes into one instead of making an intersection:

```ts
const isEmployee = isPerson.and({
    salary: isAboveZero
})

isEmployee.type satisfies {
    readonly firstName: string,
    readonly lastName: string,
    readonly title:? string,
    readonly age: number,
    readonly gender?: string,
}
```

> Typically, the `.and` term would create an intersection of validators, but in the case of a shape it's smart enough to merge properties of shapes together.

# Property 

Make changes to individual properties on a shape:

```ts
const isAdult = isPerson.property('age', age => age.min(19))
```

A property can be replaced with another type:
```ts
const isDoctor = isPerson
    .property('title', () => is('Md', 'Phd'))

isDoctor.type satisfies {
    readonly firstName: string,
    readonly lastName: string,
    readonly title: 'Md' | 'Phd',
    readonly age: number,
    readonly gender?: string,
}
```

> The `.property` method allows one to make single property changes to a shape, using the previous property as input. Handy if you want to change the configuration or add modifiers to a specific property.

# Partial

Make all properties on a given shape optional:

```ts
const isPersonData = isPerson.partial

isPersonData.type satisfies Partial<typeof isPerson.type>
```

> The `.partial` term is an analog to the Partial utility type, makes all of the properties on a given shape partial.

# Strict 

By default, a shape will only validate properties it has schematic definitions for, ignoring other properties that may be on the validation input. 

The `.strict()` term can be used to limit a shape to only it's defined properties: 

```ts
const isVector = is
    .readonly({
        x: is.number
        y: is.number
    })
    .strict()
```

# Signatures 

The `is` call signature will make out of literal values:

```ts
const isZero = is(0) 
isZero.type satisfies 0
```

Instead of using the `.or` term, the `is` signature can create unions of out multiple inputs:
```ts
const isAsyncState = 
    is({
        type: 'resolving'
    }, {
        type: 'rejected',
        error: is.error
    }, {
        type: 'resolved',
        value: is.unknown
    })

isAsyncState.type satisfies {
    type: 'resolving'
} | {
    type: 'rejected'
    error: Error
} | {
    type: 'resolved'
    value: unknown
}
```

> I'm going to briefly showcase some of the signatures on the is method. We can supply literals to create schematics for exact values.

> Instead of using the .or term, we can provide multiple inputs to create a union. In the second example, we're putting both concepts together to create a discriminated union.

# More Signatures

Schematics can take constructors as input to validate instances:
```ts

class Foo {
    bar = 'bar'
}

const isFoo = is(Foo)

isFoo.type satisfies Foo 
```

Like shapes, schematics can be made for tuples:
```ts
const isRange = is([ is.number, is.number ])

isRange.type satisfies [number, number]
```

> Existing constructors can be dropped in to create schematics that validate instances. 

> Like shapes, schematics can be made for tuples. All of this is possible thanks to the new const argument modifier, otherwise we'd have to be dropping in const keywords.

>