import { nil } from '@benzed/util'
import { createStaticUnpather, createUrlParamUnpather } from './un-pather'

describe('createStaticUnpather', () => {

    const target = createStaticUnpather('/target')

    it('returns input data if match', () => {
        expect(target('/target', { foo: 'bar' })).toEqual({ foo: 'bar' })
    })

    it('returns nil if no match', () => {
        expect(target('/ace', { foo: 'bar' })).toEqual(nil)
    })

})

describe('createUrlParamUnpather', () => {

    const targetAce = createUrlParamUnpather<{ ace: string }>`/target/${'ace'}`

    it('converts urls into data', () => {
        expect(targetAce('/target/123', {})).toEqual({ ace: '123' })
    })

    it('returns nil if no match', () => {
        expect(targetAce('/ace/123', {})).toEqual(nil)
    })

    it('handles missing url params', () => {
        expect(targetAce('/target', {})).toEqual({ ace: '' })

        const targetBase = createUrlParamUnpather<{ ace: string, base: string }>`/break/${'ace'}${'base'}`
        expect(targetBase('/break/1', {})).toEqual({ ace: '1', base: '' })

    })

    it('handles sectional matching', () => {
        const targetRace = createUrlParamUnpather<{ race: string, place: string }>`/po/co/${'race'}/${'place'}`
        expect(targetRace('/po/co/1', {})).toEqual({ race: '1', place: '' })
        expect(targetRace('/po/co/1/2', {})).toEqual({ race: '1', place: '2' })
        expect(targetRace('/po/co/1/2/3', {})).toEqual(undefined)
        expect(targetRace('/po/co/1/2-3', {})).toEqual({ race: '1', place: '2-3' })
    })

    it('handles static seperators', () => {
        const targetFace = createUrlParamUnpather<{ face: string, case: string }>`/far/${'face'}-${'case'}`
        expect(targetFace('/far/ace-fold', {})).toEqual({ face: 'ace', case: 'fold' })
        expect(targetFace('/far/ace-', {})).toEqual({ face: 'ace', case: '' })
        expect(targetFace('/far/ace', {})).toEqual(undefined)
    })

})