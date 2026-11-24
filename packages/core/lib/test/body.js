import { nota, stringy } from './internal.js';
import LumTests from '@lumjs/tests';
import core from '@lumjs/core';

const CT = 'Content-Type';
const cp = Object.assign;
const lock = Object.freeze;
const LumTest = LumTests.Test;
const { isObj } = core.types;

/**
 * Attempt to decode the body from a Request or Response object,
 * using a specified decoding method.
 * 
 * @param {(Request|Response)} robj - Object to get the body from.
 * @param {string} getter - Name of the async method to call to get the body.
 * @returns {Promise<mixed>} The promise returned from this will resolve to 
 * the value from `await robj[tname]()`, or any error that was thrown.
 * 
 * It will resolve to a RangeError if `tname` did not exist in `robj`,
 * or was not a method/function.
 */
export async function getBodyAs(robj, getter) {
  if (typeof robj[getter] !== 'function') {
    return new RangeError("no such body decoding method: " + getter);
  }

  let body;

  try {
    body = await robj[getter]();
  }
  catch (err) {
    body = err;
  }

  return body;
}

/**
 * A base class for WebRequestTest and WebResponseTest.
 * @protected
 */
export class WebReqResTest {
  /**
   * @protected
   * @param {LumTest} test - WebTest or other LumTest sub-class instance.
   * @param {(Request|Response)} reObj - Request or Response being tested.
   */
  constructor(test, reObj, opts = {}) {
    this._test = test;
    this._obj = reObj;
    this.opts = opts;
  }

  /**
   * A getter that returns a URL object for the reObj.
   * It will be cached so multiple calls will use the same instance.
   * @returns {URL}
   */
  get url() {
    if (!this._urlObj) {
      this._urlObj = new URL(this._obj.url);
    }
    return this._urlObj;
  }

  $isaBody(info, ok, bodyType, errType = Error) {
    let { b, o, t, l } = info;

    if (typeof ok === 'function') {
      info.v = ok.call(info, b, l, o, t);
    }
    else {
      let want = ok ? bodyType : errType;
      t.isa(b, want, l, stringy(o), nota(o));
    }

    return info;
  }

  $urlProp(prop, want, label, opts) {
    let info = this.$with(opts, label);
    let { o, t } = info;
    let url = info.u = this.url;

    if (want instanceof RegExp) {
      t.matches(url[prop], want, label, stringy(o));
    }
    else {
      t.is(url[prop], want, label, stringy(o));
    }

    return info;
  }

  $with(opts, label, defClone = false) {
    opts = cp({}, this.opts, opts);
    return {
      l: label,
      o: opts,
      r: (opts.clone ?? defClone) ? this._obj.clone() : this._obj,
      t: this._test,
      w: this,
    }
  }

  async $withBody(getter, opts, label) {
    let info = this.$with(opts, label, true);
    info.b = await getBodyAs(info.r, getter);
    return info;
  }

  /**
   * Can the body be decoded as an ArrayBuffer?
   * @param {TestWantBody} want - What do you want?
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  async arrayBuffer(want, label, opts) {
    let info = await this.$withBody('arrayBuffer', opts, label);
    return this.$isaBody(info, want, ArrayBuffer);
  }

  /**
   * Can the body be decoded as a Blob?
   * @param {TestWantBody} want - What do you want?
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  async blob(want, label, opts) {
    let info = await this.$withBody('blob', opts, label);
    return this.$isaBody(info, want, Blob);
  }

  /**
   * Is there a body set?
   * @param {TestWantBody} want - What do you want?
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  body(want, label, opts) {
    let info = this.$with(opts, label, true);
    let { r, o, t } = info;

    if (typeof want === 'function') {
      info.v = want.call(info, r.body, label, o, t);
    }
    else if (want) {
      t.isa(r.body, ReadableStream, label, stringy(o));
    }
    else {
      t.is(r.body, null, label, stringy(o));
    }

    return info;
  }

  /**
   * Can the body be decoded as bytes? (`Uint8Array`)
   * @param {TestWantBody} want - What do you want?
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  async bytes(want, label, opts) {
    let info = await this.$withBody('bytes', opts, label);
    return this.$isaBody(info, want, Uint8Array);
  }

  /**
   * Test the Content-Type header value.
   * 
   * This literally just calls `this.headers()` with a fixed key name,
   * and the `{cleanHeaders: true}` option set automatically.
   * 
   * @param {(string|Regexp)} want - Header test.
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  contentType(want, label, opts) {
    opts = cp({ cleanHeaders: true }, opts);
    return this.headers(CT, want, label, opts);
  }

  /**
   * Can the body be decoded as a FormData object?
   * @param {TestWantBody} want - What do you want?
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  async formData(want, label, opts) {
    let info = await this.$withBody('formData', opts, label);
    return this.$isaBody(info, want, FormData);
  }

  /**
   * Test the URL hash value (`url.hash`).
   * @param {string} want - The value we want.
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  hash(want, label, opts) {
    return this.$urlProp('hash', want, label, opts);
  }

  /**
   * Test for specific headers.
   * @param {string} key - Name of the header to test.
   * @param {(string|RegExp|boolean)} want - Header test:
   * 
   * - A string will use: `test.is(headers.get(key), want, ...)`;
   *   see `opts.cleanHeaders` for notes on string tests.
   * - A RegExp will use: `test.matches(headers.get(key), want, ...)`;
   * - A boolean will use: `test.is(headers.has(key), want, ...)`;
   * 
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @param {boolean} [opts.cleanHeaders=false] Clean multipart header values?
   * 
   * This option is only used if `want` is a string!
   * 
   * If this is true, then anything after a `;` character will be removed
   * from the header value before testing it against the `want` string.
   * 
   * @returns {TestInfo}
   */
  headers(key, want, label, opts) {
    let info = this.$with(opts);
    let { r, o, t } = info;

    if (typeof want === 'string') {
      let value = r.headers.get(key);
      if (o.cleanHeaders) {
        value = value.split(/;/)[0];
      }
      t.is(value, want, label, stringy(o));
    }
    else if (want instanceof RegExp) {
      t.matches(r.headers.get(key), want, label, stringy(o));
    }
    else {
      t.is(r.headers.has(key), !!want, label, stringy(o));
    }

    return info;
  }

  /**
   * Test the URL host value (`url.host`).
   * @param {string} want - The value we want.
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  host(want, label, opts) {
    return this.$urlProp('host', want, label, opts);
  }

  /**
   * Test the URL hostname value (`url.hostname`).
   * @param {string} want - The value we want.
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  hostname(want, label, opts) {
    return this.$urlProp('hostname', want, label, opts);
  }

  /**
   * Test the URL href value (`url.href`).
   * @param {string} want - The value we want.
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  href(want, label, opts) {
    return this.$urlProp('href', want, label, opts);
  }

  /**
   * JSON body tests; exact test depends on arguments passed.
   * 
   * @param {(Object|string|boolean|WantBodyTest)} want - What do you want?
   * 
   * - An object will use: `test.isJSON(got, want, ...)`;
   * - A function will use: `want.call(info, got, label, opts, test)`;
   * - A string will use: `test.isa(got, want, ...)`;
   * - Boolean true will use: `test.nota(got, Error, ...)`;
   * - Boolean false will use: `test.isa(got, Error, ...)`;
   * 
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  async json(want, label, opts) {
    let info = await this.$withBody('json', opts, label);

    if (isObj(want)) {
      // A specific object to test against.
      info.t.isJSON(info.b, want, label);
    }
    else if (typeof want === 'function') {
      // Custom test function.
      info.v = want.call(info, b, label, o, t);
    }
    else if (typeof want === 'string') {
      // A string is used as an isa() test.
      this.$isaBody(info, true, label, want);
    }
    else {
      // false = isa(Error), true = nota(Error);
      let { b, o, t } = info;
      let op = want ? 'nota' : 'isa';
      t[op](b, Error, label, stringy(o));
    }

    return info;
  }

  /**
   * Test the URL origin value (`url.origin`).
   * @param {string} want - The value we want.
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  origin(want, label, opts) {
    return this.$urlProp('origin', want, label, opts);
  }

  /**
   * Test the URL password value (`url.password`).
   * @param {string} want - The value we want.
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  password(want, label, opts) {
    return this.$urlProp('password', want, label, opts);
  }

  /**
   * Test the URL pathname value (`url.pathname`).
   * @param {string} want - The value we want.
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  pathname(want, label, opts) {
    return this.$urlProp('pathname', want, label, opts);
  }

  /**
   * Test the URL port value (`url.port`).
   * @param {string} want - The value we want.
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  port(want, label, opts) {
    return this.$urlProp('port', want, label, opts);
  }

  /**
   * Test the URL protocol value (`url.protocol`).
   * @param {string} want - The value we want.
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  protocol(want, label, opts) {
    return this.$urlProp('protocol', want, label, opts);
  }

  /**
   * Test the URL search value (`url.search`).
   * @param {string} want - The value we want.
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  search(want, label, opts) {
    return this.$urlProp('search', want, label, opts);
  }

  /**
   * Test for specific URL search params (`url.searchParams`).
   * @param {string} key - Name of the search param to test.
   * @param {(string|Regexp|boolean)} want - Search param test:
   * 
   * - A string will use: `test.is(searchParams.get(key), want, ...)`;
   * - A RegExp will use: `test.matches(searchParams.get(key), want, ...)`;
   * - A boolean will use: `test.is(searchParams.has(key), want, ...)`;
   * 
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  searchParams(key, want, label, opts) {
    let info = this.$with(opts);
    let { o, t } = info;
    let u = info.u = this.url;

    if (typeof want === 'string') {
      t.is(u.searchParams.get(key), want, label, stringy(o));
    }
    else if (want instanceof RegExp) {
      t.matches(u.searchParams.get(key), want, label, stringy(o));
    }
    else {
      t.is(u.searchParams.has(key), !!want, label, stringy(o));
    }

    return info;
  }

  /**
   * Body text tests; exact test depends on arguments passed.
   * 
   * @param {(string|RegExp|boolean|WantBodyTest)} want - What do you want?
   * 
   * - A function will use: `want.call(info, got, label, opts, test)`;
   * - A string will use: `test.is(got, want, ...)`;
   * - A RegExp will use: `test.matches(got, want, ...)`;
   * - Boolean true will use: `test.isa(got, 'string', ...)`;
   * - Boolean false will use: `test.isa(got, Error, ...)`;
   * 
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  async text(want, label, opts) {
    let info = await this.$withBody('text', opts, label);
    let { b, o, t } = info;

    if (typeof want === 'function') {
      info.v = want.call(info, b, label, o, t);
    }
    else if (typeof want === 'string') {
      t.is(b, want, label, stringy(o));
    }
    else if (want instanceof RegExp) {
      t.matches(b, want, label, stringy(o));
    }
    else {
      this.$isaBody(info, want, label, 'string');
    }

    return info;
  }

  /**
   * Test the URL username value (`url.username`).
   * @param {string} want - The value we want.
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  username(want, label, opts) {
    return this.$urlProp('username', want, label, opts);
  }

}

export class WebRequestTest extends WebReqResTest {

  /**
   * Is the Request method a specific string?
   * @param {string} want - The HTTP request method.
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @param {boolean} [opts.httpUpperCase=true] Force `want` to uppercase?
   * @returns {TestInfo}
   */
  method(want, label, opts) {
    let info = this.$with(opts, label);
    let { r, o, t } = info;

    if ((o.httpUpperCase ?? true) && typeof want === 'string') {
      want = want.toUpperCase();
    }

    t.is(r.method, want, label, stringy(o));
    return info;
  }

}

export class WebResponseTest extends WebReqResTest {

  /**
   * Is the Response ok?
   * @param {boolean} [want=true] Should it be ok?
   * 
   * This parameter may be omitted entirely, in which case you can just pass
   * the `label` and `opts` arguments. The first argument is type-checked to
   * determine if it is the `want` or `label` argument.
   * 
   * Default: `true`.
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  ok(want = true, label, opts) {
    if (typeof want === 'string') {
      if (isObj(label)) {
        opts = label;
      }
      label = want;
      want = true;
    }

    let info = this.$with(opts, label);
    let { r, o, t } = info;

    t.is(r.ok, !!want, label, stringy(o));

    return info;
  }

  /**
   * Was the Response redirected?
   * @param {boolean} [want=true] Should it be ok?
   * 
   * This parameter may be omitted entirely, in which case you can just pass
   * the `label` and `opts` arguments. The first argument is type-checked to
   * determine if it is the `want` or `label` argument.
   * 
   * Default: `true`.
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  redirected(want = true, label, opts) {
    if (typeof want === 'string') {
      if (isObj(label)) {
        opts = label;
      }
      label = want;
      want = true;
    }

    let info = this.$with(opts, label);
    let { r, o, t } = info;

    t.is(r.redirected, !!want, label, stringy(o));

    return info;
  }

  /**
   * Test the Response status or statusText value.
   * @param {(number|string)} want - What should the status be?
   * 
   * - If this is a `string` then we try using parseInt(want, 10) on it;
   *   if that returns `NaN` then we test the string against `res.statusText`,
   *   otherwise the number from parseInt() will be used to test `res.status`.
   * - If this is a `number` we'll use it to test `res.status`.
   * 
   * @param {string} [label] Test name/label.
   * @param {Object} [opts] Options.
   * @returns {TestInfo}
   */
  status(want, label, opts) {
    let info = this.$with(opts, label);
    let { r, o, t } = info;

    if (typeof want === 'string') {
      let wnum = parseInt(want, 10);
      if (Number.isNaN(wnum)) {
        // Not a number, let's check the status text.
        t.is(r.statusText, want, label, stringy(o));
        return info;
      }
      want = wnum;
    }

    t.is(r.status, want, label, stringy(o));
    return info;
  }

}

/**
 * Body related tests that both testRequest() and testResponse() can handle
 * that have an easy arguments signature: `test.method(want, label, opts)`.
 * @alias RR_TESTS.BODY
 */
const BODY_TESTS = lock([
  'arrayBuffer', 'blob', 'body', 'bytes', 'formData', 'json', 'text',
  'contentType', // ← This should have its own category, but meh.
]);

/**
 * Tests that both testRequest() and testResponse() can handle that have a
 * slightly more complex signature: `test.method(key, want, label, opts)`.
 * The `key` is the name of the map item you want to test.
 * @alias RR_TESTS.MAP
 */
const MAP_TESTS = lock([
  'headers', 'searchParams',
]);

/**
 * Tests that testRequest() handles; same signature as the BODY tests.
 * @alias RR_TESTS.REQ_ONLY
 */
const REQ_ONLY_TESTS = lock(['method']);

/**
 * Tests that testResponse() handles; same signature as the BODY tests.
 * @alias RR_TESTS.RES_ONLY
 */
const RES_ONLY_TESTS = lock(['ok', 'redirected', 'status']);

/**
 * URL related tests that both testRequest() and testResponse() can handle
 * that have the same arguments signature as the BODY tests.
 * @alias RR_TESTS.URL
 */
const URL_TESTS = lock([
  'hash', 'host', 'hostname', 'href', 'origin', 'password', 'pathname',
  'port', 'protocol', 'search', 'username',
]);

/**
 * Lists of testing methods in WebRequestTest and WebResponseTest.
 */
export const RR_TESTS = lock({
  BODY: BODY_TESTS,
  MAP: MAP_TESTS,
  REQ_ONLY: REQ_ONLY_TESTS,
  RES_ONLY: RES_ONLY_TESTS,
  URL: URL_TESTS,
});

/**
 * Test context information object.
 * @typedef {Object} TestInfo
 * @prop {*} b - Request/Response body value (if applicable).
 * @prop {Object} o - Options.
 * @prop {(Request|Response)} r - Request or Response that is being tested.
 * @prop {WebTest} t - Test instance.
 * @prop {*} v - Value returned from custom test (if applicable).
 * @prop {WebReqResTest} w - WebRequestTest or WebResponseTest instance.
 */

/**
 * The wanted value for an async body test.
 * 
 * - If this is `true`, the test will validate the decoded body type.
 * - If this is `false`, the test checks that the decoder threw an error.
 * - If this is a `function`: `want.call(info, body, label, opts, test)`.
 * 
 * @typedef {(boolean|WantBodyTest)} TestWantBody
 */

/**
 * Custom body test.
 * @callback WantBodyTest
 * @this {TestInfo}
 * @param {*} got - Body value, or error thrown.
 * @param {string} label - Test description.
 * @param {Object} opts - Options.
 * @param {WebTest} test - Test instance.
 * @returns {*} Anything you want, or nothing at all.
 */
