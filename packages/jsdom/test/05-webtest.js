import '../lib/register.js';
import { getPlan, WebTest, wtBasics } from '@lumjs/tests-web/testsets';

const plan = getPlan(wtBasics);
const t = new WebTest({ module: import.meta, plan });

export default t;

t.async(wtBasics, t);

t.done();
