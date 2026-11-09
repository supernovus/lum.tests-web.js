import '../lib/register.js';
import { WebTest } from '@lumjs/tests-web';
import { domBasics, globalsOff } from '@lumjs/tests-web/testsets';

const plan = 0;
const t = new WebTest({ module: import.meta, plan });

export default t;

t.async(async () => { 
  domBasics(t);
  globalsOff(t);
});

t.done();
