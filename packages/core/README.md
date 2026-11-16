# @lumjs/tests-web

A library for testing Web APIs. Provides a whole bunch of testing functions,
and helper classes. This core library *does not* mandate any particular DOM
implementation or library, so most of the functions can be used in a browser
environment, or make use of one of the excellent DOM libraries available for
most server-side JS runtimes.

## Exports

The lists below contain what I think are the most useful exports from each
of the modules. The source and/or documentation has a more complete list.

### Module: `@lumjs/tests-web`

The default module exports everything needed to build tests specifically
for the HTML DOM and other Web APIs.

It exports all _named exports_ from the `globals` and `test` sub-modules.
It also provides the `WebTest` class as the _default export_.

### Module: `@lumjs/tests-web/globals`

A sub-module related to managing the global namespace.

|   Export name   |                       Description                        |
| --------------- | -------------------------------------------------------- |
| `FetchPlugin`   | A `fetch()` global replacement designed for testing.     |
| `Globals`       | A singleton object that manages the global JS namespace. |
| `GlobalsPlugin` | Abstract class for `Globals` plugins.                    |
| `respond()`     | A function for quickly building Response objects.        |
| _default_       | Aliased to the `Globals` singleton object.               |

### Module: `@lumjs/tests-web/test`

A sub-module providing an extension of the Test class from [@lumjs/tests],
plus assorted child classes that extend its abilities even further.

|    Export name    |                     Description                     |
| ----------------- | --------------------------------------------------- |
| `LumTest`         | `Test` class from [@lumjs/tests], re-exported here. |
| `WebTest`         | A class extending `LumTest` for Web/DOM testing.    |
| `WebFindTest`     | A child class returned by `WebTest.findTest()`.     |
| `WebRequestTest`  | A child class returned by `WebTest.testRequest()`.  |
| `WebResponseTest` | A child class returned by `WebTest.testResponse()`. |

## DOM Extensions

Separate packages exist that add support for various DOM libraries so that
tests can be run on server-side engines rather than in a browser.

|    Extension Package     |      Supported DOM Package      |
| ------------------------ | ------------------------------- |
| [@lumjs/tests-web-happy] | [@happy-dom/global-registrator] |
| [@lumjs/tests-web-jsdom] | [global-jsdom]                  |

## Official URLs

This library can be found in two places:

 * [Github](https://github.com/supernovus/lum.tests-web.js/tree/main/packages/core)
 * [NPM](https://www.npmjs.com/package/@lumjs/tests-web)

## Author

Timothy Totten <2010@totten.ca>

## License

[MIT](https://spdx.org/licenses/MIT.html)

[@lumjs/tests]: https://www.npmjs.com/package/@lumjs/tests
[@lumjs/tests-web-happy]: https://www.npmjs.com/package/@lumjs/tests-web-happy
[@lumjs/tests-web-jsdom]: https://www.npmjs.com/package/@lumjs/tests-web-jsdom

[@happy-dom/global-registrator]: https://www.npmjs.com/package/@happy-dom/global-registrator
[global-jsdom]: https://www.npmjs.com/package/global-jsdom
