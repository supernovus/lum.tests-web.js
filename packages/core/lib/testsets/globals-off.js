import Globals from "../globals/index.js";

// Tests to run to ensure Globals.off() works
export async function globalsOff(t) {
  await Globals.off();
  
  t.is(globalThis.Window, undefined, 'Window is undefined after Globals.off()');

}
