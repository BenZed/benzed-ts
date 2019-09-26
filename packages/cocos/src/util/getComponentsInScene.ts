
/**
 * Get all of the components in the Scene of a given type.
 * 
 * @param type Component to look for.
 */
function getComponentsInScene<T extends cc.Component>(type: { prototype: T }): T[] {
    return cc
        .director
        .getScene()
        .getComponentsInChildren(type)
}

/***************************************************************/
// Exports
/***************************************************************/


export default getComponentsInScene