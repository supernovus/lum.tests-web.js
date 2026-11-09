# Usage

The following examples are using `tests-web-happy`, but you could swap that
for `tests-web-jsdom` and other than the two supporting different options,
the `Plugin` API and `Globals` manager from the core `tests-web` package
abstract away most of the differences and provides a unified approach.

The easiest way to use a DOM plugin is to allow it to auto-register itself
with the singleton `Globals` manager. Each plugin exports a child module
module called `/register` which does this all for you.

```js
import "@lumjs/tests-web-happy/register";

// Now you can use DOM stuff immediately.
let div = document.createElement('div');

// No manual cleanup required for this example.
```

You could also auto-register it and get a copy of the `Globals` singleton 
from [@lumjs/tests-web], which is a named export from `register` modules.
You could then add other extensions, or built-in features, like the 
Fetch Testing API, etc.

```js
import { Globals } from "@lumjs/tests-web-happy/register";

// Let's use built-in fetch() replacement plugin.
let fetchPlug = await Globals.fetch(async (ctx) => {
  // A real handler would do a lot more than this, but anyway.
  if (ctx.url.pathname === '/test') {
    return ctx.jsonResponse({ok: true});
  }
  else {
    return ctx.jsonResponse({ok: false, error: 'Not found'}, {status: 404});
  }
});

// Do stuff with DOM, fetch, etc.

// Now remove the overridden fetch(), but NOT the DOM plugin.
await fetchPlug.off();
```

Finally, if you need to pass custom options, you can do that too.
For this example, instead of saving the plugin registration, we're simply
resetting all plugins that may be in use, after tests have finished.

```js
import { Globals, WebTest } from "@lumjs/tests-web";
import HappyPlugin from "@lumjs/tests-web-happy";

// Register a plugin, it will resolve to the plugin instance.
let hp = await Globals.use(new HappyPlugin({url: 'http://localhost:8080/'}));

const plan = 0;
const t = new WebTest({module: import.meta, plan });
export default t;

// Your tests would go here...

// After all the tests, we need to let the test library know we're done.
t.done();

// Lastly, unregister ALL globals and restore anything that was overridden.
await Globals.off();
```

---

## Default export from `register` modules

The _default_ export from the register modules is a closure function: 
`(enable=true) => Globals.use(Plugin, enable)`. 

It's the same function that is run automatically by the register module, 
but is exported in case you need to re-run it after turning off the globals.

Likely not a common scenario in real use-cases, but the default test-sets
use it so that the test Harness can load multiple tests that include the
same register module even after the globals have been unregistered.
