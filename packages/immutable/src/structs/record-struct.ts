import { assign, GenericObject } from '@benzed/util'
import { $$state, StateFul } from '../state'
import Struct from '../struct'

//// Types ////

interface RecordStructConstructor {
    new <K extends string | symbol | number,V>(
        record: Record<K,V>
    ): RecordStruct<K,V>
}

type RecordStruct<K extends string | symbol | number, V> = 
    Record<K,V> & StateFul<Record<K,V>> & Struct

//// Main ////

/**
 * A record struct is simply a public struct with 
 * indexed key/values
 */
const RecordStruct = class RecordStruct extends Struct {

    constructor(record: GenericObject) {
        super()
        assign(this, record)
    }

    get [$$state](): object {
        return { ...this }
    }

} as RecordStructConstructor

//// Exports ////

export default RecordStruct 

export {
    RecordStruct
}