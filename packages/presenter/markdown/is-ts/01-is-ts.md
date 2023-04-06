<!-- @CenterHeader -->
Presenting is-ts
<!-- @Section -->
**[is-ts](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/is)** is a data validation library with static type inference. 

```ts
import is from 'is-ts'
```

    <!-- @Prompt -->
    is-ts is a yet-to-be-released library I've been building in type script. It allows developers to compose type guards, type asserters and data validation schematics with a fluent and intuitive api.

    <!-- @Prompt -->
    This was born out of a couple of desires. There many type-safe validation libraries out there, and they all seem fine to me. I built one mainly because I've always wanted to.


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
expect(() =    <!-- @Prompt -->
    is.string.assert(unknownValue))
    .toThrow('must be a string')
```

**[is-ts](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/is)** performs data validation:

```ts
is.string.validate(unknownValue) // throws 'must be a string'

const trimmed = is.string.trim().validate('   hello world   ')

expect(trimmed).toEqual('hello world')
```

    <!-- @Prompt -->
    On screen you'll see a couple of contrived examples of how is-ts might be used to create type guards, type assertions or validation schematics.

    <!-- @Prompt -->
    I'd also like to point out that right now you see it imported from my npm scoped library, but when it's actually released, it'll be import from is-ts.

    <!-- @Prompt -->
    [getCurrentSlide](/getCurrent)

#<!-- @CenterHeader -->
Static Type Inference

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

const isVector: IsType<Vector    <!-- @Prompt -->
    = is({ x: is.number, y: is.number })

expect(isVector({ x: 0, y: 0 })).toBe(true)
```

<!-- @Prompt -->
When I first transitioned to TypeScript, I became increasingly impressed with how the type system worked, and how malleable and powerful it was especially in comparison to other existing strongly typed languages. There's a lot of interesting things you can do in typescript that you can't do, for example, in C#.

<!-- @Prompt -->
I remember having something of a eureka moment when learning about mapped types and conditional types years ago and thinking that there are some incredible opportunities for developer experience in this language. As a developer, at the time, I strongly wanted to gravitate away from javascript for it's deficiencies. I wanted to stay in C# or delve into rust, but Typescript made me stay.

<!-- @Prompt -->
I looked at a couple of the other data validation libraries that were written with the same design goals in mind, such as ts-json-schema, or zod. Now that mine is close to done, I've noticed a lot of them being released lately, actually.

<!-- @Prompt -->
As I learned more about typescript and worked extensively in the web ecosystem, I found myself writing a great deal of type guards, and I kept on imagining a library that could be used to create guards for types and schematics for them at the same time as I feel they're tightly coupled concepts, anyway.

<!-- @Prompt -->
In the first example, you can see how a type can be defined with `is-ts`, and in the second you can see how a schematic could be created for an existing type in a type-safe manner.

<!-- @CenterHeader -->
#Fluidity
<!-- @Section -->

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

<!-- @Prompt -->
As we know, code is inherently a lot easier to write than to read, which is a phenomenon I've always found very frustrating. I very frequently have to exercise discipline not to re-write modules as opposed to sit down and parse them. The more anyone programs, the more focused they become on making their own code readable. I find myself imagining and building api's that are structured with readability as a prime directive.

<!-- @Prompt -->
I think different languages have different readability strengths and generally the higher level languages are easier for humans to read than the lower levels ones, but no matter how you slice it, readability is the responsibility of the writer.

<!-- @Prompt -->
JavaScript and Typescript aren't exactly the most extensible languages, for example you can't overload most operators, but the syntax is malleable enough that you can more or less make your own standards. JQuery comes to mind.

<!-- @Prompt -->
I have a mono repository of all my own utility libraries and  I've developed a couple of interfaces focused on fluid readability. In my mind, ideally the more often one depends on a library the more readable it's syntax should be. My creations borrow a lot from testing libraries like mocha or jest.

<!-- @Prompt -->
In the examples on screen, you can see a couple of different ways of defining the same type of data. I like writing a schematic that reads as english or pseudo code. 

<!-- @Prompt -->
In this case a "SerialInput" is a number or a string, or an array of numbers or strings. I'm also showcasing that some terms are chainable as well as callable. In the first example you can see how the `or` term is chained into a schematic shortcut, but in the second you can see how the `or` term is called with a schematic, instead. In the third example, you can see the same with the `of` term.

<!-- @CenterHeader -->
#Type Fluidity
<!-- @Section -->

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

<!-- @Prompt -->
I think some of the unfriendly aspects of Typescript's developer experience are the cryptic type errors and readability of complex or nested types, so in addition to the runtime syntax itself being readable, I'd like as much as possible for the types to be readable as well.

<!-- @Prompt -->
You'll see on line 2 in the second and third example that the satisfies operand more or less has the same structure as the schematic declaration itself. You can see that by exchanging the position of the modifiers, one gets a different type.

<!-- @Prompt -->
The syntax highlighting in this example isn't as nice as it would be in an IDE.

<!-- @CenterHeader -->
#Narrowing
<!-- @Section -->

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

const isObjectIdString = is.string
    .format(
        /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i,
        'must be in object-id format'
    )

const isShoutedHashTag = isHashtag.and(isShout)

```
<!-- @Prompt -->
Since it-ts is a type-guard AND data validation library, it wouldn't be very useful if it weren't possible to narrow the scope of the types to specific forms.

<!-- @Prompt -->
It's nice to be able to quickly write type guards for common or obvious shapes, but I'd also like to use the same library to sanitize user input or validate records being pushed up to a database, anything that one needs schematic validation for.

<!-- @Prompt -->
The examples on screen showcase some schematic builder methods that one might expect to find. A hashtag is a string that starts with a hash symbol, an accessible port is an integer between 1025 and 65536 and so on.

<!-- @Prompt -->
The `.and` term works similarly to the `.or` term, creating an intersection of schematics that all must pass to be considered valid.

<!-- @CenterHeader -->
#Immutability 
<!-- @Section -->

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

<!-- @Prompt -->
I'm a big fan of builder pattern, I use it very frequently when creating dev libraries in typescript, and is-ts is no exception. As you would expect from similar libraries, every term that changes the configuration of a schematic, or combines schematics together will create a new schematic instance.

<!-- @Prompt -->
In the first example on screen, you can see how we've taken a schematic from the previous slide, `isShout`, and we've disabled one of it's sub-validations. There are couple of examples that showcase the different signatures one can use when configuring a term.

<!-- @Prompt -->
Sub validation terms can take a single false boolean, which disables it, so 'isShout' becomes 'isRaisedVoice' because it is no longer uppercase and simply must end with an exclamation mark. 

<!-- @Prompt -->
Many sub validation terms don't require a configuration, so they can be passed a true boolean or just called without any arguments to enable them. And many sub validation terms, such as `startsWith` require some configuration input. 

<!-- @Prompt -->
In the last example you can see how an explicit configuration object can be passed in as well. A lot of signatures are available for developer experience and readability.

<!-- @CenterHeader -->
#Readonly Modifier
<!-- @Section -->

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

<!-- @Prompt -->
is-ts is intended to have terms and naming conventions that would be familiar to typescript developers. I've re-used a lot of names from utility types where functionality applies.

<!-- @Prompt -->
Many terms are only available when composing specific types, such as string specific terms or number specific terms, but the readonly modifier is available generally everywhere.

<!-- @Prompt -->
In the first example, you can see that we've declared both properties on the Todo shape as readonly, either as a prefix or suffix, functionally they do the same thing.

<!-- @Prompt -->
In the second example, instead of defining each individual term as readonly, we've made the entire shape readonly. Functionally this does the same thing as the first example, I'm just showcasing the intuitive and composable nature of the terms.

<!-- @CenterHeader -->
Optional Modifier
<!-- @Section -->

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

<!-- @Prompt -->
Like the previous example, properties in a shape can be made optional, and the optional modifier is equivalently liberal with where it can be declared.

<!-- @Prompt -->
In the second example, we're using the partial property on the shape in order to make all of it's properties optional, much like how you'd expect the Partial utility method to work. In this example, the .partial property is only available on shape schematics, so it can't prefixed, only suffixed.

<!-- @Prompt -->
We *can* use the optional modifier on the shape as well, but as one would expect, that makes the entire value optional, rather than each individual property.

<!-- @CenterHeader -->
Required / Writable Terms

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

<!-- @Prompt -->
The examples on screen are contrived, but they showcase that modifiers can be removed just like sub validations can.

<!-- @Prompt -->
You can see that an optional string could made required, or a readonly array could be made mutable. All modifiers are removable.

<!-- @CenterHeader -->
Not Modifier

Validations can be negated:

```ts
const isLiquidTemp = is.number.min(0).max(100)
expect(() =    <!-- @Prompt -->
    isLiquidTemp.assert(125)).toThrow('must be below or equal 100')
expect(() =    <!-- @Prompt -->
    is.not(isLiquidTemp).assert(125)).not.toThrow()
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

<!-- @Prompt -->
The not modifier simply negates a validation. Unfortunately, it's not very useful by itself as a type guard, because negative type guards haven't been made possible to write. 

<!-- @Prompt -->
One would just use the negate operator in an expression before a type-guard in order to exclude types from an input set rather than extract them.

<!-- @Prompt -->
But the not modifier can still be useful for property validations or unions. Say you're parsing some json, and you'll take any value that ISN'T a boolean or a number, or some specific value, for example.

<!-- @Prompt -->
I'd also like to showcase how the not operator can be removed, because I think it's funny. It's not-not a vector? Great, so it's a vector. Ha-ha.

<!-- @CenterHeader -->
Shape Pick
<!-- @Section -->

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

<!-- @Prompt -->
I'm going to quickly showcase some other utility methods available on shape schematics, but that's only because it took a lot of iteration to get the types to work with acceptable performance in the IDE.

<!-- @Prompt -->
One thing I'd like to address with this library, is that many of the other validation libraries with static type inference invariably depend on recursive conditionals, which can lead to a great deal of type instantiation and slow the typescript language serve down considerably. My library is decent, but there is still more optimization to be done. The modifier stack I've come up with alleviates a lot of the pressure.

<!-- @Prompt -->
Shape.pick, like the `Pick` utility type, creates a new shape from a subset of given properties. In the first example, you can see that we've defined a 'Person' type, and in the second we extract a new type that only consists of the name properties.

<!-- @CenterHeader -->
Shape Omit 

Much like the `Omit` utility method, a new shape can be created by defining *exclusive* property keys:

```ts
const isAnonymous = isPerson.omit('firstName', 'lastName', 'title')

isAnonymous.type satisfies {
    readonly age: number,
    readonly gender?: string
}
```

    <!-- @Prompt -->
    Shape.omit, like the `Omit` utility type, creates a new shape from an *exclusive* subset of given properties.

<!-- @CenterHeader -->
Shape And
<!-- @Section -->

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

<!-- @Prompt -->
Typically, the `.and` term would create an intersection of validators, but in the case of a shape it's smart enough to merge properties of shapes together, which makes it easier to work with.

<!-- @CenterHeader -->
Shape Property 
<!-- @Section -->

Make changes to individual properties on a shape:

```ts
const isAdult = isPerson.property('age', age =    <!-- @Prompt -->
    age.min(19))
```

A property can be replaced with another type:
```ts
const isDoctor = isPerson
    .property('title', () =    <!-- @Prompt -->
    is('Md', 'Phd'))

isDoctor.type satisfies {
    readonly firstName: string,
    readonly lastName: string,
    readonly title: 'Md' | 'Phd',
    readonly age: number,
    readonly gender?: string,
}
```

<!-- @Prompt -->
The `.property` term allows one to make single property changes to a shape, using the previous property as input. Handy if you want to change the configuration or add modifiers to a specific property.

<!-- @Prompt -->
In the example, we've converted a person type into a doctor type by changing the title property into a union of two doctorate prefixes and making it no longer optional.

<!-- @CenterHeader -->
Shape Partial
<!-- @Section -->

Make all properties on a given shape optional:

```ts
const isPersonData = isPerson.partial

isPersonData.type satisfies Partial<typeof isPerson.type>
```

<!-- @Prompt -->
The `.partial` term is an analog to the Partial utility type, makes all of the properties on a given shape partial.

<!-- @CenterHeader -->
Shape Strict 

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

An alternative, if the goal is to create a shape with an index signature:

```ts
const isVectorLike = is
    .recordOf(is.string, is.number)
    .and(isVector)
```

<!-- @Prompt -->
By default, a shape will validate properties it has definitions for and ignore the rest. This is consistent with typescript's design goals, but is undesirable when sanitizing input, so the strict term can be applied to prevent additional properties from passing validation.

>

<!-- @CenterHeader -->
Is Signatures 
<!-- @Section -->

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

<!-- @Prompt -->
I'm going to briefly showcase some of the signatures on the is method. In the first example, you can see it's possible to supply literals to create schematics for exact values.

<!-- @Prompt -->
In the second example you can see that instead of using the .or term we can provide multiple inputs to create a union.

<!-- @Prompt -->
I think the `.or` term is generally preferable for readability, but in this case, I think it's very clear that I'm describing a discriminated union.

<!-- @CenterHeader -->
# More Is Signatures
<!-- @Section -->

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

<!-- @Prompt -->
Existing constructors can be dropped in to create schematics that validate instances, in the first example we've created an instanceOf `Foo` schematic.

<!-- @Prompt -->
One passes in an object to make shapes, but one can also pass in an array to make tuple schematics. All of this is possible thanks to the new const argument modifier, otherwise we'd have to be dropping in const keywords all over the place.

<!-- @CenterHeader -->
Schematic Validation

```ts
export const isRecord = is({ 
    _id: isObjectIdString.cast(i =    <!-- @Prompt -->
    `${i}`).readonly
})
```

```ts
const isTimeStamp = is.date.default(Date.now)

export const isTimeStamps = is({
    created: isTimeStamp,
    updated: isTimeStamp,
    removed: is.date.or.null
})
```

```ts
export const isUserData = is({
    firstName: is.optional.string,
    lastName: is.optional.string,

    age: is.optional.number.positive(),
    email: is.string.email(),

    role: is('admin', 'manager', 'contractor', 'client'),
}).strict(true)

export const isUserUpdateData = isUserData.partial

export const isUser =
    isUserData
        .and(isTimeStamps)
        .and(isRecord)
        .readonly
```

<!-- @Prompt -->
Here's an example of how some schemas may or may not be set up in a backend I'm building for a different project. 

<!-- @Prompt -->
There's a couple of schematics at the top isRecord and isTimeStamps, that could be consumed by other document types.

<!-- @Prompt -->
Then there's the user data schematic which defines data that is specific to a user, this would be used elsewhere in business logic to validate input data for a user being created. 

<!-- @Prompt -->
There's a user update schematic, which would would be used elsewhere to validate data for a user being updated. It's the create user schematic made partial.

<!-- @Prompt -->
Finally, the user record schematic itself, which combines readonly user data and timestamps and id's that would be filled on the backend.

<!-- @Prompt -->
Now, obviously I'm biased, but I find these definitions easier to read that the ones provided by, for example, ts-json-schema. Also easier to extend and change.

<!-- @CenterHeader -->
is-ts
<!-- @Section -->

Shortcuts for built in types:
```ts
is.error.or.function.or.object.or.weakmap.or.weakset.or.promise
```

Custom Validations:
```ts
const isRange = is.readonly([ is.number.finite(), is.number.finite() ])
    .asserts(([min, max]) =    <!-- @Prompt -->
    min <= max, 'min must be below or equal max')

isRange.type satisfies readonly [ number, number ]
```

Key Signatures:
```ts
const isPhoneBook = is.record.of(
    is.string.format<`#${number}`>(/^#\d{7}$/),
    is({
        firstName: is.string,
        lastName: is.string
    }, {
        businessName: is.string
    })
)

isPhoneBook.type satisfies Record<
    `#${number}`,
    {
        firstName: string,
        lastName: string
    } | {
        businessName: string
    }
>
```

Generics:
```ts
const isRef = <T extends Is>(
        schematic: T
    ): Is<Shape<{ current: T['validate'] }>    <!-- @Prompt -->
    =    <!-- @Prompt -->
    

        is({
            current: schematic  
        })

const isStringRef = isRef(is.string)

isStringRef.type satisfies { current: string }
```

<!-- @Prompt -->
And that is a brief overview of many features `is-ts` will have when it is complete. Now that you know what it is, let me talk about how I built it. Any questions before I continue?