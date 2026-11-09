import '../lib/register.js';
import { getPlan, globalsOn, globalsOff, WebTest } from '@lumjs/tests-web/testsets';

const plan = getPlan(globalsOn, globalsOff);
const t = new WebTest({ module: import.meta, plan });

export default t;

t.async(globalsOn, t);
t.async(globalsOff, t);

t.done();
