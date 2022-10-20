import { Compile } from './types'

/*** Eslint ***/

/* 
    eslint-disable 
        @typescript-eslint/no-explicit-any,
        @typescript-eslint/explicit-function-return-type
*/

/*** Shortcuts ***/

const { 
    entries,
    defineProperty, 
    getOwnPropertyDescriptors: getDescriptors 
} = Object

/*** Constants ***/

const INVALID_DEFINED_STATIC_NAMES = [
    'prototype', 'name', 'length', 'create'
] as const

type InvalidDefinedStaticNames = typeof INVALID_DEFINED_STATIC_NAMES[number]

/*** Types ***/

type StructDefinition = new (...args: any[]) => any

type StructDefaultStatics<C extends StructDefinition> = {
    create(...args: ConstructorParameters<C>): Compile<InstanceType<C>> 
}

type StructDefinedStatics<C extends StructDefinition> = {
    [K in keyof C as K extends InvalidDefinedStaticNames ? never : K]: C[K]
}

type StructDefined<C extends StructDefinition> = 
    StructDefaultStatics<C> & 
    StructDefinedStatics<C> 

/*** Helper ***/

const createDefaultStatics = <C extends StructDefinition>(
    Constructor: C
): StructDefaultStatics<C> => ({
    
    create(...params: ConstructorParameters<C>) {

        const { ...instance } = new Constructor(...params)

        const instanceProperties = getDescriptors(Constructor.prototype)
        for (const name in instanceProperties) {
            if (name === 'constructor')
                continue

            const instancePropertyDescriptor = instanceProperties[name]

            defineProperty(
                instance, 
                name, 
                instancePropertyDescriptor
            )
        }

        return instance
    }
})

const addDefinedStatics = <C extends StructDefinition>(
    Constructor: C, 
    struct: StructDefaultStatics<C>
) => 
    entries(getDescriptors(Constructor))
        .reduce((struct, [name, descriptor]) => {

            if (!INVALID_DEFINED_STATIC_NAMES.includes(name as InvalidDefinedStaticNames))
                defineProperty(struct, name, descriptor)

            return struct
        }, struct) as StructDefined<C>

/*** Main ***/

/**
 * Utility for defining non-extendable plain objects with class syntax
 */
const Struct = {

    define<C extends StructDefinition>(Constructor: C): Compile<StructDefined<C>> {

        const struct = addDefinedStatics(
            Constructor, 
            createDefaultStatics(Constructor)
        )

        return struct as Compile<StructDefined<C>>

    }

} as const

/*** Exports ***/

export default Struct 

export {
    Struct
}