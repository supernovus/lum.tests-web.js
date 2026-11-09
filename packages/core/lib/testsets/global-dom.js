// Extremely basic tests for global DOM plugins.
import { Globals, GlobalsPlugin } from "../globals/index.js";
import { setPlan, WebTest } from "./common.js";
export { Globals, GlobalsPlugin }

const GLOBAL_CLASSES = ['Window', 'Document', 'Element', 'Node'];
const GLOBAL_OBJECTS = ['window', 'document'];

const M_ISA_F = ' is a function';
const M_ISA_O = ' is an object';
const M_IS_UNDEF = ' is undefined after Globals.off()';

/**
 * Test-set that ensures certain globals exist after DOM plugin registration.
 * @param {WebTest} t - Test instance being used.
 * @param {(GlobalsPlugin|typeof GlobalsPlugin)} [plugin] Register plugin.
 * 
 * If this is specified, the plugin will be registered with `Globals.use()`
 * before the tests are ran. If this is not specified, it is assumed that
 * a global DOM plugin has already been registered.
 * 
 * @returns {Promise<?GlobalsPlugin>} Promise will resolve to a plugin
 * instance if `plugin` was specified, or null otherwise.
 */
export async function globalsOn(t, plugin) {
  let ret = null;
  if (plugin && Globals.isPlugin(plugin)) {
    ret = await Globals.use(plugin);
  }

  for (let g of GLOBAL_CLASSES) {
    t.isa(globalThis[g], 'function', g + M_ISA_F);
  }

  for (let g of GLOBAL_OBJECTS) {
    t.isa(globalThis[g], 'object', g + M_ISA_O);
  }

  return ret;
}
setPlan(globalsOn, GLOBAL_CLASSES, GLOBAL_OBJECTS);

/**
 * Test-set that tests that unregistering DOM globals worked.
 * @param {WebTest} t - Test instance being used.
 * @param {(Globals|GlobalsPlugin|false)} [unreg=Globals] Unregister globals.
 * 
 * This defaults to the `Globals` singleton. You can specify an individual
 * Plugin, or use `false` to disable any kind of auto-unregistration.
 * Noting that the tests will fail if the DOM globals aren't undefined.
 * 
 * @returns {Promise<any>} Promise will resolve to null if `unreg` was false,
 * or whatever value `unreg.off()` resolved to otherwise.
 */
export async function globalsOff(t, unreg = Globals) {
  let ret = null;
  if (unreg && Globals.canToggleGlobals(unreg)) {
    ret = await unreg.off();
  }

  for (let g of GLOBAL_CLASSES.concat(GLOBAL_OBJECTS)) {
    t.is(globalThis[g], undefined, g + M_IS_UNDEF);
  }

  return ret;
}
setPlan(globalsOff, GLOBAL_CLASSES, GLOBAL_OBJECTS);
