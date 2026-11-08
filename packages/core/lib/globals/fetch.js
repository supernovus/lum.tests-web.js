import Plugin from "./plugin.js";

/**
 * A built-in plugin that replaces the global fetch() function with
 * a version that redirects the Request to a custom handler.
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

    let ctx = new FetchContext(request, options);
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
 */
function defaultHandler() {
  return new Response('No handler', { 
    status: 500,
    headers: new Headers({ 'Content-Type': 'text/plain' }),
  });
}

/**
 * An object that will be passed to fetch handlers.
 * It wraps the Request with some useful helpers,
 * and provides a quick way to build Response items.
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
   * A getter that returns a clone of `this.request`.
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
   * Generate a JSON response.
   * 
   * Will automatically set the Content-Type header,
   * and convert an object into a JSON body.
   * @param {Object} data - Data to turn into JSON body.
   * @param {Object} [resInit] A Response init object.
   * @param {Object} [resInit.headers] Either a Headers instance,
   * or a headersInit object to pass to the Headers constructor.
   * @returns {Response}
   */
  jsonResponse(data, resInit = {}) {
    if (!(resInit.headers instanceof Headers)) {
      resInit.headers = new Headers(resInit.headers);
    }
    resInit.headers.set('Content-Type', 'application/json');
    return new Response(JSON.stringify(data), resInit);
  }

}

export default FetchPlugin;
