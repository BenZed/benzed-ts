import { 
    isArray as _isArray, 
    isString as _isString, 
    safeJsonParse, 
    TypeOf as OutputTypeOf
} from '@benzed/util'

import { ValidateContext } from '../../../../schema/src/validator'

import Schematic from '../../schematic'

import { 
    Unknown, 
    isUnknown,
} from '../type'

import { AnyTypeGuard, TypeOf } from './type-of'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type ArrayInput = AnyTypeGuard

//// Helper ////

function toArray(i: unknown): unknown {
    return _isString(i)
        ? safeJsonParse(i)
        : i
}

//// Types ////

class ArrayOf<T extends ArrayInput> extends TypeOf<T, OutputTypeOf<T>[]> {

    constructor(of: T) {

        super({

            of,

            name: 'array',

            is(i: unknown): i is OutputTypeOf<T>[] {
                return _isArray(i, this.of)
            },

            cast: toArray,

            transform(
                input: unknown, 
                ctx: ValidateContext<unknown>
            ): unknown {

                const { of } = this

                const o = _isArray(input) && Schematic.is(of)
                    ? input.map((value, i) => of.validate(value, { 
                        ...ctx,
                        value: value, 
                        path: [...ctx.path, i] 
                    } as ValidateContext<unknown>))
                    : input

                return o
            }
        })
    }
}

//// Exports ////

export default ArrayOf

export {
    toArray,
    ArrayOf
}

export interface Array extends ArrayOf<Unknown> {}
export const isArray: Array = new ArrayOf(isUnknown)