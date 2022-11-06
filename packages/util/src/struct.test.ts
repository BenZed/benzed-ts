/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/explicit-function-return-type
 */

import Struct from './struct'
    
//// Example ////

it('allows creation of sealed instance-less plain objects with class syntax', () => {

    const Vector = Struct.define(class {

        static is(input: unknown): input is { x: number, y: number } {
            return typeof input === 'object' && 
                input !== null && 
                typeof (input as any).x === 'number' && 
                typeof (input as any).y === 'number'
        }

        static from(input: { x: number, y: number }) {
            return Vector.create(input.x, input.y)
        }

        constructor(
            public x = 0,
            public y = 0
        ) { }

        add(x: number, y: number) {
            return Vector.create(
                this.x + x,
                this.y + y
            )
        }

    })

    expect(Vector.create()).toEqual({ x: 0, y: 0 })

    const vector = Vector.from({ x: 10, y: 20 })
        .add(10, 0)

    expect(vector).toEqual({ x: 20, y: 20 })

    expect(Vector.is(vector)).toBe(true)

})