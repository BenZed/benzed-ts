import { RecordStruct } from './record-struct'

import { test } from '@jest/globals'
import { applyState, getState } from '../state'

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

describe('getState', () => {

    const tree = new RecordStruct({
        chase: new RecordStruct({
            detail: new RecordStruct({
                one: 1,
                two: 2,
                three: 3
            })
        })
    })

    it('gets state at path', () => {
        expect(getState(tree, 'chase', 'detail', 'one')).toEqual(1)
        expect(getState(tree, 'chase', 'detail', 'two')).toEqual(2)
        expect(getState(tree, 'chase', 'detail', 'three')).toEqual(3)
        expect(getState(tree, 'chase', 'detail')).toEqual({
            one: 1,
            two: 2,
            three: 3
        })
        expect(getState(tree, 'chase')).toEqual({
            detail: {
                one: 1,
                two: 2,
                three: 3
            }
        })
        expect(getState(tree)).toEqual({
            chase: {
                detail: {
                    one: 1,
                    two: 2,
                    three: 3
                }
            }
        })
    })
})