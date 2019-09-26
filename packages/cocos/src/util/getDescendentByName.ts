
/**
 * Find a Node by name.
 * 
 * @param name Name of node to look for.
 * @param parent Node to start from, defaults to Scene.
 */
function getDescendentByName(
    name: string,
    parent: cc.Node = cc.director.getScene()
): cc.Node | null {

    let descendent: cc.Node | null = null

    for (const child of parent.children) {
        if (child.name === name)
            descendent = child

        if (!descendent)
            descendent = getDescendentByName(name, child)

        if (descendent)
            break
    }

    return descendent
}

/***************************************************************/
// Main
/***************************************************************/

export default getDescendentByName
