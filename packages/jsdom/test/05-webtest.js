import reg from '../lib/register.js';
import { getPlan, WebTest, wtBasics } from '@lumjs/tests-web/testsets';

const plan = getPlan(1, wtBasics);
const t = new WebTest({ module: import.meta, plan });

export default t;

t.async(async () => {
  await reg();
  t.isa(globalThis.Window, 'function', 'Window is a function');
  wtBasics(t);
});

t.done();
