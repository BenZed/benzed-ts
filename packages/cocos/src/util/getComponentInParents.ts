/**
 * Get all of the components of a given type in any ascendent.
 * @param source 
 * @param type 
 */
function getComponentInParents<T extends cc.Component>(
    source: cc.Component | cc.Node,
    type: { prototype: T }
): T | null {

    let node = source instanceof cc.Component ? source.node : source
    let component: T | null = null

    while (!component && node.parent && node.parent instanceof cc.Scene === false) {
        node = node.parent
        component = node.getComponent(type)
    }

    return component

}

/***************************************************************/
// Exports
/***************************************************************/

export default getComponentInParents