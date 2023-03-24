# Validation

### [@benzed/schema](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/schema)

```ts
/**
 * The validate method takes an input an optionally a set of validate options and
 * either returns a valid output or throws a validation error.
 */
export interface Validate<I, O = I> {
    (input: I, options?: ValidateOptions): O 
}
```

```ts
export interface ValidateOptions {

    /**
     * True if transformations are to be applied
     * during in the validation, false if not.
     */
    readonly transform?: boolean

}
```
> So here we are, in the @benzed/schema library. The schema library defines the behavior of validators, provides templates for different validator types, and provides schematic structures to combine them together.

> Declaring and chaining schematics into an expressive syntax is the responsibility of the `is-ts` library, all the actual validation logic is happening in here.

> What we're looking at here are the first two interfaces related to validation. First, the Validate method. It takes an input, typically `unknown`, and optionally a validation options object. It will return a valid output or it will throw a validation error.

> Currently there is only one property in the `ValidateOptions` interface that's relevant to end users: The `transform` option.

# Transformation

### [@benzed/schema](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/schema/validate.ts)


> Transformations are what separate an assertion from a validation. Let's go back to `is-ts` for a quick example.

> So here we have a very basic schematic: isTrimmedString. We want to be able to perform three distinct operations with this validator:

```ts
import is from '@benzed/is'

const isTrimmedString = is.string.trimmed('no whitespace allowed')

```

Three distinct operations of the `isTrimmedString` validator:
- Check if a given value `is` a trimmed string *Type Guard*
- `assert` that a given value is a trimmed string *Type Assertion*
- Get a trimmed string from a given input *Validation*

```ts

// type guard
expect(isTrimmedString(' ace ')).toBe(false)
expect(isTrimmedString('ace')).toBe(true)

// type assertion
expect(() => isTrimmedString.assert(' ace ')).toThrow('no whitespace allowed')
expect(() => isTrimmedString.assert('ace')).not.toThrow()

// validation 
expect(isTrimmedString.validate(' ace ')).toBe('ace')
```

> We want to check if a given value *is* a trimmed string, a type guard
> We want to `assert` that a given value is a trimmed string, a type assertion
> We want to get a valid trimmed string from a given input. The transform option is what separates the first two operations from the latter, as transformations will attempt to convert invalid data into valid data, and will throw an error if the transformation fails.
> Internally, all three operations are using validation options. `type-guards` and `type-assertions` validate with transformations disabled, validations do so with transformations `enabled`. 
> You can see our operations passing the tests you'd expect them to in the second example. " ace " with whitespace around it is *not* a trimmed string, so the type guard shouldn't pass and a type assertion should throw, but it's easy to convert it into a trimmed string, so a validation *should* pass.

# Analyze

### [@benzed/schema/validate](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/schema/validate.ts)

```ts

/**
 * Property key for implementations of the analyze method
 */
const $$analyze = Symbol('validation-analyze')

/**
 * Validations are conducted by creating a validation context out of an input
 * and validation options. 
 * 
 * Context is given to the scoped analyze method, which has logic to mutate 
 * the context by applying errors or output.
 * 
 * If the mutated context does not have an output, a validation error is thrown,
 * otherwise the output is returned.
 */
function analyze<I, O>(this: Validator<I,O>, input: I, options?: ValidateOptions): O {

    const ctx = this[$$analyze](
        new ValidationContext(input, options)
    )

    if (!ctx.hasValidOutput())
        throw new ValidationError(ctx)

    return ctx.getOutput()
}
```

> Now you might expect the @benzed/schema library to be full of a large number of Validate definitions, but in fact, there is only one in the entire repository and this is it:

> The analyze function. Validations are conducted by creating a validation context out of an input and validation options.

> This context is then fed into a symbolic analyze method that's attached to a Validator, which is a distinct structure from a Validate function, that you're going to see in a second.

> I'm not going to too much into ValidationContext, because it involves more traits as the ones I've describes so far, but basically it's a persistent state that allows validations and sub validations to be conducted without errors being thrown until they're relevant. 

> For large nested objects such as shapes, we don't want validation to terminate after it encounters a single error, we want all the errors. 

> ValidationContext is also beneficial for implementing modifiers and other validation related mutations.

# Validator 

### [@benzed/schema/validator](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/schema/validator/validator.ts)


```ts
export interface Validator<I, O = I> extends Structural, Callable<Validate<I,O>> {

    [$$analyze](ctx: ValidationContext<I, O>): ValidationContext<I, O>

}
```

> Behold, the Validator. The definition you see here is highly abridged from the actual one, but in short, the Validator class consumes the Structural and Callable traits and uses the aforementioned analyze method as it's callable signature.

> This is the bedrock base class of the `schema-ts` and `is-ts` libraries. If one where to create their own validator and want it to be compatible with `is-ts`, this is the class they would extend.

> Extended classes must implement the symbolic analyze method which receives a ValidationContext. Analyze methods manipulate this context, adding sub contexts, errors or output, and then returning that context. The analyze method is where all the magic happens.

# Validator Types

- ### Scalar Value Validators
    - `Contract`
        - `Instance`
        - `Type`
        - `Value`
- ### Compound Validators
    - `Shape`
    - `Tuple`
    - `Pipe`
    - `PipeBuilder`
- ### Mutation Validators 
    - `Readonly`
    - `Optional`
    - `Not`
    - `Intersect`
    - `Union`
    - `Of`
        - `Array`
        - `Map`
        - `Set`
        - `Record`
- ### Schematics
    - `Schema`
    - `SchemaBuilder`

> @benzed/schema defines many 