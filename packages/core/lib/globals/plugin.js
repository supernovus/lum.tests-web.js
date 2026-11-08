import { PluginState } from "./state.js";

const PS = Symbol('@lumjs/tests-web/globals@plugin');

// Private helper for on() and off() methods.
async function toggleActive(res, plugin, active) {
  let state = plugin[PS];
  if (res instanceof Promise) {
    return res.then(() => {
      state.active = active;
      return plugin;
    });
  }
  else {
    state.active = active;
    return plugin;
  }
}

/**
 * An abstract base class for global registration plugins.
 * 
 * The `enable_Plugin(state)` and `disable_Plugin(state)` methods MUST be
 * overridden by the actual plugin classes!
 * 
 * The `on()` and `off()` methods SHOULD NOT be overridden!
 */
export class GlobalsPlugin {
  /**
   * Build a plugin instance.
   * @param {Object} [opts] Options; saved to `this.options`.
   * 
   * Each plugin can define their own options, they're not needed
   * for anything else.
   */
  constructor(opts = {}) {
    this.options = opts;
    this[PS] = new PluginState(this);
  }

  /**
   * A readonly getter that returns if the plugin is currently active.
   */
  get active() {
    return this[PS].active;
  }

  /**
   * Abstract method called by {@link GlobalsPlugin#on}.
   * 
   * This method should **ONLY** be called by `on`; no direct
   * calls to this from anywhere else should ever be made!
   * 
   * If the return value from this is a Promise (you could mark the
   * overridden method as `async` if you wanted), then it must resolve
   * in order for the plugin to be marked as active/enabled.
   * 
   * The value a returned Promise resolves to, nor any other return value
   * from this method is used, so null or undefined is just fine.
   * 
   * @protected
   * @param {PluginState} state - State to save existing globals too.
   * @returns {(Promise<*>|null|undefined)}
   */
  enable_Plugin(state) {
    console.error({state, plugin: this});
    throw new Error('enablePlugin() not implemented');
  }

  /**
   * Abstract method used by {@link GlobalsPlugin#off}.
   * 
   * This method should **ONLY** be called by `off`; no direct
   * calls to this from anywhere else should ever be made!
   * 
   * If the return value from this is a Promise (you could mark the
   * overridden method as `async` if you wanted), then it must resolve
   * in order for the plugin to be marked as inactive/disabled.
   * 
   * The value a returned Promise resolves to, nor any other return value
   * from this method is used, so null or undefined is just fine.
   * 
   * @protected
   * @param {PluginState} state - State to restore saved globals from.
   * @returns {(Promise<*>|null|undefined)}
   */
  disable_Plugin(state) {
    console.error({state, plugin: this});
    throw new Error('disablePlugin() is not implemented');
  }
  
  /**
   * Public API call used to turn on this plugin.
   * @returns {Promise<GlobalsPlugin>} Resolves to this.
   */
  async on() {
    let res = this.enable_Plugin(this[PS]);
    return toggleActive(res, this, true);
  }

  /**
   * Public API call used to turn off this plugin.
   * @returns {Promise<GlobalsPlugin>} Resolves to this.
   */
  async off() {
    let res = this.disable_Plugin(this[PS]);
    return toggleActive(res, this, false);
  }

}

Object.defineProperty(GlobalsPlugin, 'PS', { value: PS });

export default GlobalsPlugin;
