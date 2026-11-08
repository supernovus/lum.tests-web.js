# @lumjs/tests-web

A library for testing Web APIs. Provides a whole bunch of testing functions,
and helper classes. This core library *does not* mandate any particular DOM
implementation or library, so most of the functions can be used in a browser
environment, or make use of one of the excellent DOM libraries available for
most server-side JS runtimes.

## Exports

TODO

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
