import toDashCase from './to-dash-case'
import { expectTypeOf } from 'expect-type'

//// Setup ////

for (const strings of [
    {
        in: 'camelCase',
        out: 'camel-case'
    },
    {
        in: 'lowercase',
        out: 'lowercase'
    },
    {
        in: 'dash-case',
        out: 'dash-case'
    },
    {
        in: 'UPPER_CASE',
        out: 'u-p-p-e-r-c-a-s-e'
    },
    {
        in: 'PascalCase',
        out: 'pascal-case'
    },
    {
        in: 'PascalCaseWithManyHumps',
        out: 'pascal-case-with-many-humps'
    },
    {
        in: '@some|Weird|Shit',
        out: 'some-weird-shit'
    },
    {
        in: '--Double_-_Dash---',
        out: 'double-dash'
    },
    {
        in: 'U-P-P-E-R-D-A-S-H-C-A-S-E',
        out: 'u-p-p-e-r-d-a-s-h-c-a-s-e'
    },
    {
        in: 'ÅgentØfC̬̟h͡a̫̻̯͘o̫̟̖͍̙̝͉s̗̦̲',
        out: 'ågent-øf-c-h-a-o-s'
    },
    {
        in: 'Regularily punctuated words and Nouns.',
        out: 'regularily-punctuated-words-and-nouns'
    },
    {
        in: 'SomeId#123',
        out: 'some-id-123',
    },
    {
        in: '123SomeAddress',
        out: '123-some-address',
    },
    {
        in: 'some.address123',
        out: 'some-address123',
    },
    {
        in: 'HeyMan123HowAreYou456',
        out: 'hey-man123-how-are-you456',
    },
    {
        in: '123! Who do we appreciate? 456! We appreciate you!',
        out: '123-who-do-we-appreciate-456-we-appreciate-you',
    },
    {
        in: 'd∂lm@t10n!',
        out: 'd-lm-t10-n'
    }
]) {
    test(`${strings.in} -> ${strings.out}`, () => {
        expect(toDashCase(strings.in)).toBe(strings.out)
    })
}

it('is type safe', () => {
    const out = toDashCase('fooBar')
    expectTypeOf(out).toEqualTypeOf<'foo-bar'>()

    const generic = toDashCase('unsureWhatThisIs' as string)
    expectTypeOf(generic).toEqualTypeOf<string>()
})