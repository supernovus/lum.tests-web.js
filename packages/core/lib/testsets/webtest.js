import { setPlan, WebTest } from "./common.js";

// TODO: change this once real tests are written
const plan = 1; 

/**
 * Test-set for basic functionality of the WebTest class.
 * @param {WebTest} t - Test instance being used/tested.
 * @returns {Promise<null>}
 */
export async function wtBasics(t) {
  // TODO: write tests here
  t.todo('WebTest basic tests');

  return null;
}
setPlan(wtBasics, plan);
