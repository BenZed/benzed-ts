import { RecordStruct } from './record-struct'

import { test } from '@jest/globals'
import { applyState } from '../../state'
import { getState } from '../..'

//// Tests ////

test(`${RecordStruct.name}`, () => {

    const record = new RecordStruct({
        x: 0,
        y: 0
    })
    expect(getState(record)).toEqual({ x: 0, y: 0 })

    const record2 = applyState(record, { x: 10 })
    expect(getState(record2)).toEqual({ x: 10, y: 0 })

})
