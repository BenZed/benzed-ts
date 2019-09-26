
/***************************************************************/
// Types
/***************************************************************/

interface EventHandlerConfig {

    target: cc.Node;
    component: string;
    handler: string;
    customEventData?: string;

}

/***************************************************************/
// Helper
/***************************************************************/

function clearEquivalentEvents(
    clickEvents: cc.Component.EventHandler[],
    event: cc.Component.EventHandler
): void {

    const index: number = clickEvents.reduce((index, clickEvent, clickEventIndex): number => {

        if (
            clickEvent.target === event.target &&
            clickEvent.handler === event.handler
        )
            index = clickEventIndex

        return index;
    }, -1)

    if (index > -1) {
        clickEvents.splice(index, 1)

        // Run it again to ensure there's not more than one
        clearEquivalentEvents(clickEvents, event)
    }
}

/***************************************************************/
// Main
/***************************************************************/

function ensureEventHandler(
    clickEvents: cc.Component | cc.Component.EventHandler[],
    eventLike: EventHandlerConfig
): void {

    // from the component, get an array property with a name ending in events
    if (clickEvents instanceof cc.Component) {
        const names = Object.keys(clickEvents);
        for (const name of names) {

            const maybeArray = (clickEvents as unknown as { [key: string]: cc.Component.EventHandler[] })[name];

            if (/events$/i.test(name) && maybeArray instanceof Array)
                clickEvents = maybeArray as cc.Component.EventHandler[];
        }
    }

    // if we've gotten here, we received a component and could not find an array
    // property named 'events'
    if (clickEvents instanceof cc.Component)
        return

    // ensure eventLike is event handler
    if (eventLike instanceof cc.Component.EventHandler === false) {
        const { handler, target, customEventData, component } = eventLike

        eventLike = new cc.Component.EventHandler()

        eventLike.target = target;
        eventLike.handler = handler;
        eventLike.component = component;
        eventLike.customEventData = customEventData;
    }

    const eventHandler = eventLike as cc.Component.EventHandler

    clearEquivalentEvents(clickEvents, eventHandler)

    clickEvents.push(eventHandler);
}

/***************************************************************/
// Exports
/***************************************************************/

export default ensureEventHandler