import toDashCase from './to-dash-case'

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
    }
])
    test(`${strings.in} -> ${strings.out}`, () => {
        expect(toDashCase(strings.in)).toBe(strings.out)
    })

describe('additional argument for custom dash', () => {
    test('"HotPocket" -> "hot@pocket"', () => {
        expect(toDashCase('HotPocket', '@')).toBe('hot@pocket')
    })
})

describe('additional argument can be of any length', () => {
    test('"DoubleDash" -> "double--dash"', () => {
        expect(toDashCase('DoubleDash', '--')).toBe('double--dash')
    })

    test('"WA_TF" -> "w****a****t****f"', () => {
        expect(toDashCase('WA_TF', '****')).toBe('w****a****t****f')
    })
})

