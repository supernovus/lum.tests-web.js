import { GlobalsPlugin } from './plugin.js';
import { FetchPlugin } from './fetch.js';

const { PS } = GlobalsPlugin;

/**
 * A singleton object that manages the global namespace.
 * 
 * Most methods in this are async, as they are designed to work with plugins/
 * that may use async operations. The only exceptions are simple value tests.
 */
export const Globals = {
  [PS]: new Map(),

  /**
   * Is a value a GlobalPlugin instance object, or the Globals singleton?
   * 
   * This is for when you want to be able to call `val.off()` or `val.on()` 
   * to toggle global values, regardless if it's one plugin, or all of them.
   * @param {mixed} val
   * @returns {boolean}
   */
  canToggleGlobals: (val) => ((val === Globals) 
    || (val instanceof GlobalsPlugin)),

  /**
   * Enable the fetch() plugin.
   * @param {function} [handler] Handler to use.
   * @returns {Promise<FetchPlugin>}
   */
  async fetch(handler) {
    let fp = this[PS].get(FetchPlugin);
    if (fp instanceof FetchPlugin) {
      if (!fp.active) {
        await fp.on();
      }
      if (typeof handler === 'function') {
        fp.setHandler(handler);
      }
    }
    else {
      fp = new FetchPlugin(handler);
      await this.use(fp);
    }

    return fp;
  },

  /**
   * Is a value a GlobalsPlugin class constructor or instance object?
   * @param {mixed} val
   * @returns {boolean}
   */
  isPlugin: (val) => (GlobalsPlugin.isPrototypeOf(val) 
    || (val instanceof GlobalsPlugin)),

  /**
   * Turn on all currently registered plugins.
   * @returns {Promise<this>}
   */
  async on() {
    for (let plugin of this[PS].values()) {
      if (!plugin.active) {
        await plugin.on();
      }
    }
    return this;
  },

  /**
   * Turn off all currently enabled plugins.
   * @returns {Promise<this>}
   */
  async off() {
    for (let plugin of this[PS].values()) {
      if (plugin.active) {
        await plugin.off();
      }
    }
    return this;
  },

  /**
   * Register and use a specified plugin.
   * @param {(GlobalsPlugin|typeof GlobalsPlugin)} plugin
   * @param {boolean} [enable=true] Enable it immediately? Default: `true`.
   * @returns {Promise<GlobalsPlugin>} Resolves to the plugin instance.
   */
  async use(plugin, enable=true) {
    if (typeof plugin === 'function') {
      if (!GlobalsPlugin.isPrototypeOf(plugin)) {
        console.error({plugin});
        throw new TypeError("Invalid plugin class");
      }
      plugin = new plugin();
    }
    else if (!(plugin instanceof GlobalsPlugin)) {
      console.error({plugin});
      throw new TypeError("Invalid plugin object");
    }

    // Plugins are mapped to their class constructor.
    let pc = plugin.constructor;

    if (this[PS].has(pc)) {
      // We need to ensure the old plugin is disabled.
      let existing = this[PS].get(pc);
      if (existing.active) {
        await existing.off();
      }
    }
    
    this[PS].set(pc, plugin);

    if (enable) {
      return plugin.on();
    }

    return plugin;
  },

}

export default Globals;
