
import V2, { v2 } from './vector-2'

describe('V2', () => {
    //

    it('has multiple signatures', () => {

        expect(new V2()).toEqual({ x: 0, y: 0 })
        expect(new V2(1)).toEqual({ x: 1, y: 0 })
        expect(new V2(1, 1)).toEqual({ x: 1, y: 1 })
        expect(new V2({ x: 1, y: 1 })).toEqual({ x: 1, y: 1 })
        expect(new V2({ x: 1 })).toEqual({ x: 1, y: 0 })
        expect(new V2({ y: 1 })).toEqual({ x: 0, y: 1 })
        expect(new V2('1,1')).toEqual({ x: 1, y: 1 })

    })

    it('has helper method', () => {
        expect(v2).toBe(V2.from)
    })

})
