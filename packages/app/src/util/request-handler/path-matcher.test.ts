import { nil } from '@benzed/util'
import { createStaticPathMatcher, createUrlParamPathMatcher } from './path-matcher'

import { describe, it, expect } from '@jest/globals'

describe(`${createStaticPathMatcher.name}()`, () => {

    const target = createStaticPathMatcher('/target')

    it('returns input data if match', () => {
        expect(target('/target', { foo: 'bar' })).toEqual({ foo: 'bar' })
    })

    it('returns nil if no match', () => {
        expect(target('/ace', { foo: 'bar' })).toEqual(nil)
    })

})

describe(`${createUrlParamPathMatcher.name}()`, () => {

    const targetAce = createUrlParamPathMatcher<{ ace: string }>`/target/${'ace'}`

    it('converts urls into data', () => {
        expect(targetAce('/target/123', {})).toEqual({ ace: '123' })
    })

    it('returns nil if no match', () => {
        expect(targetAce('/ace/123', {})).toEqual(nil)
    })

    it('handles missing url params', () => {
        expect(targetAce('/target', {})).toEqual({ ace: '' })

        const targetBase = createUrlParamPathMatcher<{ ace: string, base: string }>`/break/${'ace'}/${'base'}`
        expect(targetBase('/break/1', {})).toEqual({ ace: '1', base: '' })

    })

    it('throws on 0 length seperators', () => {
        expect(() => createUrlParamPathMatcher<{ one: number, two: number }>`/${'one'}${'two'}`)
            .toThrow('Params must be seperated by at least one character')
    })

    it('handles sectional matching', () => {
        const targetRace = createUrlParamPathMatcher<{ race: string, place: string }>`/po/co/${'race'}/${'place'}`
        expect(targetRace('/po/co/1', {})).toEqual({ race: '1', place: '' })
        expect(targetRace('/po/co/1/2', {})).toEqual({ race: '1', place: '2' })
        expect(targetRace('/po/co/1/2/3', {})).toEqual(undefined)
        expect(targetRace('/po/co/1/2-3', {})).toEqual({ race: '1', place: '2-3' })
    })

    it('handles static seperators', () => {
        const targetFace = createUrlParamPathMatcher<{ face: string, case: string }>`/far/${'face'}-${'case'}`
        expect(targetFace('/far/ace-fold', {})).toEqual({ face: 'ace', case: 'fold' })
        expect(targetFace('/far/ace-', {})).toEqual({ face: 'ace', case: '' })
        expect(targetFace('/far/ace', {})).toEqual(undefined)
    })

})