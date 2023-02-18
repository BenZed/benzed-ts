import { bind } from './bind'

it('binds args', () => {
    const parse100 = bind(parseInt, '100')
    expect(parse100()).toEqual(100)
})

it('typesafe with spread args', () => {
    const above0 = bind(Math.max,0)

    expect(above0(5)).toEqual(5)
    expect(above0(-5)).toEqual(0) 
})

it('binds multiple args', () => {

    const getParams = (...params: number[]): number[] => params
    
    const fourFours = bind(getParams, 4, 4, 4, 4)
    expect(fourFours()).toEqual([4,4,4,4])
    expect(fourFours(4)).toEqual([4,4,4,4,4])
})