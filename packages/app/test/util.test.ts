import $ from '@benzed/schema'
import { Command } from '../src/command'
import { Service } from '../src/service'
import { HttpMethod } from '../src/util'

/* eslint-disable 
    @typescript-eslint/restrict-plus-operands
*/

const $values = $({
    a: $.number,
    b: $.number
})

const add = Command
    .create('add', $values, HttpMethod.Get)
    .useHook(({ a, b }) => ({ result: a + b }))

const subtract = Command
    .create('subtract', $values, HttpMethod.Get)
    .useHook(({ a, b }) => ({ result: a - b }))

const divide = Command
    .create('divide', $values, HttpMethod.Get)
    .useHook(({ a, b }) => ({ result: a / b }))

const multiply = Command
    .create('multiply', $values, HttpMethod.Get)
    .useHook(({ a, b }) => ({ result: a * b }))

const calculator = Service.create()
    .useModule(add)
    .useModule(subtract)
    .useModule(divide)
    .useModule(multiply)

export { calculator }