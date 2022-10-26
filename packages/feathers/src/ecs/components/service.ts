import FeathersBuildModule from "../module"

/*** Types ***/

interface ServiceBuildEffect {
 
}

/*** Main ***/

abstract class ServiceComponent extends FeathersBuildModule<ServiceBuildEffect> {

    readonly abstract path: string

}

/*** Exports ***/

export default ServiceComponent 

export {
    ServiceComponent
}