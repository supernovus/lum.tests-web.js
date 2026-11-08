import LumTests from '@lumjs/tests';
import WebCore from '@lumjs/web-core';
import core from '@lumjs/core';

const LumTest = LumTests.Test;
const wcu = WebCore.utils;
const wcq = WebCore.query;
const { df } = core.obj;
const cp = Object.assign;

const ISA_TESTS = [
  'isDocument', 'isElement', 'isNode', 'isWindow',
];

const WCU_TESTS = [
  'isCollection', 'isContainer', 'isQueryable',
];

const SUB_TESTS = [
  'findTest',
];

/**
 * An extension of the `Test` class from `@lumjs/tests` which provides
 * some extra testing features wrapping `@lumjs/web-core` functions.
 * 
 * @prop {WebTypeTest} isDocument - Is a value a `Document`?
 * @prop {WebTypeTest} isElement - Is a value an `Element`?
 * @prop {WebTypeTest} isNode - Is a value a `Node`?
 * @prop {WebTypeTest} isWindow - Is a value a `Window`?
 */
export class WebTest extends LumTest {
  constructor(opts = {}) {
    super(opts);
    this.$testMethods = LumTest.$METHODS.test.concat(
      ISA_TESTS, WCU_TESTS, SUB_TESTS,
    );
  }

  /**
   * Execute a `@lumjs/web-core.query.find()` query that returns a helper
   * object that has testing methods that apply to the query results.
   * @param {...mixed} findArgs - Arguments for find().
   * @returns {WebFindTest}
   */
  findTest(...findArgs) {
    let findTest = new WebFindTest(this);
    return wcq.find(findTest, ...findArgs);
  }

  /**
   * Internal method that powers isCollection, isContainer, and isQueryable.
   * @protected
   * @param {string} [desc]
   * @param {Object} [info]
   * @param {mixed} [directive=null]
   */
  $isok(desc, info, directive=null) {
    let details = info.ok ? info : null;
    return this.ok(info.ok, desc, directive, details);
  }

  /**
   * Test using `@lumjs/web-core.utils.isCollection`.
   * @param {mixed} got
   * @param {string} [desc]
   * @param {Object} [opts]
   */
  isCollection(got, desc, opts = {}) {
    return this.$isok(desc, cp({}, opts, {
      ok: wcu.isCollection(got, opts.wanted, opts.arrayOf),
      got,
      comparitor: 'isCollection',
    }));
  }

  /**
   * Test using `@lumjs/web-core.utils.isContainer`.
   * @param {mixed} got
   * @param {string} [desc]
   * @param {Object} [opts]
   */
  isContainer(got, desc, opts = {}) {
    return this.$isok(desc, cp({}, opts, {
      ok: wcu.isContainer(got),
      got,
      comparitor: 'isContainer',
    }));
  }

  /**
   * Test using `@lumjs/web-core.utils.isQueryable`.
   * @param {mixed} got
   * @param {string} [desc]
   * @param {Object} [opts]
   */
  isQueryable(got, desc, opts = {}) {
    return this.$isok(desc, cp({}, opts, {
      ok: wcu.isQueryable(got),
      got,
      comparitor: 'isQueryable',
    }));
  }

}

const stringy = opts => opts.stringify ?? true;
const nota = opts => opts.not ?? false;
const wtp = WebTest.prototype;

for (let meth of ISA_TESTS) {
  let className = meth.substring(2);
  let classType = globalThis[className];
  df(wtp, meth, function(got, desc, opts = {}) {
    this.isa(got, classType, desc, stringy(opts), nota(opts));
  });
}

/**
 * A sub-test child returned by {@link WebTest#findTest}.
 * 
 * @prop {WebFindTypeTest} isCollection - {@link WebTest#isCollection}
 * @prop {WebFindTypeTest} isContainer - {@link WebTest#isContainer}
 * @prop {WebFindTypeTest} isDocument - Is the value a `Document`?
 * @prop {WebFindTypeTest} isElement - Is the value an `Element`?
 * @prop {WebFindTypeTest} isNode - Is the value a `Node`?
 * @prop {WebFindTypeTest} isQueryable - {@link WebTest#isQueryable}
 * @prop {WebFindTypeTest} isWindow - Is the value a `Window`?
 */
export class WebFindTest extends WebCore.query.FindResult {
  /**
   * Build a WebFindTest instance. Used by {@link WebTest#findTest}.
   * @param {WebTest} test - Instance that created this.
   */
  constructor(test) {
    super();
    this._test = test;
  }

  /**
   * Test the number of matches found.
   * @param {number} want - Number of matches you expect.
   * @param {string} [desc] Description of test.
   * @param {Object} [opts] Options.
   * @param {string} [opts.op="is"] Comparison operator, default: `'is'`.
   * 
   * See the `cmp()` method in the `@lumjs/tests.Test` class for details.
   * 
   * @param {boolean} [opts.stringify=true] The stringify test.cmp() argument.
   */
  isCount(want, desc, opts = {}) {
    let op = opts.op ?? 'is';
    return this._test.cmp(this.length, want, op, desc, stringy(opts));
  }

  /**
   * Use the `isa()` test from `@lumjs/tests.Test` on the found value.
   * @prop {Array} wants - Type(s) that are desired.
   * @prop {string} [desc] Description.
   * @prop {boolean} [stry=true] The stringify test.isa() argument.
   */
  isa(wants, desc, stry = true, not = false) {
    return this._test.isa(this.found, wants, desc, stry, not);
  }

  /**
   * Use the `nota()` test for `@lumjs/tests.Test` on the found value.
   * @prop {Array} wants - Type(s) that are desired.
   * @prop {string} [desc] Description.
   * @prop {boolean} [stry=true] The stringify test.isa() argument.
   */
  nota(wants, desc, stry) {
    return this.isa(wants, desc, stry, true);
  }

}

let wftp = WebFindTest.prototype;

for (let meth of ISA_TESTS.concat(WCU_TESTS)) {
  df(wftp, meth, function(desc, opts = {}) {
    return this._test[meth](this.found, desc, opts);
  });
}

/**
 * A WebTest type checking method.
 * 
 * The type it is testing for is predefined, and will be listed
 * in the individual property descriptions.
 * 
 * @callback WebTypeTest
 * @param {mixed} got - Value being tested.
 * @param {string} [desc] Description for test output.
 * @param {Object} [opts] Options.
 * @param {boolean} [opts.stringify=true] Stringify output?
 * @param {boolean} [opts.not=false] Test if value is NOT the type?
 */

/**
 * A WebFindTest predefined type checking method.
 * 
 * Calls the {@link WebTypeTest} method with the same name. 
 * Uses `this.found` as the `got` argument.
 * 
 * @callback WebFindTypeTest
 * @param {string} [desc] Description for test output.
 * @param {Object} [opts] Options; see {@link WebTypeTest} for details.
 */
