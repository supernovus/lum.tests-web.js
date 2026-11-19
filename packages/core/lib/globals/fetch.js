import Plugin from "./plugin.js";

export const CT = 'Content-Type';
export const CT_JSON = 'application/json';
export const CT_TEXT = 'text/plain';

/**
 * A built-in plugin that replaces the global fetch() function with
 * a version that redirects the Request to a custom handler.
 * 
 * There are definite limitations to this implementation,
 * and it's not going to cover 100% of use cases, but it should
 * be a decent way to test basic fetch() features in tests.
 */
export class FetchPlugin extends Plugin {

  /**
   * Build a FetchPlugin.
   * @param {?(ctx: FetchContext) => Response} [handler]
   * @param {Object} [opts]
   */
  constructor(handler, opts) {
    if (handler && typeof handler === 'object' && !opts) {
      opts = handler;
    }

    super(opts);

    if (typeof handler === 'function') {
      this.handler = handler;
    }
  }

  enable_Plugin(state) {
    state.save(['fetch']);
    globalThis.fetch = this.fetch.bind(this);
  }

  /**
   * A bound version of this will be used as the fetch() global.
   * 
   * It's arguments are used to create a new FetchContext instance,
   * which is then passed to the `this.handler` function/method.
   * 
   * @param {mixed} request
   * @param {Object} [options]
   */
  async fetch(request, options) {
    if (typeof this.handler !== 'function') {
      this.handler = defaultHandler;
    }

    let CtxClass = this.options.contextClass ?? FetchContext;
    let ctx = new CtxClass(request, options);
    return this.handler(ctx);
  }

  disable_Plugin(state) {
    state.restore(true);
  }

  /**
   * Set the handler to be used to handle fetch() requests.
   * @param {(ctx: FetchContext) => Response} handler
   * @returns {this}
   */
  setHandler(handler) {
    if (typeof handler !== 'function') {
      throw new TypeError("handler must be a function");
    }

    this.handler = handler;
    return this;
  }

}

/**
 * Default handler function that will be used if none is assigned.
 * 
 * Simply returns a Response with a status code `500`, and a plain-text
 * message of 'No handler'. Doesn't care about the Request at all.
 * @private
 */
function defaultHandler(ctx) {
  return ctx.textResponse('No handler', 500);
}

/**
 * Replace the useless `url` property on manually generated Response objects.
 * 
 * The `url` property on manually constructed Response objects is always `""`.
 * In order to generate more realistic Response objects, this function will
 * allow you to replace that useless getter with a proper URL value.
 * 
 * @param {Response} res - Response instance.
 * @param {(string|URL)} url - URL to assign to `res.url` property.
 * 
 * The `url` property is always expected to be a string, so `url.toString()` 
 * is called to ensure the assigned value is the correct value type.
 * If you use a custom URL sub-class, make sure it handles that correctly!
 * 
 * @returns {Response} The res argument is returned.
 */
export const setResponseUrl = (res, url) => Object.defineProperty(res, 'url', 
{
  configurable: true,
  enumerable: true,
  value: url.toString(),
});

/**
 * Build a Response object.
 * 
 * This is basically just sugar coating over the Response constructor.
 * 
 * It's available as a standalone exported function, or as a method of the
 * {@link FetchContext} object which is passed to fetch() handlers.
 * 
 * @param {?(string|Object)} [body] Body for Response.
 * 
 * Use `null` (the default), if the Response does not have a body.
 * 
 * @param {(Object|number)} [resInit] Response init options.
 * 
 * If this is a number, it will be used as `resInit.status`.
 * If this is an instance of `Headers`, it will be used as `resInit.headers`.
 * Any other object will be used directly as the Response options.
 * 
 * @param {(Object|string)} [opts] Options.
 * 
 * If this is a `string`, it will be used as `opts.contentType`.
 * If this is an instance of `URL`, it will be used as `opts.url`.
 * 
 * @param {string} [opts.contentType] A `Content-Type` header value to set.
 * @param {string} [opts.ctype] An shorter alias for `opts.contentType`.
 * @param {(string|URL)} [opts.url] See {@link setResponseUrl}.
 * 
 * @returns {Response}
 */
export function respond(body, resInit, opts = {}) {
  if (typeof resInit === 'number') {
    resInit = { status: resInit };
  }
  else if (resInit instanceof Headers) {
    resInit = { headers: resInit };
  }
  else if (!resInit || typeof resInit !== 'object') {
    resInit = {};
  }

  if (!(resInit.headers instanceof Headers)) {
    resInit.headers = new Headers(resInit.headers);
  }

  if (typeof opts === 'string') {
    opts = { contentType: opts };
  }
  else if (opts instanceof URL) {
    opts = { url: opts };
  }
  else if (!opts || typeof opts !== 'object') {
    opts = {};
  }

  let ctype = opts.contentType ?? opts.ctype;
  if (typeof ctype === 'string') {
    resInit.headers.set(CT, ctype);
  }

  let res = new Response(body, resInit);

  if (opts.url === 'string' || opts.url instanceof URL) {
    setResponseUrl(res, opts.url);
  }

  return res;
}

/**
 * An object that will be passed to fetch handlers.
 * 
 * It wraps the Request with some useful helpers, and provides quick ways
 * to build Response objects to return from the handler.
 */
export class FetchContext {
  constructor(request, options) {
    if (request instanceof Request && !options) {
      this.request = request;
    }
    else {
      this.request = new Request(request, options);
    }
  }

  /**
   * A getter that returns the `Content-Type` Request header.
   * @returns {string}
   */
  get contentType() {
    return this.request.headers.get(CT);
  }

  /**
   * A getter that returns the Request headers.
   * @returns {Headers}
   */
  get headers() {
    return this.request.headers;
  }

  /**
   * A getter that returns a clone of `this.request`.
   * 
   * This is the safest way to do anything involving the body,
   * as it's a one-use ReadableStream, so by making a clone,
   * you can access it multiple times without affecting the original.
   * @returns {Request}
   */
  get req() {
    return this.request.clone();
  }

  /**
   * A getter that returns a `URL` object wrapping `this.request.url`.
   * @returns {URL}
   */
  get url() { 
    return new URL(this.request.url);
  }

  /**
   * A shortcut for `this.req.json()`.
   * @returns {Object}
   */
  async json() {
    return this.req.json();
  }

  /**
   * Generate a JSON Response.
   * 
   * Uses `this.respond()`. Will automatically set the Content-Type header,
   * and convert an object into a JSON body.
   * 
   * @param {Object} data - Data to turn into JSON Response body.
   * @param {(Object|number)} [resInit] Response init, or status code number.
   * @param {Object} [resInit.headers] Either a Headers instance,
   * or a headersInit object to pass to the Headers constructor.
   * @returns {Response}
   */
  jsonResponse(data, resInit) {
    return this.respond(JSON.stringify(data), resInit, CT_JSON);
  }

  /**
   * Generate a plain text Response.
   * 
   * Uses `this.respond()`. Will automatically set the Content-Type header,
   * and uses the text argument as the body as-is.
   * 
   * @param {Object} text - Text to use as the Response body.
   * @param {(Object|number)} [resInit] Response init, or status code number.
   * @param {Object} [resInit.headers] Either a Headers instance,
   * or a Headers init object to pass to the Headers constructor.
   * @returns {Response}
   */
  textResponse(text, resInit) {
    return this.respond(text, resInit, CT_TEXT);
  }

}

FetchContext.prototype.respond = respond;

export default FetchPlugin;
