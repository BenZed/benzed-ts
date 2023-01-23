# What is @benzed/schema

@benzed schema contains a series of interfaces to deal with data validation.

Validation basically involes three concepts:
- **transform**ing data from a one type to another
- determining if data **is** of an expected type
- **assert**ing that data is of an expected type

A transformation is simple:
```ts 

/**
 * Transform an input into an expected output.
 */
interface Transform<I,O> {
    (input: I): O
}

```

A common transformation using JSON.parse to serialize data to be saved in some persistent state: 

```ts
    const serialize: Transform<string, Json> = (i) => JSON.parse(i)
```

Transforms take only a single input argument and are always syncronous.

Transformations inevitably fail. In the case of JSON.parse, it will throw an error if the given string is nonsense, and doesn't describe any JSON data. On it's own, JSON.parse takes care of two facets data validation:

- **transforms**: √
- **asserts**: √
- **is**: x

To complete the trifecta, we'd need another method to determine weather or not a given string is JSON.parseable.

```ts
    const isSerializable = (input: string): boolean => {
        try {
            void serialize(input)
            return true
        } catch {
            return false
        }
    }
```

Quite simply, if the input string cannot be converted into JSON without failing, it must not be serializable. With these two methods, we can handle any aspect of data validation strings to JSON objects.

How about one method to handle these concepts, instead of two:

# Validate

Presenting the Validate interface:

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

The validate method can fulfill the contract of all aspects of data validation at once:

1) A validator is called with an input and an option to apply **transform**ations
    to that input. Transformations are enabled by default.

2) If transformations are disabled, the validator will throw a validation error
    if the input **is** not a valid output.

3) If transfromations are enabled, the validator will attempt to transform an
    input into an expected output. If that transformation fails, the validator
    will throw a validation error, **assert**ing that the input data is invalid. 

Example:
```ts

const validateLowerCaseString = (input: unknown, options: ValidateOptions = { transform: true }): string => {

    // **Assert** that the input is the string
    if (typeof input !== 'string')
        throw new Error(`${String(input)} must be a string.`)

    // **Transform** the input
    const transformed = input.toLowerCase()

    // Use the transformation as output if transformations are allowed,
    // otherwise use the input
    const output = options.transform 
        ? transformed
        : input 

    // **Is** the output conforming to the expected output type?
    if (output !== transformed)
        throw new Error(`${String(input)} must be in lower case.`)

    return transformed
}

```

Since we're in typescript, let's be pro active and write some utility methods: 

```ts 

type TypeGuard<I,O> = (i: I) => i is O 
const toTypeGuard = <I,O extends I>(validate: Validate<I,O>) => (i: I): i is O => {
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

With these, we now have fully typed support for any data validation:

```ts 

const isLowerCase



```
