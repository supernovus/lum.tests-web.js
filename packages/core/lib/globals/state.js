/**
 * An internal class used by plugins to save and restore global values.
 * 
 * An instance of this will be created for every plugin instance,
 * and it will be passed to the internal methods that enable and disable
 * the plugin (that the public `on()` and `off()` methods call).
 * 
 * Those methods can use this to save whatever they need to,
 * and later restore it.
 */
export class PluginState {

  constructor(plugin) {
    this.plugin = plugin;
    this.active = false;
    this.globals = new Map();
  }

  /**
   * Save named properties/variables from an object/namespace.
   * 
   * @param {Iterable} names - Names of what to save.
   * @param {Object} [from=globalThis] Object to save properties from.
   * 
   * The default is `globalThis`, as this method is designed for saving
   * global variables and later restoring them.
   * 
   * Each unique `from` value will have a separate value store (`Map`) created
   * for it the first time it is encountered.
   * 
   * @returns {number} Number of key/value pairs that were saved.
   */
  save(names, from = globalThis) {
    if (!names || typeof names[Symbol.iterator] !== 'function') {
      throw new TypeError("Invalid list of names");
    }

    let num = 0;
    let store = this.globals.get(from);

    if (!store) {
      store = new Map();
      this.globals.set(from, store);
    }

    for (let name of names) {
      if (from[name] !== undefined) {
        store.set(name, from[name]);
        num++;
      }
    }

    return num;
  }

  /**
   * Restore named properties/variables to an object/namespace.
   * 
   * @param {boolean} [keep=false] Keep items in the target store?
   * 
   * If false (default), the store for the target will be cleared when all
   * of the items in it have been restored to the target.
   * 
   * If true, the store is left alone and not cleared. I'm not sure there
   * is much use case for that, but whatever.
   * 
   * @param {Object} [target=globalThis] Object to restore properties to.
   * 
   * Just like save(), the default is `globalThis`. This target must have
   * been passed to save() for there to be any store associated with it.
   * 
   * @returns {number} The number of key/value paris restored; 
   * or `-1` if there was no store found for the specified target.
   */
  restore(keep = false, target = globalThis) {
    let num = -1;
    let store = this.globals.get(target);

    if (store instanceof Map) {
      // A store for the target was found.
      num++;

      for (let [key, value] of store) {
        target[key] = value;
        num++;
      }

      if (!keep) {
        store.clear();
      }
    }

    return num;
  }

}
