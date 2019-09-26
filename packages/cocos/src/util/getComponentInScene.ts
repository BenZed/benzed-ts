/**
 * Get the first component in the scene of a given type.
 * @param type Type of component to look for.
 */
function getComponentInScene<T extends cc.Component>(type: { prototype: T }): T | null {
    return cc
        .director
        .getScene()
        .getComponentInChildren(type)
}

/***************************************************************/
// Exports
/***************************************************************/

export default getComponentInScene