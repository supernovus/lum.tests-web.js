import { WebTest, WebFindTest } from '../test.js';
import core from '@lumjs/core';
export { WebTest, WebFindTest }

const { df } = core.obj;
const { isComplex } = core.types;

/**
 * Add up the test plan count from a list of sources.
 * @param {...(number|Array|function|object)} sources - Test count sources:
 * 
 * - A `number` will be added to the test count directly.
 * - The number of items in an `Array` will be added.
 * - A `function` or `object` with a valid `testPlan` property,
 *   generally assigned by the {@link setPlan} function.
 * 
 * @returns {number}
 */
export function getPlan(...sources) {
  let plan = 0;

  for (let src of sources) {
    if (typeof src === 'number') {
      plan += src;
    }
    else if (Array.isArray(src)) {
      plan += src.length;
    }
    else if (isComplex(src) && typeof src.testPlan === 'number') {
      plan += src.testPlan;
    }
  }

  return plan;
}

/**
 * Assign a 'testPlan' value to a test-set function or object.
 * @param {(function|object)} test - The test to assign value to.
 * @param {...(number|Array|function|object)} sources - Test count sources.
 * Uses {@link getPlan} to build the count.
 * @returns {(function|object)} The `test` with `testPlan` property added.
 */
export function setPlan(test, ...sources) {
  return df(test, 'testPlan', getPlan(...sources));
}
