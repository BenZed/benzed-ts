/***************************************************************/
// Shortcuts
/***************************************************************/

const { ccclass } = cc._decorator

export const $$gameManagerRef = Symbol(
    'game-manager-ref-assigned-inside-' +
    'GameManager.ts-' +
    'to-prevent-circular-dependency-error'
)

interface GameManagerLike {
    initialized: boolean;
    untilInitialized: Promise<boolean>;
}

/***************************************************************/
// Main
/***************************************************************/

/**
 * Tightly coupled to the Game Manager, the Game Component 
 * adds lifecycle methods that other components can extend.
 */
@ccclass
export default abstract class GameComponent extends cc.Component {

    private static [$$gameManagerRef]: GameManagerLike | null = null

    // LIFECYCLE METHODS TO EXTEND

    /**
     * onGameLoad is called by every game component that is present
     * while the GameManager is initializing.
     * @param isLowEndDevice true if game is playing played on a low end device. Same value as GameManager.isLowEndDevice
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    protected onGameLoad(): void { }

    /**
     * onGameStart is called by every GameComponent after the GameManager has 
     * finished initializing, weather that component existed when the GameManager  
     * was initializing, or not.
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected onGameStart(): void { }

    /**
     * Called when GameManager.loadScene is used.
     * @param sceneName Name of the scene being ended. 
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    protected onSceneEnd(_sceneName: string): void { }

    /**
     * Called when GameManager.preloadScene is used.
     * @param sceneName Name of the scene being ended. 
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    protected onScenePreLoad(_sceneName: string): void { }

    /**
     * Called when GameManager.loadScene is used.
     * @param sceneName Name of the scene being ended. 
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    protected onSceneStart(_sceneName: string): void { }

    // COCOS INTERNAL LIFECYCLE

    protected __preload(): void {

        const GameManager = GameComponent[$$gameManagerRef]

        // GameManager may not yet be assigned in cases where cocos is building
        // dummy instances of components in development for it's own validation 
        // purposes.
        //
        // If it's created dummy instances, our own lifecycle methods don't need
        // to run, anyway.
        if (!GameManager || CC_EDITOR)
            return

        const executeOnGameStart = (): void => {

            // If we've gotten here, it may still be a dummy instance. Dummy
            // instances don't have nodes.
            if (this.node)
                this.onGameStart()
        }

        if (!GameManager.initialized)
            GameManager
                .untilInitialized
                .then(executeOnGameStart)
        else
            executeOnGameStart()
    }
}