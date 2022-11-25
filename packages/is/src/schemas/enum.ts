import { schema, Schema } from '../schema'
import { validator } from '../validator'

interface EnumSchema<T> extends Schema<T> {
    
}

const enumValidator = validator({

    options: [] as unknown[],

    assert(input: unknown): boolean {
        return this.options.includes(input)
    }

})

const enumSchematic = schema({

})