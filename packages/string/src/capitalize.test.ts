import capitalize from './capitalize'
import { testOptionallyBindableMethod } from '../../dev/src'

testOptionallyBindableMethod(capitalize, (capitalize: Function) => {

    for (const string of [
        'ace',
        ' base',
        'çase',
        '$oft',
        'øpal',
        'åcid',
        'Major',
        'c̬̟h͡a̫̻̯͘o̫̟̖͍̙̝͉s̗̦̲',

        '😍',
        'عل إيو',
        ''
    ]) {

        const capitalizedString = string
            .split('')
            .map((char, i) => i === 0 ? char.toUpperCase() : char)
            .join('')

        test(`"${string}" -> "${capitalizedString}"`, () => {
            expect(capitalize(string)).toBe(capitalizedString)
        })
    }

    test('undefined -> ""', () => {
        expect(capitalize()).toBe('')
    })

})

