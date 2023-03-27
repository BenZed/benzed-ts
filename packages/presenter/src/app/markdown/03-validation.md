# Validation

### [@benzed/schema](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/schema)

```ts
/**
 * The validate method takes an input an optionally a set of validate options and
 * either returns a valid output or throws a validation error.
 */
export interface Validate<I, O = I    <!-- @Prompt -->
    {
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
    <!-- @Prompt -->
    So here we are, in the @benzed/schema library. The schema library defines the behavior of validators, provides templates for different validator types, and provides schematic structures to combine them together.

    <!-- @Prompt -->
    Declaring and chaining schematics into an expressive syntax is the responsibility of the `is-ts` library, all the actual validation logic is happening in here.

    <!-- @Prompt -->
    What we're looking at here are the first two interfaces related to validation. First, the Validate method. It takes an input, typically `unknown`, and optionally a validation options object. It will return a valid output or it will throw a validation error.

    <!-- @Prompt -->
    Currently there is only one property in the `ValidateOptions` interface that's relevant to end users: The `transform` option.

# Transformation

### [@benzed/schema](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/schema/src/validate.ts)


    <!-- @Prompt -->
    Transformations are what separate an assertion from a validation. Let's go back to `is-ts` for a quick example.

    <!-- @Prompt -->
    So here we have a very basic schematic: isTrimmedString. We want to be able to perform three distinct operations with this validator:

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
expect(() =    <!-- @Prompt -->
    isTrimmedString.assert(' ace ')).toThrow('no whitespace allowed')
expect(() =    <!-- @Prompt -->
    isTrimmedString.assert('ace')).not.toThrow()

// validation 
expect(isTrimmedString.validate(' ace ')).toBe('ace')
```

    <!-- @Prompt -->
    We want to check if a given value *is* a trimmed string, a type guard
    <!-- @Prompt -->
    We want to `assert` that a given value is a trimmed string, a type assertion
    <!-- @Prompt -->
    We want to get a valid trimmed string from a given input. The transform option is what separates the first two operations from the latter, as transformations will attempt to convert invalid data into valid data, and will throw an error if the transformation fails.
    <!-- @Prompt -->
    Internally, all three operations are using validation options. `type-guards` and `type-assertions` validate with transformations disabled, validations do so with transformations `enabled`. 
    <!-- @Prompt -->
    You can see our operations passing the tests you'd expect them to in the second example. " ace " with whitespace around it is *not* a trimmed string, so the type guard shouldn't pass and a type assertion should throw, but it's easy to convert it into a trimmed string, so a validation *should* pass.

# Analyze

### [@benzed/schema/validate](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/schema/src/validate.ts)

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

    <!-- @Prompt -->
    Now you might expect the @benzed/schema library to be full of a large number of Validate definitions, but in fact, there is only one in the entire repository and this is it:

    <!-- @Prompt -->
    The analyze function. Validations are conducted by creating a validation context out of an input and validation options.

    <!-- @Prompt -->
    This context is then fed into a symbolic analyze method that's attached to a Validator, which is a distinct structure from a Validate function, that you're going to see in a second.

    <!-- @Prompt -->
    I'm not going to too much into ValidationContext, because it involves more traits as the ones I've describes so far, but basically it's a persistent state that allows validations and sub validations to be conducted without errors being thrown until they're relevant. 

    <!-- @Prompt -->
    For large nested objects such as shapes, we don't want validation to terminate after it encounters a single error, we want all the errors. 

    <!-- @Prompt -->
    ValidationContext is also beneficial for implementing modifiers and other validation related mutations.

# Validator 

### [@benzed/schema/validator](https://github.com/BenZed/benzed-ts/tree/is-presentation/packages/schema/validator/validator.ts)


```ts
export interface Validator<I, O = I    <!-- @Prompt -->
    extends Structural, Callable<Validate<I,O>    <!-- @Prompt -->
    {

    [$$analyze](ctx: ValidationContext<I, O>): ValidationContext<I, O>

}
```

    <!-- @Prompt -->
    Behold, the Validator. The definition you see here is highly abridged from the actual one, but in short, the Validator class consumes the Structural and Callable traits and uses the aforementioned analyze method as it's callable signature.

    <!-- @Prompt -->
    This is the bedrock base class of the `schema-ts` and `is-ts` libraries. If one where to create their own validator and want it to be compatible with `is-ts`, this is the class they would extend.

    <!-- @Prompt -->
    Extended classes must implement the symbolic analyze method which receives a ValidationContext. Analyze methods manipulate this context, adding sub contexts, errors or output, and then returning that context. The analyze method is where all the magic happens.

# Validator Types

### Scalar Value Validators
- `Contract`
    - `Instance`
    - `Type`
    - `Value`
### Compound Validators
- `Shape`
- `Tuple`
- `Pipe`
- `PipeBuilder`
### Mutation Validators 
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
### Schematics
- `Schema`
- `SchemaBuilder`

    <!-- @Prompt -->
    @benzed/schema defines many Validator types. These Validator types were built with `is-ts` and it's fluid syntax in mind, but they're abstract and agnostic enough that they could be consumed for other purposes. 

    <!-- @Prompt -->
    We've your Scalar Value Validators, which you'd use to create schematics for strings, booleans, integers, ect. 

    <!-- @Prompt -->
    We've got your Compound Validators, which you'd use to validate structures that have sub properties, such as shapes and tuples

    <!-- @Prompt -->
    We've got your Mutation validators, which target other validators, inherit their properties and change their analyzation behavior, such as Readonly, Optional, Not, etc. 

    <!-- @Prompt -->
    Then we have your Schematics, which are structures that allow validators to be immutably configured. By themselves, validators do not have any builder pattern methods. They'll have their state and and their validation behavior and that's it. Schematics are what provide validators with the configuration terms we saw in `is-ts` at the beginning of this presentation. Every term in `is-ts` is either a schematic, or a modifier targeting one.

    <!-- @Prompt -->
    I am not going to give an exhaustive explanation of every single validator type, that would be time prohibitive and I feel like I've made this presentation too long anyway, but I'll show you what I feel is the most important one.

# Contract Validator 

### [@benzed/schema/contract-validator](https://github.com/BenZed/benzed-ts/blob/is-presentation/packages/schema/src/validator/validators/contract-validator.ts)


```ts
abstract class ContractValidator<I = any, O = I    <!-- @Prompt -->
    extends Validator<I,O    <!-- @Prompt -->
    {

    isValid(input: I | O, ctx: ValidationContext<I,O>): boolean {
        return equals(input, ctx.transformed)
    }

    transform?(input: I, ctx: ValidationContext<I,O>): I | O

    message(input: I, ctx: ValidationContext<I,O>): string {
        void input
        void ctx
        return `must be ${this.name}`
    }

    override get name(): string {
        return this.constructor.name.replace('Validator', '')
    }

    //// Analyze ////

    [Validator.analyze](ctx: ValidationContext<I,O>): ValidationContext<I,O    <!-- @Prompt -->
    {

        if (this.transform)
            ctx.transformed = this.transform(ctx.input, ctx)

        // Determine output
        const output = ctx.transform 
            ? ctx.transformed
            : ctx.input

        // Apply result
        return this.isValid(output, ctx)
            ? ctx.setOutput(output as O)
            : ctx.setError(
                this.message(ctx.input, ctx)
            )
    }

    get [Validator.state](): Pick<this, 'message' | 'name'    <!-- @Prompt -->
    {
        return pick(this, 'message', 'name')
    }
}
```

    <!-- @Prompt -->
    The Contract Validator has an extremely versatile analyze implementation. The Contract validator and it's extensions are the ones that developers are interacting with most.

    <!-- @Prompt -->
    Recalling the concept of transformations in validations, one of the aspects of the analyze method and the validation context, is that transformations are always conducted, weather or not the transform option is enabled.

    <!-- @Prompt -->
    Validators are not obligated to transform values, but if they *do*, the context will execute the transformation and store it in the `context.transformed` property. If transformations are enabled, the context will use the transformed property as output, otherwise it will use the input as output.

    <!-- @Prompt -->
    The Contract Validator defines an 'isValid' method, which takes an input, a validation context and returns a boolean. True if the value is valid, false if the value is not, very simple. 

    <!-- @Prompt -->
    The key to the Contract Validator's versatility is the default implementation of ths `isValid` method is to check if the input is deep equal to the transformed value using the @benzed/immutable equality implementation. The implication of this is that a large number of validations can easily be created by giving a contract validator a transform method. I'll show you what this means.

# Custom Contract Validations

### [@benzed/schema/contract-validator](https://github.com/BenZed/benzed-ts/blob/is-presentation/packages/schema/src/validator/validators/contract-validator.ts)

```ts
import { is } from '@benzed/is'

const isDashCase = is.string.transforms(
    str =    <!-- @Prompt -->
    str.replaceAll(' ', '-'), 
    'must be dash cased'
)

/// equivalent to 

class DashCase extends ContractValidator<string, string    <!-- @Prompt -->
    {
    transform(input: string) {
        return input.replaceAll(' ', '-')
    }

    override message() {
        return `must be dash cased`
    }
}

const isDashCase = is.string.validates(new DashCase())
```

```ts
expect(isDashCase('look-at-me-hector')).toBe(true)
expect(isDashCase('look at me hector')).toBe(false)

expect(() =    <!-- @Prompt -->
    isDashCase.assert('look-at-me-hector')).not.toThrow()
expect(() =    <!-- @Prompt -->
    isDashCase.assert('look at me hector')).toThrow('must be dash cased')

expect(isDashCase.validate('look at me hector')).toEqual('look-at-me-hector')
```

```ts
const isPath = is
    .string
    .trim()
    .startsWith('/')
    .transforms(
        s =    <!-- @Prompt -->
    s.replace(/\/+/g, '/'), 
        'must not have multiple consecutive "/"s'
    )
    .transforms(
        s =    <!-- @Prompt -->
    s.replace(/\/$/, '') || '/',
        //                            ^ in case we just removed the last slash
        'must not end with a "/"'
    )
```

    <!-- @Prompt -->
    To illustrate this, I'm going to take us back to @benzed/is. Most schematics on @benzed/is have the pipe builder interface, which allows custom validators to be added to a schematic. The pipe builder interface has three methods: `asserts`, `transforms` and `validates`

    <!-- @Prompt -->
    What one is doing when calling the `transforms` method is defining a transform to be applied to a contract validator, as well as optionally an error message.

    <!-- @Prompt -->
    You can see in the top example what this looks like. By only defining a dash-case transformation, the default implementation of the isValid method allows our validator to fulfill all three aspects of our validation trifecta in one fell swoop:

    <!-- @Prompt -->
    If we're type guarding or asserting a given string, the analyze method will transform it to dash case. If the input matches the transformation, it is valid, otherwise it is not. If we're validating a non dash cased string, it gets transformed into the format we want. 

    <!-- @Prompt -->
    In the third example, I've got an actual schematic that I'm using in an actual server backend to define a path structure for matching. You can see that by combining canned sub validations and custom validations, we can quickly define a schematic that validates complex data. 

# Chaining it all together 

### [@benzed/is/contract-validator](https://github.com/BenZed/benzed-ts/blob/is-presentation/packages/is/src/to/to.ts)

```ts

declare class To<F extends From, M extends ModifierType[]    <!-- @Prompt -->
    
    extends Trait.use(Callable<ToSignature<F,M>>, Mutate<Validator>) {

    /**
     * @internal
     */
    readonly _from: F

    /**
     * @internal
     */
    readonly _modifiers: M

    //// Primitives ////

    get string(): IsTo<F, M, [String]    <!-- @Prompt -->
    
    get boolean(): IsTo<F, M, [Boolean]    <!-- @Prompt -->
    
    get number(): IsTo<F, M, [Number]    <!-- @Prompt -->
    
    get integer(): IsTo<F, M, [Integer]>
    get bigint(): IsTo<F, M, [BigInt]    <!-- @Prompt -->
    

    //// Falsy Primitives ////

    get null(): IsTo<F, M, [Null]>
    get undefined(): IsTo<F, M, [Undefined]>
    get nan(): IsTo<F, M, [NaN]    <!-- @Prompt -->
    

    get date(): IsTo<F, M, [Date]>
    get error(): IsTo<F, M, [Error]    <!-- @Prompt -->
    
    get promise(): IsTo<F, M, [Promise]    <!-- @Prompt -->
    

    get regexp(): IsTo<F, M, [RegExp]>
    get weakmap(): IsTo<F, M, [WeakMap]>
    get weakset(): IsTo<F, M, [WeakSet]>

    // Ts Types 

    get object(): IsTo<F, M, [Obj]    <!-- @Prompt -->
    
    get function(): IsTo<F, M, [Function]>
    get unknown(): IsTo<F, M, [Unknown]    <!-- @Prompt -->
    
    shape<T extends ResolveShapeValidatorInput>(
        shape: T
    ): IsTo<F, M, [ResolveValidator<[T]>]>

    tuple<T extends ResolveValidatorsInput>(
        ...inputs: T
    ): IsTo<F,M,[Tuple<ResolveValidators<T>>]    <!-- @Prompt -->
    

    instanceOf<T extends InstanceInput>(
        constructor: T
    ): IsTo<F, M, [InstanceOf<InstanceType<T>>]>

    get array(): IsTo<F,M,[Array]>

    arrayOf<T extends ResolveValidatorsInput>(...inputs: T): IsTo<F, M, [ArrayOf<ResolveValidator<T>>]>

    get record(): IsTo<F,M,[Record]>

    recordOf<K extends Key, V extends ResolveValidatorInput>(
        key: K | Is<K>, 
        value: V
    ): IsTo<F, M, [RecordOf<K, ResolveValidator<[V]>>]>
    recordOf<V extends ResolveValidatorInput>(
        value: V
    ): IsTo<F, M, [RecordOf<Key, ResolveValidator<[V]>>]>

    get set(): IsTo<F,M,[Set]    <!-- @Prompt -->
    
    setOf<V extends ResolveValidatorInput>(
        input: V
    ): IsTo<F, M, [SetOf<ResolveValidator<[V]>>]    <!-- @Prompt -->
    

    get map(): IsTo<F,M,[Map]    <!-- @Prompt -->
    
    mapOf<K extends Key, V extends ResolveValidatorInput>(
        key: K | Is<K>, 
        value: V
    ): IsTo<F, M, [SetOf<ResolveValidator<[V]>>]    <!-- @Prompt -->
    

    get not(): IsTo<F, [...M, ModifierType.Not], []>
    get optional(): IsTo<F, [...M, ModifierType.Optional], []>
    get readonly(): IsTo<F, [...M, ModifierType.ReadOnly], []>

}

```

    <!-- @Prompt -->
    Now, I haven't gotten to describing the `is-ts` repository yet, but an in depth description of it would be time prohibitive.

    <!-- @Prompt -->
    Most of what happens in the `is-ts` library is taking the abstract schematics and validators that exist in the `@benzed/schema` library and extending them to define the actual schematics that `is-ts` uses. Such as `string` and all of it's sub validators `startsWith`, `includes`, `format`, etcetera. 

    <!-- @Prompt -->
    The most interesting thing that `is-ts` does is the chaining. This chaining involves a lot of type trickery, and is going to have another round of iteration before release, but I'll take you through a high level overview.

    <!-- @Prompt -->
    Any part of the `is` interface that allows chaining from one type to another is actually an instance of this `To` mutator class. *blah blah blah*