import { getValidatorSettings, Validator2 } from './validator-2'

import { test } from '@jest/globals'

//// Tests ////

test(`${Validator2.name}`, () => {
    
    const test = new Validator2({

        numChars: 3,

        isValid(i: string): boolean {
            return i.length > this.numChars
        } 

    }) 
    
    const test2 = Validator2.apply(test, { numChars: 4 })

    console.log(test, getValidatorSettings(test))  
    console.log(test2, getValidatorSettings(test2))   

}) 
