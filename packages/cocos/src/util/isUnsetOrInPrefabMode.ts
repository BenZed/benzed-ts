/***************************************************************/
// TYPES
/***************************************************************/

type ValuePredicate = (value: unknown) => boolean

/***************************************************************/
// HELPER
/***************************************************************/

function isNull(value: unknown): boolean {
    return value == null
}

/***************************************************************/
// Main
/***************************************************************/

/**
 * Intended to be used as a visibility property for a @property decorator. Property
 * will only be visible if it is undefined or if it's being viewed in prefab mode.
 * @param propertyName 
 * @param isUnset 
 */
function isUnsetOrInPrefabMode(
    propertyName: string,
    isUnset: ValuePredicate = isNull
): () => boolean {
    return function (this: { [prop: string]: unknown }, ): boolean {
        return (
            cc.director.getScene().name === 'New Node' ||
            //                               ^ name of scene in Prefab Mode
            isUnset(this[propertyName])
        )
    }
}

/***************************************************************/
// Exports
/***************************************************************/

export default isUnsetOrInPrefabMode
