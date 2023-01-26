// import { Schema } from './schema'

// import { test, it, expect, describe } from '@jest/globals'

// import { expectTypeOf } from 'expect-type'
// import { Empty } from '@benzed/util'

// //// EsLint ////

// /* eslint-disable 
//     @typescript-eslint/ban-types
// */

// //// Tests ////

// test('siganture refactor', () => {
    
//     const schema = new Schema({
//         isValid(input: unknown): input is boolean {
//             return typeof input === 'boolean'
//         },
//         transform(input: unknown) {
//             return !!input
//         }
//     })

//     expectTypeOf(schema)
//         .toMatchTypeOf<Schema<unknown, boolean, Empty>>()

// })
