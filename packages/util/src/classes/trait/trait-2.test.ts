import { Trait, addTraits, useTraits, mergeTraits } from './Trait'
import { describe, it, expect } from '@jest/globals'

describe('Trait class', () => {
    describe('add static method', () => {
        it('should add all traits to the target class', () => {
            class MyClass {}
            const trait1 = class MyTrait1 extends Trait {
                get prop1() {
                    return 'value1' 
                }
                method1() {
                    return 'method1' 
                }
            }
            const trait2 = class MyTrait2 extends Trait {
                get prop2() {
                    return 'value2' 
                }
                method2() {
                    return 'method2' 
                }
            }
            addTraits(MyClass, trait1, trait2)
            const instance = new MyClass()
            expect(instance.prop1).toBe('value1')
            expect(instance.method1()).toBe('method1')
            expect(instance.prop2).toBe('value2')
            expect(instance.method2()).toBe('method2')
        })
    })

    describe('use static method', () => {
        it('should create a new class that extends the target class and all given traits', () => {
            class MyClass {}
            const trait1 = class MyTrait1 extends Trait {
                get prop1() {
                    return 'value1' 
                }
                method1() {
                    return 'method1' 
                }
            }
            const trait2 = class MyTrait2 extends Trait {
                get prop2() {
                    return 'value2' 
                }
                method2() {
                    return 'method2' 
                }
            }
            const result = useTraits(MyClass, trait1, trait2)
            const instance = new result()
            expect(instance.prop1).toBe('value1')
            expect(instance.method1()).toBe('method1')
            expect(instance.prop2).toBe('value2')
            expect(instance.method2()).toBe('method2')
        })
    })

    describe('merge static method', () => {
        it('should return a new trait that extends the traits', () => {
            const trait1 = class MyTrait1 extends Trait {
                get prop1() {
                    return 'value1' 
                }
                method1() {
                    return 'method1' 
                }
            }
            const trait2 = class MyTrait2 extends Trait {
                get prop2() {
                    return 'value2' 
                }
                method2() {
                    return 'method2' 
                }
            }
            const mergedTrait = mergeTraits(trait1, trait2)

            expect(mergedTrait.prototype).toBeInstanceOf(trait1)
            expect(mergedTrait.prototype).toBeInstanceOf(trait2)
        })

        it('should add properties and methods from all traits to the new trait', () => {
            const trait1 = class MyTrait1 extends Trait {
                get prop1() {
                    return 'value1' 
                }
                method1() {
                    return 'method1' 
                }
            }
            const trait2 = class MyTrait2 extends Trait {
                get prop2() {
                    return 'value2' 
                }
                method2() {
                    return 'method2' 
                }
            }
            const mergedTrait = mergeTraits(trait1, trait2)

            const mergedInstance = new mergedTrait()
            expect(mergedInstance.prop1).toBe('value1')
            expect(mergedInstance.method1()).toBe('method1')
            expect(mergedInstance.prop2).toBe('value2')
            expect(mergedInstance.method2()).toBe('method2')
        })

        it('should call the $$onApply method of each trait when a new trait is created from the merge', () => {
            const trait1 = class MyTrait1 extends Trait {
                static $$onApply = jest.fn()
            }
            const trait2 = class MyTrait2 extends Trait {
                static $$onApply = jest.fn()
            }
            const mergedTrait = mergeTraits(trait1, trait2)
  
            expect(trait1.$$onApply).toHaveBeenCalledWith(mergedTrait)
            expect(trait2.$$onApply).toHaveBeenCalledWith(mergedTrait)
        })
    })
})

describe('addTraits function', () => {
    it('should throw an error if a plain object is passed as a trait', () => {
        const target = class MyClass {}
        const trait = { prop1: 'value1', method1: () => 'method1' }
        expect(() => addTraits(target, trait)).toThrowError(
            /Traits should always be extensions of the Trait class/
        )
    })

    it('should return the target class', () => {
        const target = class MyClass {}
        const trait = class MyTrait extends Trait {}
        const result = addTraits(target, trait)
        expect(result).toBe(target)
    })

    it('should add properties and methods from traits to the target class', () => {
        class MyClass {}
        const trait = class MyTrait extends Trait {
            get prop1() {
                return 'value1' 
            }
            method1() {
                return 'method1' 
            }
        }
        addTraits(MyClass, trait)
        const instance = new MyClass()
        expect(instance.prop1).toBe('value1')
        expect(instance.method1()).toBe('method1')
    })

    it('should call the $$onApply method of the trait with the target class', () => {
        class MyClass {}
        const trait = class MyTrait extends Trait {
            static $$onApply = jest.fn()
        }
        addTraits(MyClass, trait)
        expect(trait.$$onApply).toHaveBeenCalledWith(MyClass)
    })
})

describe('useTraits function', () => {
    it('should return a new class that extends the target class', () => {
        class MyClass {}
        const result = useTraits(MyClass, {})
        expect(result).not.toBe(MyClass)
        expect(result.prototype).toBeInstanceOf(MyClass)
    })

    it('should add properties and methods from traits to the target class', () => {
        class MyClass {}
        const trait1 = class MyTrait1 extends Trait {
            get prop1() {
                return 'value1' 
            }
            method1() {
                return 'method1' 
            }
        }
        const trait2 = class MyTrait2 extends Trait {
            get prop2() {
                return 'value2' 
            }
            method2() {
                return 'method2' 
            }
        }
        const result = useTraits(MyClass, trait1, trait2)
        const instance = new result()
        expect(instance.prop1).toBe('value1')
        expect(instance.method1()).toBe('method1')
        expect(instance.prop2).toBe('value2')
        expect(instance.method2()).toBe('method2')
    })

    it('should call the $$onApply method of each trait with the target class', () => {
        class MyClass {}
        const trait1 = class MyTrait1 extends Trait {
            static $$onApply = jest.fn()
        }
        const trait2 = class MyTrait2 extends Trait {
            static $$onApply = jest.fn()
        }
        useTraits(MyClass, trait1, trait2)
        expect(trait1.$$onApply).toHaveBeenCalledWith(MyClass)
        expect(trait2.$$onApply).toHaveBeenCalledWith(MyClass)
    })
})

describe('mergeTraits function', () => {
    it('should return a new trait that extends the traits', () => {
        const trait1 = class MyTrait1 extends Trait {
            get prop1() {
                return 'value1' 
            }
            method1() {
                return 'method1' 
            }
        }
        const trait2 = class MyTrait2 extends Trait {
            get prop2() {
                return 'value2' 
            }
            method2() {
                return 'method2' 
            }
        }
        const mergedTrait = mergeTraits(trait1, trait2)

        expect(mergedTrait.prototype).toBeInstanceOf(trait1)
        expect(mergedTrait.prototype).toBeInstanceOf(trait2)
    })

    it('should add properties and methods from all traits to the new trait', () => {
        const trait1 = class MyTrait1 extends Trait {
            get prop1() {
                return 'value1' 
            }
            method1() {
                return 'method1' 
            }
        }
        const trait2 = class MyTrait2 extends Trait {
            get prop2() {
                return 'value2' 
            }
            method2() {
                return 'method2' 
            }
        }
        const mergedTrait = mergeTraits(trait1, trait2)

        const mergedInstance = new mergedTrait()
        expect(mergedInstance.prop1).toBe('value1')
        expect(mergedInstance.method1()).toBe('method1')
        expect(mergedInstance.prop2).toBe('value2')
        expect(mergedInstance.method2()).toBe('method2')
    })

    it('should call the $$onApply method of each trait when a new trait is created from the merge', () => {
        const trait1 = class MyTrait1 extends Trait {
            static $$onApply = jest.fn()
        }
        const trait2 = class MyTrait2 extends Trait {
            static $$onApply = jest.fn()
        }
        const mergedTrait = mergeTraits(trait1, trait2)

        expect(trait1.$$onApply).toHaveBeenCalledWith(mergedTrait)
        expect(trait2.$$onApply).toHaveBeenCalledWith(mergedTrait)
    })

    it('should add the merged trait to the target class using addTraits or useTraits', () => {
        const trait1 = class MyTrait1 extends Trait {
            get prop1() {
                return 'value1' 
            }
            method1() {
                return 'method1' 
            }
        }
        const trait2 = class MyTrait2 extends Trait {
            get prop2() {
                return 'value2' 
            }
            method2() {
                return 'method2' 
            }
        }
        const mergedTrait = mergeTraits(trait1, trait2)

        const target = class MyClass {}
        addTraits(target, mergedTrait)

        const instance = new target()
        expect(instance.prop1).toBe('value1')
        expect(instance.method1()).toBe('method1')
        expect(instance.prop2).toBe('value2')
        expect(instance.method2()).toBe('method2')
    })
})
