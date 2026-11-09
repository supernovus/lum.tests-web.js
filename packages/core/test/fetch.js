// Tests for the Globals.fetch() built-in plugin.
import { CT, CT_JSON, CT_TEXT, Globals, WebTest } from '../lib/index.js';

const plan = 18;
const t = new WebTest({ module: import.meta, plan });

export default t;

// Save a copy of the native fetch() for testing against.
const originalFetch = globalThis.fetch;

async function tests() {
  // Register the fetch plugin, without passing a handler.
  let fp = await Globals.fetch();

  t.isnt(fetch, originalFetch, 'global fetch() has been replaced');

  // The first tests are for when no handler is assigned.
  let setname = '<no handler> fetch() ';
  let testUrl = 'http://localhost/test/';
  let res = await fetch(testUrl);

  t.isa(res, Response, setname+'returned Response');
  t.is(res.status, 500, setname+'status');
  
  let msg = await res.text();
  t.is(msg, 'No handler', setname+'body text');

  setname = '<inside handler> ';

  // Now a handler where we're testing the FetchContext instance.
  fp.setHandler(function(ctx) {

    t.isa(ctx.request, Request, setname+'ctx.request is a Request');
    t.isa(ctx.req, Request, setname+'ctx.req is a Request (clone)');

    let url = ctx.url;
    t.isa(url, URL, setname+'ctx.url is a URL');
    t.isa(url.pathname, '/test/', setname+'url.pathname is ok');

    return null; // We don't care about the response from this one.
  });

  res = await fetch(testUrl);
  t.is(res, null, setname+'response was null');


  setname = '<routed json> ';
  let e404 = 'Not found';
  let testData = { hello: 'world' };

  // Another way to set the handler.
  let fp2 = await Globals.fetch(function(ctx) {
    if (ctx.url.pathname === '/test/') {
      return ctx.jsonResponse(testData);
    }

    return ctx.textResponse(e404, 404);
  });

  t.is(fp2, fp, '2nd Global.fetch() returned same instance');

  res = await fetch(testUrl);
  t.isa(res, Response, setname+'returned Response');
  t.is(res.headers.get(CT), CT_JSON, setname+CT);
  msg = await res.json();
  t.isa(msg, 'object', setname+'body is object');
  t.is(msg.hello, 'world', setname+'body decoded');

  setname = '<routed 404> '
  testUrl = 'http://192.168.1.18:8080/zilch/zero.zip';
  res = await fetch(testUrl);
  t.is(res.headers.get(CT), CT_TEXT, setname+CT);
  t.is(res.status, 404, setname+'status');
  msg = await res.text();
  t.is(msg, e404, setname+'body text');

  fp.off(); // Restore fetch()

  t.is(fetch, originalFetch, 'global fetch() has been restored');
}

t.async(tests);
t.done();
