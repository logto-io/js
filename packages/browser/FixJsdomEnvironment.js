// https://github.com/microsoft/TypeScript/issues/50690
// eslint-disable-next-line import/no-named-default
import { default as JSDOMEnvironment } from 'jest-environment-jsdom';

// https://github.com/facebook/jest/blob/v29.4.3/website/versioned_docs/version-29.4/Configuration.md#testenvironment-string
export default class FixJsdomEnvironment extends JSDOMEnvironment.default {
  constructor(...args) {
    super(...args);

    // FIXME https://github.com/jsdom/jsdom/issues/1724
    this.global.fetch = fetch;
    this.global.Headers = Headers;
    this.global.Request = Request;
    this.global.Response = Response;
  }
}
