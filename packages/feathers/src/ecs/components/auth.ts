import { AuthenticationService } from "@feathersjs/authentication"

import { App } from "../../types"
import FeathersBuildModule from "../module"

/*** Types ***/

interface AuthBuildEffect {

    services: {
        authentication: (app: App) => AuthenticationService
    }
}

/*** Main ***/

abstract class Auth extends FeathersBuildModule<AuthBuildEffect> {

}

/*** Exports ***/

export default Auth 

export {
    Auth
}