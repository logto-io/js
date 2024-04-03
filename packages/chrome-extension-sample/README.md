# Logto Chrome extension sample

A sample Chrome extension that demonstrates how to integrate Logto in a Chrome extension.

This is also the final result of this blog post: [Monetize your Chrome extension with OpenID Connect (OAuth 2.0) authentication](https://blog.logto.io/monetize-chrome-extension-with-oidc-auth).

## Get started

Ensure you have the following installed:

- Node.js: https://nodejs.org/
- PNPM: https://pnpm.io/ (Other package managers may work, but this sample only tests with PNPM)

To test this sample, follow these steps:

1. Clone this repository.
2. In this directory, run `pnpm i`.
3. Create a `.env` file in this directory with the following content:
  ```env
  LOGTO_ENDPOINT=(replace with your Logto endpoint)
  LOGTO_APP_ID=(replace with your Logto app ID)
  ```
1. Run `pnpm build`.
2. Open Chrome and navigate to `chrome://extensions`, then enable Developer mode.
3. Click on "Load unpacked" and select the `dist` directory in this repository.

## Resources

[![Website](https://img.shields.io/badge/website-logto.io-8262F8.svg)](https://logto.io/)
[![Docs](https://img.shields.io/badge/docs-logto.io-green.svg)](https://docs.logto.io/)
[![Discord](https://img.shields.io/discord/965845662535147551?logo=discord&logoColor=ffffff&color=7389D8&cacheSeconds=600)](https://discord.gg/UEPaF3j5e6)
