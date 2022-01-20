
import { forEachPackage } from './util'

/*** Sync Package Versions ***/

// So, up until mid version 3 of most benzed packages, I've been
// using * as the inter-dependency version specifier, which is a 
// great double donk pylon way to break shit. 
// 
// Lerna is certainly capable of managing this on it's own, but 
// because I have a customized publish script, I might as well use
// a customized version script as well.

