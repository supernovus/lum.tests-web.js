import { Globals, JSdomPlugin } from "./plugin.js";
export { Globals, JSdomPlugin }

const usePlugin = (enable=true) => Globals.use(JSdomPlugin, enable);

export default usePlugin;

usePlugin();
