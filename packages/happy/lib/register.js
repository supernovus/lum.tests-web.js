import { Globals, HappyPlugin } from "./plugin.js";
export { Globals, HappyPlugin }

const usePlugin = (enable=true) => Globals.use(HappyPlugin, enable);

export default usePlugin;

usePlugin();
