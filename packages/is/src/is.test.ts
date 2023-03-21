
import { test, describe, it, expect } from '@jest/globals'
import { satisfies } from 'semver'

import { is, IsType } from './index'

it('is.string', () => {
    const name = localStorage.getItem('name')

    if (is.string(name))
        console.log(`Welcome back, ${name}`)
})

it('typeof isVectory', () => {
    const isVector = is({ x: is.number, y: is.number })

    type Vector = typeof isVector.type
})

it('typeof isVectory', () => {
    const isVector = is({ 
        x: is.number, 
        y: is.number 
    }) satisfies IsType<{ x: number, y: number }>
})