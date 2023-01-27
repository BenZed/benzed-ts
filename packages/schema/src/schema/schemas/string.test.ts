
import $string from './string'
import { testValidator } from '../../util.test'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Tests ////

testValidator(
    $string,
    'type of string',
    { input: 0, error: 'ust be a string', transform: false },
    { input: '0', output: '0', transform: false },
)

testValidator(  
    $string,
    'cast to string',
    { input: 0, output: '0', },
    { input: 0n, output: '0', },
    { input: NaN, error: 'Must be a string', },
    { input: Infinity, error: 'Must be a string', },
)

testValidator(
    $string.lowerCase(), 
    'lowercase sub validator',
    { input: 'Ace', error: 'ust be in lower case', transform: false },
    { input: 'ace', output: 'ace', transform: false },
    { input: 'Ace', output: 'ace', },
)

testValidator( 
    $string.lowerCase('No uppercase'),
    'lowercase sub validator custom error',
    { input: 'Ace', error: 'No uppercase', transform: false },
)

testValidator(
    $string.lowerCase().lowerCase(false),
    'lowercase sub validator disabled',
    { input: 'Ace', output: 'Ace', transform: false },
)

testValidator(
    $string.upperCase(),
    'uppercase sub validator',
    { input: 'ace', error: 'ust be in upper case', transform: false },
    { input: 'ACE', output: 'ACE', transform: false },
    { input: 'Ace', output: 'ACE', },
)

testValidator(
    $string.upperCase('No uppercase'),
    'uppercase sub validator custom error',
    { input: 'Ace', error: 'No uppercase', transform: false },
)

testValidator(
    $string.upperCase().upperCase(false),
    'uppercase sub validator disabled',
    { input: 'Ace', output: 'Ace', transform: false },
)

testValidator(
    $string.camelCase(), 
    'camelcase sub validator',
    { input: 'ace of base', error: 'ust be in camel case', transform: false },
    { input: 'ace of base', output: 'aceOfBase', },
    { input: 'aceOfBase', output: 'aceOfBase', transform: false },
)

testValidator(
    $string.camelCase('requires camelCase'),
    'camelCase sub validator custom error',
    { input: 'ace of base', error: 'requires camelCase', transform: false },
)

testValidator(
    $string.camelCase().camelCase(false),
    'camelcase sub validator disabled',
    { input: 'ace of base', output: 'ace of base', transform: false },
)

testValidator(
    $string
        .upperCase('upper case only')
        .camelCase('camel case only')
        .lowerCase('lower case only')
    ,
    'casing sub validators replace one another',
    { input: 'Ace', output: 'ace', },
    { input: 'Ace', error: 'lower case only', transform: false },
)

testValidator(
    $string.trim(),
    'trim validator', 
    { input: ' hey ', output: 'hey', },
    { input: ' hello ', error: 'ust be trimmed', transform: false }
)

testValidator(  
    $string.capitalize(),
    'capitalize validator', 
    { input: 'ace', output: 'Ace', },
    { input: 'ace', error: 'Must be capitalized', transform: false }
) 

testValidator(
    $string.startsWith('#'),
    'starts-with validator',
    { input: 'ace', output: '#ace', },
    { input: 'ace', error: 'Must start with #', transform: false }
)

testValidator(
    $string.endsWith('?'),
    'ends-with validator',
    { input: 'who are you', output: 'who are you?', },
    { input: 'who are you', error: 'Must end with ?', transform: false }
)

describe('includes', () => {
    testValidator(
        $string.includes('@'),
        'includes validator',
        { input: 'straight bussin', error: 'Must include @', transform: false },
        { input: 'straight@bussin', output: 'straight@bussin', transform: false }
    )
})
