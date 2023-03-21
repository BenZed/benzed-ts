# Presenting *is-ts*

`is-ts` data validation library with a fluent syntax.

`is-ts` defines, identifies and transforms data.

```ts
import is from '@benzed/is'

const unknownValue = await someApi.getData()
```

**`is-ts`** creates type guards:

```ts
if (is.array.of.string(unknownValue))
    console.log(unknownValue.join(' '))
    // now typed as string[] ^
```

**`is-ts`** performs type assertions:

```ts
is.string.assert(unknownValue) // throws 'must be a string'
```

**`is-ts`** performs data validation:

```ts
is.string.validate(unknownValue) // throws 'must be a string'

const trimmed = is.string.trim().validate('  hello world  ')
console.log(trimmed) // >> 'hello world'
```
> is-ts is a yet-to-be-released library I've been building in type script. It allows developers to compose type guards, type asserters and data validation schematics with a fluent and intuitive api.

> This was born out of a couple of desires. There many typesafe validation libraries out there, and they all seem fine to me. I built one mainly because I've always wanted to. 

> When I first transitioned to type script, I was quite impressed with how the type system worked, even in comparison to existing strongly typed languages. There's a lot of interesting things you can do in typescript that you can't do in, for example, C#.

>

## Type Safety

Types created by composing schematics are extractable:
```ts
const isVector = is({ x: is.number, y: is.number })

type Vector = typeof isVector.type // { x: number, y: number }
```

Or validation can be created for existing types:
```ts
import { IsType } from '@benzed/is'

interface Vector {
    x: number,
    y: number
}

const isVector: IsType<Vector> = is({ x: is.number, y: is.number })
```
> It can be used to simultaneously define types and create their runtime checks.

> Or it could be used to create typesafe validation structures for existing types.

## Type Safety



## Inituitive API

**`is-ts`** uses typescript theory and conventions
```ts

```

## Fluency

Defining unions:

```ts

```