import { Component } from './component'
import { $ } from '@benzed/schema'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Math Component ***/

export type Operation = '/' | '*' | '+' | '-' | '**'
export interface MathComponent<O extends Operation, B extends number> 
    extends Component<number, number> {
    by: B 
    operation: O
}

const mathComponent = <O extends Operation, B extends number>(
    by: B, 
    compute: (i:number) => number
): MathComponent<O,B> => 
    ({ 
        compute, 
        canCompute: $.number.is,
        by,
        operation: null as unknown as O
    })

/*** Math Components  ***/

export const multiply = <B extends number>(by: B): MathComponent<'*', B> => 
    mathComponent(by, i => i * by)

export const divide = <B extends number>(by: B): MathComponent<'/', B> => 
    mathComponent(by, i => i / by)

export const subtract = <B extends number>(by: B): MathComponent<'-', B> => 
    mathComponent(by, i => i - by)
    
export const add = <B extends number>(by: B): MathComponent<'+', B> => 
    mathComponent(by, i => i + by)

export const pow = <B extends number>(by: B): MathComponent<'**', B> => 
    mathComponent(by, i => i ** by)

export const math = {
    '*': multiply,
    '/': divide,
    '-': subtract,
    '+': add,
    '**': pow
}