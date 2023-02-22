import { nil } from '@benzed/util'
import { Trait } from '../trait'
import Node from './node'
import { getParent } from './parent'

//// Setup ////

class Person extends Trait.use(Node) {} 

const grandPa = new class GrandPa extends Person {
    readonly mom = new class Mom extends Person {
        readonly you = new class You extends Person {
            readonly son = new class Son extends Person {
                readonly daughter = new class Daughter extends Person {
                    readonly grandSon = new class GrandSon extends Person {}
                }
            }
        }
        readonly sister = new class Son extends Person {
            readonly cousin = new class Cousin extends Person {
                readonly neice = new class Niece extends Person {}
            }
        }
    }
    readonly uncle = new class Uncle extends Person {}
}

//// Tests ////

describe(getParent.name, () => {
    test('grandPa has no parent', () => {
        expect(getParent(grandPa)).toBe(nil)
    })
    
    test('mom parent is grandPa', () => {
        expect(getParent(grandPa.mom)).toBe(grandPa)
    })
    
    test('you parent is mom', () => {
        expect(getParent(grandPa.mom.you)).toBe(grandPa.mom)
    })
    
    test('son parent is you', () => {
        expect(getParent(grandPa.mom.you.son)).toBe(grandPa.mom.you)
    })
    
    test('daughter parent is son', () => {
        expect(getParent(grandPa.mom.you.son.daughter)).toBe(grandPa.mom.you.son)
    })
    
    test('grandSon parent is daughter', () => {
        expect(getParent(grandPa.mom.you.son.daughter.grandSon)).toBe(grandPa.mom.you.son.daughter)
    })
    
    test('sister parent is mom', () => {
        expect(getParent(grandPa.mom.sister)).toBe(grandPa.mom)
    })
    
    test('cousin parent is sister', () => {
        expect(getParent(grandPa.mom.sister.cousin)).toBe(grandPa.mom.sister)
    })
    
    test('neice parent is cousin', () => {
        expect(getParent(grandPa.mom.sister.cousin.neice)).toBe(grandPa.mom.sister.cousin)
    })
      
})