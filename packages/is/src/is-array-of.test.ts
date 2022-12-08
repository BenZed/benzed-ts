import isArrayOf from './is-array-of'

describe('isArrayOf()', () => {

    it('requires at least one type', () => {
        expect(() => isArrayOf([]))
            .toThrow('At least one type is required.')
    })

    describe('determine if value is array of types', () => {

        it('isArrayOf([], String) == false',
            () => expect(isArrayOf([], String))
                .toEqual(false)
        )

        it('isArrayOf([\'str\'], String) == true',
            () => expect(isArrayOf(['str'], String))
                .toEqual(true)
        )

        it('isArrayOf([0,false,new Date(), \'str\'], String) == false',
            () => expect(isArrayOf([0, false, new Date(), 'str'], String))
                .toEqual(false)
        )

        it('isArrayOf([0,\'str\',10,\'cake\'], [String, Number]) == true',
            () => expect(isArrayOf([0, 'str', 10, 'cake'], String, Number))
                .toEqual(true)
        )
    })

})
