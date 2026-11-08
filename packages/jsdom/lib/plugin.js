import { Globals, GlobalsPlugin } from '@lumjs/tests-web';
import globalJsdom from "global-jsdom";
export { Globals }

/**
 * A plugin that uses `jsdom` as a global DOM API.
 */
export class JSdomPlugin extends GlobalsPlugin {

  enable_Plugin(state) {
    let opts = cp({}, this.options);
    let html = opts.html;
    delete opts.html;
    this.$undo = globalJsdom(html, opts);
  }

  disable_Plugin(state) {
    this.$undo;
  }

}

export default JSdomPlugin;
