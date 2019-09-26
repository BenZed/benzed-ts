
/* eslint-disable @typescript-eslint/ban-ts-ignore */

/***************************************************************/
// Helper
/***************************************************************/

function getComponentType(
    eventHandler: cc.Component.EventHandler
): { prototype: cc.Component } {

    let componentType: { prototype: cc.Component }

    // @ts-ignore _componentId is private
    const componentId = eventHandler._componentId
    if (componentId)
        // @ts-ignore _getClassById is private
        componentType = cc.js._getClassById(componentId)
    else {
        // @ts-ignore _componentName is private
        const componentName = eventHandler.component || eventHandler._componentName
        componentType = cc.js.getClassByName(componentName)
    }

    return componentType
}

/***************************************************************/
// Main
/***************************************************************/

/**
 * 
 * Functionally the same as cc.Component.EventHandler.emit, except 
 * it can return a promise.
 * @param eventHandler 
 * @param event 
 */
function emitEventHandlerAsync(
    eventHandler: cc.Component.EventHandler,
    event:
        cc.Event.EventTouch |
        cc.Event.EventCustom |
        cc.Event.EventMouse |
        cc.Event.EventKeyboard
): void | Promise<void> {

    if (!cc.isValid(eventHandler.target))
        return

    const componentType = getComponentType(eventHandler)

    const component: { [key: string]: Function } =
        eventHandler.target &&
        eventHandler.target.getComponent(componentType) as unknown as { [key: string]: Function }

    if (!component || !cc.isValid(component))
        return

    if (typeof component[eventHandler.handler] !== 'function')
        return

    return component[eventHandler.handler](
        event,
        eventHandler.customEventData
    )

}

/***************************************************************/
// Exports
/***************************************************************/

export default emitEventHandlerAsync