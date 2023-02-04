import { PipeSchema } from './pipe-schema'

import { ValidatorStruct } from '../../validator-struct'

import { it, describe } from '@jest/globals'

import { expectTypeOf } from 'expect-type'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Tests ////

describe('pipe schema setters', () => {

    it('creates option setters for every validator in the pipe', () => {

        type String = ValidatorStruct<unknown, string> & { cast: boolean }

        type Path = ValidatorStruct<string, `/${string}`> & { protocol: string }

        type StringToPath = PipeSchema<[String, Path]>

        expectTypeOf<StringToPath['cast']>()    
            .toEqualTypeOf<(cast: boolean) => PipeSchema<[String, Path]>>()
    })

})