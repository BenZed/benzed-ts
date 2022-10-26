import { AuthenticationService } from "@feathersjs/authentication"

import { App } from "../../types"
import FeathersBuildComponent from "../component"

/*** Types ***/

interface AuthBuildEffect {

    services: {
        authentication: (app: App) => AuthenticationService
    }
}

/*** Main ***/

abstract class Auth extends FeathersBuildComponent<AuthBuildEffect> {

    // protected _onConfig: LifeCycleMethod = (app) => {

    // }
    
    // protected _createBuildEffect(): AuthBuildEffect {
    //     return {
    //         services: {
    //             authentication: (app: App) => {

    //             }
    //         }
    //     }
    // }
}

/*** Exports ***/

export default Auth 

export {
    Auth
}