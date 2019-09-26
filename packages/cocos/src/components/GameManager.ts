import { getComponentsInScene, getComponentInScene, asyncSchedule } from '../Util'

import GameComponent, { $$gameManagerRef } from './GameComponent'

/***************************************************************/
// GameManager
/***************************************************************/

// Tightly coupled to the GameManger prefab, the GameManager is 
// a universally accessible self initializing governor component.

// Responsibilities:
// - providing a persistent tree of nodes and components that need 
//   to exist throughout the lifetime of the game.
// - initializing components / logic and providing cached references 
//   to them.

/***************************************************************/
// Shortcuts
/***************************************************************/

const { ccclass, disallowMultiple, executeInEditMode } = cc._decorator

const GAME_MANAGER_PREFAB_IN_RESOURCES = 'GameManager'

/***************************************************************/
// Main
/***************************************************************/

@ccclass
@executeInEditMode
@disallowMultiple
class GameManager extends cc.Component {

    // INITIALIZATION

    public static readonly untilInitialized: Promise<boolean> = (async () => {
        if (CC_EDITOR)
            return false

        // Wait for scene to launch
        await new Promise(resolve => cc.director.once(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, resolve))

        // get game manager from scene
        let gameManager: GameManager | null = getComponentInScene(GameManager)
        if (!gameManager) {

            // or get the game manager prefab from resources
            const gameManagerPrefab = await new Promise(resolve => cc.loader.loadRes(
                GAME_MANAGER_PREFAB_IN_RESOURCES,
                cc.Prefab,
                (_err, prefab) => resolve(prefab)
            ))

            // create instance from prefab
            const gameManagerNode = cc.instantiate(gameManagerPrefab) as cc.Node
            gameManagerNode.setParent(cc.director.getScene())

            gameManager = gameManagerNode.getComponent(GameManager) as GameManager

        }

        GameManager._instance = gameManager

        await gameManager.initialize()

        return true
    })()

    private _initialized = false
    public static get initialized(): boolean {
        return !!this._instance && this._instance._initialized
    }

    private async initialize(): Promise<void> {
        cc.log(cc.js.getClassName(this), 'intializing...')

        cc.game.addPersistRootNode(this.node)

        const onGameLoad = 'onGameLoad'

        await Promise.all(
            getComponentsInScene(GameComponent)
                .map(gameComponent => gameComponent[onGameLoad]())
        )

        this._initialized = true

        cc.log(
            cc.js.getClassName(this),
            'intialization complete'
        )
    }

    // CACHE

    private static _instance: GameManager | undefined
    private static get instance(): GameManager {
        if (!this._instance)
            throw new Error(
                'Do not call GameManager methods or properties until the ' +
                'Game Manager has been initialized. Use the onGameInitialized GameComponent ' +
                'lifecycle method.'
            )

        return this._instance
    }

    // COCOS LIFECYCLE

    protected onLoad(): void {

        if (this.node.parent instanceof cc.Scene === false) {
            this.node.setParent(cc.director.getScene())

            cc.warn(
                `${cc.js.getClassName(this)} should only ever be a root-level component`
            )
        }

        const isCorrectInstance = this === (GameManager._instance || getComponentsInScene(GameManager)[0])
        if (!isCorrectInstance) {
            this.node.destroy()

            cc.error(
                `Only one instance of the ${cc.js.getClassName(this)} should ever exist.`
            )
        }

        this.startingSceneCallback()
    }

    // STATIC API

    /**
     * preloads a scene and calls and onScenePreLoad for components in that scene.
     */
    public async preloadScene(event: string | cc.Event.EventTouch, customEventData?: string): Promise<void> {

        const sceneName = event instanceof cc.Event.EventTouch
            ? customEventData
            : event

        if (!sceneName)
            throw new Error('requires a scene name.')

        const sceneAsset: cc.SceneAsset = await new Promise(resolve =>
            cc.director.preloadScene(
                sceneName,
                () => { }, // dummy progress callback
                (_err, sceneAsset: cc.SceneAsset): void => resolve(sceneAsset)
            )
        )

        return this.sceneCallback(
            'onScenePreLoad',
            sceneAsset
                .scene
                .getComponentsInChildren(GameComponent)
        )
    }

    /**
     * preloads a scene and any ContentLoaders set to autoLoad inside the scene.
     */
    public static preloadScene(sceneName: string): Promise<void> {
        return this.instance.preloadScene(sceneName)
    }

    public async loadScene(event: string | cc.Event.EventTouch, customEventData?: string): Promise<void> {

        const sceneName = event instanceof cc.Event.EventTouch
            ? customEventData
            : event

        if (!sceneName)
            throw new Error('requires a scene name.')

        await this.sceneCallback('onSceneEnd')

        await new Promise(resolve => cc.director.loadScene(sceneName, resolve))

        return this.sceneCallback('onSceneStart')

    }

    public static loadScene(sceneName: string): Promise<void> {
        return this.instance.loadScene(sceneName)
    }

    // HELPER

    private async startingSceneCallback(): Promise<void> {
        await GameManager.untilInitialized

        // one frame, so onGameStart can be called
        await asyncSchedule(this, 0)

        return this.sceneCallback('onSceneStart')
    }

    private async sceneCallback(
        onScene: 'onSceneStart' | 'onSceneEnd' | 'onScenePreLoad',
        gameComponents: GameComponent[] = getComponentsInScene(GameComponent)
    ): Promise<void> {
        const sceneName = cc.director.getScene().name

        const results: Promise<void>[] = []

        for (const gameComponent of gameComponents) {
            const result = gameComponent[onScene](sceneName) as void | Promise<void>
            if (result instanceof Promise)
                results.push(result)
        }

        await Promise.all(results)
    }
}

/***************************************************************/
// Extensions
/***************************************************************/

// See GameComponent.ts as to why this is happening
GameComponent[$$gameManagerRef] = GameManager

/***************************************************************/
// Exports
/***************************************************************/

export default GameManager

