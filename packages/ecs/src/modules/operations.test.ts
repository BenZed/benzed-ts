
import { Module, ModuleArray } from '../module'
import { Modules } from './modules'

//// Setup ////

class TestModules<M extends ModuleArray> extends Modules<M> {

    replace<Mx extends ModuleArray>(modules: Mx): TestModules<Mx> {
        return new TestModules(...modules)
    }

}

class Text<T extends string> extends Module<T> {
    get text(): T {
        return this.data
    }
    setText<Tx extends string>(text: Tx): Text<Tx> {
        return new Text(text)
    }
    getText(): T {
        return this.text
    }
}

//// Tests ////

describe('get()', () => {

    const n1 = new TestModules(
        new Text('zero'),
        new Text('one'),
    )

    it('get node at index', () => {
        const [ zero, one ] = n1.modules
        expect(n1.get(0)).toEqual(zero)
        expect(n1.get(1)).toEqual(one)
    })

    it('throws if index out of bounds', () => {
        // @ts-expect-error invalid index
        expect(() => n1.get(2)).toThrow('Invalid index')
    })

})
