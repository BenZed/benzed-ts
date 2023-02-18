
import Find from './find'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/
 
//// Tests ////

abstract class Family extends Node {
    abstract get name(): string
    abstract get age(): number

}

const tree = new class Grandfather extends Family {

    readonly name = 'Opa'
    readonly age = 87
    readonly mom = new class Mom extends Family {

        readonly name = 'Barb'
        readonly age = 60

        readonly sister = new class Sister extends Family {
            readonly name = 'Melissa'
            readonly age = 32
        }
        readonly you = new class You extends Family {
            readonly name = 'Oslow'
            readonly age = 39

            readonly son = new class Son extends Family {
                readonly name = 'Radar'
                readonly age = 12
            }

        }
        readonly brother = new class Brother extends Family {
            readonly name = 'Torga'
            readonly age = 35
        }
    }

    readonly aunt = new class Aunt extends Family {
        readonly name = 'Mordrid'
        readonly age = 62
        readonly cousin = new class Cousin extends Family {
            readonly name = 'Angola'
            readonly age = 40
            readonly neice = new class Neice extends Family {
                readonly name = 'Tiesto'
                readonly age = 16
            }
        }
    }

}

describe('find-module', () => { 

    const you = tree.mom.you

    const find = new Find(you)

    describe('find()', () => {

        it('find by reference', () => {
            const result = find(you.son)
            expect(result).toEqual(you.son)
        })

        it('find by type', () => {
            const result = find(you.son.constructor as any)
            expect(result).toEqual(you.son)
        })

        it('find by value', () => {
            const sonValue = copy(you.son)
            const result = find(sonValue)
            expect({ ...result }).toEqual({ ...sonValue })
            expect(result).toBe(you.son)
        })

    })

    describe('find().inDescendents', () => {

        it('finds all descendents', () => {

            const fam = find.inDescendents(you.son)
            console.log(fam, you) 

        })

    })

})