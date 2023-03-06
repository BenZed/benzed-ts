import { App } from '../app'

import { Empty } from '@benzed/util'

import { it, describe, beforeAll } from '@jest/globals'

import { Module } from '../module'
import { Validateable } from './validateable'

//// Place ////

class StatelessModule extends Module {
    get [Module.state](): Empty {
        return {}
    }
}

let is: typeof import('@benzed/is').is

//// Tests ////

describe('_assertRoot', () => {

    beforeAll(async () => {
        // unsure why this is necessary
        is = (await import('@benzed/is')).is
    })

    class RootModule extends Module.add(StatelessModule, Validateable) {
        protected _onValidate(): void {
            this._assertRoot()
        }
    }

    it('throws if module is not a root module', async () => {
        const testAssertRootApp = new class TestAssertRootApp extends App {
            thisModuleWillThrowOnStart = new RootModule()
        }
        await expect(testAssertRootApp.start()).rejects.toThrow('must be the root module')
    })

    class RootChildModule extends Module.add(StatelessModule, Validateable) {
        protected _onValidate(): void {
            this._assertRootParent()
        }
    }

    it('throws if module is not the root', () => {
        const childModule = new RootChildModule()
        expect(() => childModule.validate()).toThrow(`${childModule.name} must be parented to the root.`)
    })

    it('does not throw if module is parented to the root', async () => {
        const testAssertRootParentApp = new class TestAssertRootParentApp extends App {
            thisModuleWillNotThrowOnStart = new RootChildModule()
        }

        await expect(testAssertRootParentApp.start()).resolves.toBe(undefined)
    })

})

describe('_assertUniqueSibling', () => {

    class SiblingModule extends Module.add(StatelessModule, Validateable) {
        protected _onValidate(): void {
            this._assertUniqueSibling()
        }
    }

    class ParentModule extends Module.add(StatelessModule) {
        moduleOne = new SiblingModule()
        moduleTwo = new SiblingModule()
    }

    it('throws if module has sibling with the same type', () => {
        const parent = new ParentModule()

        expect(() => parent.moduleOne.validate()).toThrow('must be the only child of it\'s type.')
    })

    it('does not throw if module is the only child of its type', async () => {
        const testAssertUniqueSiblingApp = new class TestAssertUniqueSiblingApp extends App {
            thisModuleWillNotThrowOnStart = new SiblingModule()
        }

        await expect(testAssertUniqueSiblingApp.start()).resolves.toBe(undefined)
    })
})

describe('_assertUnique', () => {

    class UniqueModule extends Module.add(StatelessModule, Validateable) {
        protected _onValidate(): void {
            this._assertUnique()
        }
    }
    
    class ParentModule extends Module.add(StatelessModule) {
        moduleOne = new UniqueModule()
        subModule = new class SubModule extends StatelessModule {
            moduleTwo = new UniqueModule()
        }
    }
    
    it('throws if there is another module in the tree of the same type', () => {
        const parent = new ParentModule() 
        expect(() => parent.moduleOne.validate()).toThrow(`${UniqueModule.name} must be the only module of it's type.`)
    })
    
    it('does not throw if module is unique', async () => {
        const testAssertUniqueApp = new class TestAssertUniqueApp extends App {
            thisModuleWillNotThrowOnStart = new UniqueModule()
        }
    
        await expect(testAssertUniqueApp.start()).resolves.toBe(undefined)

    })
})

describe('_assertRequiredInSibling', () => {

    class RequiredModule extends StatelessModule {}
    class RequiringModule extends Module.add(StatelessModule, Validateable) {

        protected _onValidate(): void {
            this._assertRequiredInSibling(is(RequiredModule))
        }

    }

    it('throws if module is missing required sibling', async () => {
        const testApp = new class TestAssertRequiredInSiblingApp extends App {
            thisModuleWillThrowOnStart = new RequiringModule()
        }

        await expect(testApp.start())
            .rejects.toThrow(`${RequiringModule.name} is missing required module`)
    })

    it('does not throw if module has required sibling', async () => {
        
        const testApp = new class TestAssertRequiredInSiblingApp extends App {
            requiring = new RequiringModule()
            required = new RequiredModule()
        }

        await expect(testApp.start()).resolves.toBe(undefined)
    })

})

describe('_assertRequired', () => {

    class RequiredModule extends StatelessModule {}
    class RequiringModule extends Module.add(StatelessModule, Validateable) {
        protected _onValidate(): void {
            this._assertRequired(is(RequiredModule))
        }
    }

    it('throws if module is missing required module', () => {
        const parent = new class TestRequiredApp extends App {
            module = new RequiringModule()
        }

        expect(() => parent.module.validate())
            .toThrow(`${RequiringModule.name} is missing required module`)
    })

    it('does not throw if module has required module', async () => {
        const testApp = new class TestRequiredApp extends App {
            required = new RequiredModule()
            thisModuleWillNotThrowOnStart = new class extends StatelessModule {
                requiring = new RequiringModule()
            }
        }

        await expect(testApp.start()).resolves.toBe(undefined)
    })
  
})

describe('_assertConflictingInSibling', () => {

    class ConflictModule extends StatelessModule {}
    class ConflictingModule extends Module.add(StatelessModule, Validateable) {

        protected _onValidate(): void {
            this._assertConflictingInSibling(is(ConflictModule))
        }

    }

    it('throws if module has conflicting sibling', async () => {
        const testApp = new class TestConflictingInSiblingApp extends App {
            moduleOne = new ConflictModule()
            moduleTwo = new ConflictingModule()
        }
        await expect(testApp.start())
            .rejects
            .toThrow(`${ConflictingModule.name} cannot be placed with conflicting module`)
    })

    it('does not throw if module does not have conflicting sibling', async () => {
        const testApp = new class TestConflictingInSiblingApp extends App {
            thisModuleWillNotThrowOnStart = new ConflictingModule()
        }
        await expect(testApp.start()).resolves.toBe(undefined)
    })

})

describe('_assertConflicting', () => {

    class ConflictModule extends StatelessModule {}

    class ConflictingModule extends Module.add(StatelessModule, Validateable) {
        protected _onValidate(): void {
            this._assertConflicting(is(ConflictModule))
        }
    }

    it('throws if module has conflicting module', () => {
        const parent = new class TestConflictingApp extends App {
            moduleOne = new ConflictModule()
            sub = new class SubModule extends StatelessModule {
                moduleTwo = new ConflictingModule()
            }
        }

        expect(() => parent.sub.moduleTwo.validate())
            .toThrow(`${ConflictingModule.name} cannot be placed with conflicting module`)
    })

    it('does not throw if module does not have conflicting module', async () => {
        const testApp = new class TestConflictingApp extends App {
            thisModuleWillNotThrowOnStart = new ConflictingModule()
        }

        await expect(testApp.start()).resolves.toBe(undefined)
    })

})
