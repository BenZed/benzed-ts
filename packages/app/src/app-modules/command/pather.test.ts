import { createStaticPather, createUrlParamPather } from './pather'

//// Test ////

describe(`${createStaticPather.name}()`, () => {

    const defaultPather = createStaticPather('/')

    it('returns a static pather result', () => {
        expect(defaultPather({})).toEqual(['/', {}])
    })

    it('must be a path', () => {
        // @ts-expect-error must be a path 
        createStaticPather('')
    })
 
    it('is memoized', () => {
        expect(defaultPather).toBe(createStaticPather('/'))
    })
})

describe(`${createUrlParamPather.name}()`, () => {

    it('string tag template to url', ()=> {

        const todosPather = createUrlParamPather<{ id?: string, name: string }>`/todos/${'id'}`

        expect(todosPather({ id: '1', name: 'ben' })).toEqual(['/todos/1', { name: 'ben' }])
        expect(todosPather({ name: 'cake' })).toEqual(['/todos', { name: 'cake' }])
    })

    it('multiple params', () => {
        const multiParamPather = createUrlParamPather<{ id?: string, collection?: 'users' | 'files'}>`/${'collection'}/${'id'}`
        expect(multiParamPather({ id: 'ben-g', collection: 'users' })).toEqual(['/users/ben-g', {}])
        expect(multiParamPather({ id: '', collection: 'users' })).toEqual(['/users', {}])
        expect(multiParamPather({ id: undefined, collection: 'files' })).toEqual(['/files', {}])
        expect(multiParamPather({ id: undefined, collection: undefined })).toEqual(['/', {}])
        expect(multiParamPather({ id: 'ace', collection: undefined })).toEqual(['/ace', {}])
    })

    it('end url segments are preserved', () => {
        const endSegmentPather = createUrlParamPather<{hello: string}>`/greeting/${'hello'}/there`
        expect(endSegmentPather({ hello: 'sup' })).toEqual(['/greeting/sup/there', {}])
    })

})