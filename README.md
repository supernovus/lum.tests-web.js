# lum.tests-web.js (mono-repo)

This is a mono-repo containing the sources for a collection of packages
for testing DOM and other Web-related APIs, mostly designed for use with
non-browser JS engines like Node.js, Deno, Bun, etc.

It offers full integration with my [@lumjs/tests] package, but most of the
helper functions and classes can be used with any testing framework you like.

It's split up into multiple packages so that there is a simple core that
provides the basic test functions without mandating a specific global DOM.

## Packages

|          Folder           |         Package          |    Description     |
| ------------------------- | ------------------------ | ------------------ |
| [core](./packages/core)   | [@lumjs/tests-web]       | Core library       |
| [happy](./packages/happy) | [@lumjs/tests-web-happy] | [happy-dom] plugin |
| [jsdom](./packages/jsdom) | [@lumjs/tests-web-jsdom] | [jsdom] plugin     |

## Future Ideas

- A package for testing with the [canvas] APIs.

## Author

Timothy Totten <2010@totten.ca>

## License

[MIT](https://spdx.org/licenses/MIT.html)

[@lumjs/tests]: https://www.npmjs.com/package/@lumjs/tests
[@lumjs/tests-web]: https://www.npmjs.com/package/@lumjs/tests-web
[@lumjs/tests-web-happy]: https://www.npmjs.com/package/@lumjs/tests-web-happy
[@lumjs/tests-web-jsdom]: https://www.npmjs.com/package/@lumjs/tests-web-jsdom

[canvas]: https://www.npmjs.com/package/canvas
[happy-dom]: https://www.npmjs.com/package/@happy-dom/global-registrator
[jsdom]: https://www.npmjs.com/package/global-jsdom
