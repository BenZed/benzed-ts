import { command } from '../src/command'
import { Module } from '../src/module'

type Calc = {
    a: number
    b: number
}
export class Calculator extends Module {

    add = command(({ a, b }: Calc) => Promise.resolve({ result: a + b }))

    subtract = command(({ a, b }: Calc) => Promise.resolve({ result: a - b }))

    multiply = command(({ a, b }: Calc) => Promise.resolve({ result: a * b }))

    divide = command(({ a, b }: Calc) => Promise.resolve({ result: a / b }))

}