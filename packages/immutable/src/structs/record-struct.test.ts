import { RecordStruct } from './record-struct'

import { test } from '@jest/globals'
import { Structural } from '../traits'

//// Tests ////

test('get state', () => {

    const record = new RecordStruct({
        a: 0,
        b: 0,
        c: 0
    })

    const state = Structural.getIn(record)
    expect(record.a).toBe(state.a)
    expect(record.b).toBe(state.b)
    expect(record.c).toBe(state.c)
})

test('get state at path', () => {

    const tree = new RecordStruct({
        chase: new RecordStruct({
            detail: new RecordStruct({
                one: 1,
                two: 2,
                three: 3
            })
        })
    })

    expect(Structural.getIn(tree, 'chase', 'detail', 'one')).toEqual(1)
    expect(Structural.getIn(tree, 'chase', 'detail', 'two')).toEqual(2)
    expect(Structural.getIn(tree, 'chase', 'detail', 'three')).toEqual(3)
    expect(Structural.getIn(tree, 'chase', 'detail')).toEqual({
        one: 1,
        two: 2,
        three: 3
    })
    expect(Structural.getIn(tree, 'chase')).toEqual({
        detail: {
            one: 1,
            two: 2,
            three: 3
        }
    })
    expect(Structural.getIn(tree)).toEqual({
        chase: {
            detail: {
                one: 1,
                two: 2,
                three: 3
            }
        }
    })
})

test('apply state', () => {

    const record = new RecordStruct({
        hello: 'world'
    })

    const record2 = Structural.apply(record, { hello: 'my love' })
    expect(Structural.getIn(record2)).toEqual({ hello: 'my love'})
    expect(record2).not.toBe(record)
    expect(record2.hello).not.toBe(record.hello)

})

test('deep apply state', () => {

    const record = new RecordStruct({
        gangam: new RecordStruct({
            style: 'whoa'
        })
    })

    const record2 = Structural.apply(record, 'gangam', { style: 'yay' })
    
    expect(Structural.getIn(record2)).toEqual({ gangam: { style: 'yay' } })
    expect(record2).not.toBe(record)
    expect(record2.gangam.style).not.toBe(record.gangam.style)

})