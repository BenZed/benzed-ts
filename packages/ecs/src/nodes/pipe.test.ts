import { Pipe } from './pipe'
import { Component } from '../component'

/*** Test Components ***/

const double = Component.from(
    (i: number) => i * 2
)

const invert = Component.from(
    (i: boolean) => !i
)

const deserialize = Component.from(
    (i: string) => i === 'true'
        ? true 
        : i === 'false' 
            ? false 
            : parseFloat(i)
)

/*** Test ***/

it('is sealed', () => {
    // @ts-expect-error Private constructor
    void class extends Pipe<[]> {}
})

it('chains the computation of each component', () => {

    const pipe = Pipe
        .create(double)
        .add(double)
        .add(double)
        .add(double)

    expect(pipe.compute(2)).toBe(32)
    
})

it('can only add components that have input matching last components output', () => {

    Pipe.create(double)
        // @ts-expect-error must be a number
        .add(invert) 

    Pipe.create(deserialize)
    // @ts-expect-error must be a boolean | number
        .add(invert)

    Pipe.create(deserialize)
    // just fine
        .add((i: number | boolean) => !i)

})
