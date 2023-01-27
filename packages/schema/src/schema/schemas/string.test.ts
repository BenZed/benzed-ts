
import { $string } from './string'
import { testValidator } from '../../util.test'

//// Tests ////

testValidator(
    $string,
    'type of string',
    { input: 0, error: 'ust be of type string', transform: false },
    { input: '0', output: '0', transform: false },
)

testValidator(
    $string.lower(),
    'lowercase sub validator',
    { input: 'Ace', error: 'ust be lowercase', transform: false },
    { input: 'Ace', output: 'ace', transform: true },
)

console.log($string.lower('No uppercase').settings)
testValidator(
    $string.lower('No uppercase'),
    'lowercase sub validator custom error',
    { input: 'Ace', error: 'No uppercase', transform: false },
    { input: 'Ace', output: 'ace', transform: true },
)