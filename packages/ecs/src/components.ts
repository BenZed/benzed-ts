import { Component, component } from './component'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Math Component ***/

export type Operation = '/' | '*' | '+' | '-' | '**'
export interface MathComponent<O extends Operation, B extends number> 
    extends Component<number, number> {
    by: B 
    operation: O
}

const mathComponent = 
    <O extends Operation, B extends number>(
        by: B, 
        execute: (i:number) => number
    ): MathComponent<O,B> => 
        component(execute, { by })

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