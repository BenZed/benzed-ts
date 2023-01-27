
import { $string } from './string'
import { testValidator } from '../../util.test'

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
    { input: 0, output: '0', transform: true },
    { input: 0n, output: '0', transform: true },
    { input: NaN, error: 'Must be a string', transform: true },
    { input: Infinity, error: 'Must be a string', transform: true },
)

testValidator(
    $string.lower(), 
    'lowercase sub validator',
    { input: 'Ace', error: 'ust be in lower case', transform: false },
    { input: 'ace', output: 'ace', transform: false },
    { input: 'Ace', output: 'ace', transform: true },
)

testValidator(
    $string.lower('No uppercase'),
    'lowercase sub validator custom error',
    { input: 'Ace', error: 'No uppercase', transform: false },
)

testValidator(
    $string.lower().lower(false),
    'lowercase sub validator disabled',
    { input: 'Ace', output: 'Ace', transform: false },
)

testValidator(
    $string.upper(),
    'uppercase sub validator',
    { input: 'ace', error: 'ust be in upper case', transform: false },
    { input: 'ACE', output: 'ACE', transform: false },
    { input: 'Ace', output: 'ACE', transform: true },
)

testValidator(
    $string.upper('No uppercase'),
    'uppercase sub validator custom error',
    { input: 'Ace', error: 'No uppercase', transform: false },
)

testValidator(
    $string.upper().upper(false),
    'uppercase sub validator disabled',
    { input: 'Ace', output: 'Ace', transform: false },
)

testValidator(
    $string.camel(), 
    'camelcase sub validator',
    { input: 'ace of base', error: 'ust be in camel case', transform: false },
    { input: 'ace of base', output: 'aceOfBase', transform: true },
    { input: 'aceOfBase', output: 'aceOfBase', transform: false },
) 

testValidator(
    $string.camel('Requires camelCase'),
    'camelCase sub validator custom error',
    { input: 'ace of base', error: 'Requires camelCase', transform: false },
)

testValidator(
    $string.camel().camel(false),
    'camelcase sub validator disabled',
    { input: 'Ace', output: 'Ace', transform: false },
)

testValidator(
    $string.upper('upper case only').lower('lower case only'),
    'casing sub validators overwrite each other',
    { input: 'Ace', output: 'ace', transform: true },
    { input: 'Ace', error: 'lower case only', transform: false }
)
