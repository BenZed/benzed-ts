# What is @benzed/schema

@benzed schema contains a series of interfaces to deal with data validation.

Validation basically involes three concepts:
- **`transform`**-ing data from a one type to another
- determining if data **`is`** of an expected type
- **`assert`**-ing that data is of an expected type

A transformation is simple:
```ts 

/**
 * Transform an input into an expected output.
 */
interface Transform<I,O> {
    (input: I): O
}

```

A common transformation example: Deserializing data that had been saved in some persistent state: 

```ts
    const deserialize: Transform<string, Json> = (i) => JSON.parse(i)
```

Transforms take only a single input argument and are always syncronous.

Transformations can fail. In the case of `JSON.parse`, it will throw an error if the given string is nonsense, and doesn't describe any `Json` data. On it's own, `JSON.parse` demonstrates two facets data validation:

- **`transforms`**: ✅ 
- **`asserts`**: ✅ 
- **`is`**: ❌

To complete the trifecta, we'd need another method to determine weather or not a given string is JSON parseable.

```ts
    const isDeserializable = (input: string): boolean => {
        try {
            void deserialize(input)
            return true
        } catch {
            return false
        }
    }
```

Quite simply, if the input string cannot be converted into `JSON` without failing, it must not be serializable. With these two methods, we can handle any aspect of data validation concerning strings to Json:

```ts

expect(() => deserialize(`<xml>Not Json</xml>`)).toThrow() // asserts ✅ 
expect(deserialize(`{ "json": true }`)).toEqual({ json: true }) // transforms ✅ 
expect(isDeserializable(`{ "json": true }`)).toBe(true) // is ✅ 

```

Handy, but we can't just check if a transformation fails every time to determine if data is valid: 

```ts

const lowerCaseString = (input: unknown): string => {
    if (typeof input !== 'string')
        throw new Error(`Must be a string.`)
    return input.toLowerCase()
}

const isLowerCaseString = (input: unknown): boolean => {
    try {
        void lowerCaseString(input)
        return true
    } catch {
        return false
    }
}

expect(lowerCaseString('Ace')).toBe('ace') // ✅
expect(() => lowerCaseString(0)).toThrow() // ✅
expect(isLowerCaseString('ace')).toBe(true) // ✅
expect(isLowerCaseString('Ace')).toBe(true) // ❌
```

Our `isLowerCaseString` method would ALSO have to check if the string is lower case:

```ts

const isLowerCaseString = (input: unknown): boolean => {
    try {
        const output = lowerCaseString(input)
        // effectively, we need to re-apply the transformation:
        return output === output.toLowerCase()
    } catch {
        return false
    }
}

expect(isLowerCaseString(0)).toBe(false) // ✅
expect(isLowerCaseString('Ace')).toBe(false) // ✅
expect(isLowerCaseString('ace')).toBe(true) // ✅
```

On top of that, we also can't make assertions from this transform alone. We need to write yet another method to assert that a given value is a lower case string: 

```ts
const assertLowerCaseString = (input: unknown): void => {
    if (!isLowerCaseString(input))
        throw new Error(`Must be a lower case string`)
}

expect(() => assertLowerCaseString('ace')).not.toThrow() // ✅ 
expect(() => assertLowerCaseString(0)).toThrow() // ✅ 
expect(() => assertLowerCaseString('Ace')).toThrow() // ✅ 
```

How about a structure that can help?

## Validate

```ts

interface ValidateOptions {

    /**
     * True if transformations are to be applied to this
     * validation, false if not.
     */
    transform: boolean
}

interface Validate<I, O extends I = I> {
    (input: I, options?: ValidateOptions): O
}

```

The validate contract:

1) A validator is called with an input and an option to apply **`transform`**-ations
    to that input. Transformations are enabled by default.

2) If transformations are disabled, the validator will throw a validation error
    if the input **`is`** not a valid output.

3) If transformations are enabled, the validator will attempt to transform an
    input into an expected output. If that transformation fails, the validator
    will throw a validation error, **`assert`**-ing that the input data is invalid. 

Example:
```ts
const lowerCaseString = (input: string, options: ValidateOptions = { transform: true }): string => {

    const transformed = input.toLowerCase()
    const output = options.transform 
        ? transformed
        : input 

    if (output !== transformed)
        throw new Error(`${String(input)} must be in lower case.`)

    return transformed
}

```

Okay, we have a `lowerCaseString` validator, but we'd still need to write additional methods to convert errors into data:

```ts 

type TypeGuard<I,O> = (i: I) => i is O 
const toTypeGuard = <I,O extends I>(validate: Validate<I,O>) => 
    (i: I): i is O => {
        try {
            validate(i, { transform: false })
            return true
        } catch {
            return false
        }
    }

type TypeAssertion<I,O> = (i: I) => asserts i is O
const toTypeAssertion = <I,O extends I>(validate: Validate<I,O>) => (i: I): asserts i is O => {
    void validate(i, { transform: false })
}

```

With these utility methods, we now have fully typed support for the validation trifecta for `any` validator we write:

```ts

const isLowerCaseString = toTypeGuard(lowerCaseString)
const assertLowerCaseString: TypeAssertion<I,O> = toTypeAssertion(lowerCaseString)
//                           ^ currently, type assertions need to be explicitly declared.

expect(lowerCaseString('Ace')).toEqual('ace') // ✅

expect(isLowerCaseString(/not-string/)).toEqual(false) // ✅
expect(isLowerCaseString('NotLowerCase')).toEqual(false) // ✅
expect(isLowerCaseString(Symbol('not-string'))).toEqual(false) // ✅

expect(() => assertLowerCaseString('ace')).not.toThrow() // ✅
expect(() => assertLowerCaseString(0)).toThrow(`Must be a string.`) // ✅
expect(() => assertLowerCaseString('Ace')).toThrow(`"Ace" must be in lower case.`) // ✅
```

Handy, but it would be prefereable to not to have to export three methods for every type of validation we write.

Also, what about validation that *demands* a transformation from one type to another, such as our `deserialize` method?

Or what about validation that doesn't involve transformations *at all*?

How about a structure that can help? 

## Validator 

