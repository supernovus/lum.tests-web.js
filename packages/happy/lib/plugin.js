import { Globals, GlobalsPlugin } from '@lumjs/tests-web';
import { GlobalRegistrator } from '@happy-dom/global-registrator';
export { Globals }

/**
 * A plugin that uses `happy-dom` as a global DOM API.
 */
export class HappyPlugin extends GlobalsPlugin {

  enable_Plugin(state) {
    GlobalRegistrator.register(this.options);
  }

  disable_Plugin(state) {
    GlobalRegistrator.unregister();
  }

}

export default HappyPlugin;
