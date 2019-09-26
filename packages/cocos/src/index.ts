
/***************************************************************/
// Error Checking
/***************************************************************/

if (typeof cc !== 'object')
    throw new Error(
        'Do not import the @benzed/cocos module until the ' +
        'Cocos Creator namespace has been placed in the global scope ' +
        '(global.cc). This is convention for Cocos Creator projects ' +
        'and the utility methods and components in this library depend ' +
        'on the namespace to exist.'
    )

/***************************************************************/
// Exports
/***************************************************************/

export {

}