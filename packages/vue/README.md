# Logto Vue SDK
[![Version](https://img.shields.io/npm/v/@logto/vue)](https://www.npmjs.com/package/@logto/vue)
[![Build Status](https://github.com/logto-io/js/actions/workflows/main.yml/badge.svg)](https://github.com/logto-io/js/actions/workflows/main.yml)
[![Codecov](https://img.shields.io/codecov/c/github/logto-io/js)](https://app.codecov.io/gh/logto-io/js?branch=master)

The Logto Vue SDK written in TypeScript. Check out our [integration guide](https://docs.logto.io/integrate-sdk/vue) or [docs](https://docs.logto.io/sdk/vue) for more information.

We also provide [集成指南](https://docs.logto.io/zh-cn/integrate-sdk/vue) and [文档](https://docs.logto.io/zh-cn/sdk/vue) in Simplified Chinese.

## Installation

### Using npm

```bash
npm install @logto/vue
```

### Using yarn

```bash
yarn add @logto/vue
```

### Using pnpm

```bash
pnpm install @logto/vue
```

### Using CDN

```bash
<script src="https://logto.io/js/logto-sdk-vue/0.1.0/logto-sdk-vue.production.js" />
```

## Get Started

A sample project with the following code snippets can be found at [Vue Sample](https://github.com/logto-io/js/tree/master/packages/vue-sample)

Check out the source code and try it yourself. (We use [pnpm](https://pnpm.io/) for package management)

```bash
pnpm i && pnpm start
```

### Import Logto Vue plugin

```ts
import { createLogto, LogtoConfig } from '@logto/vue';

const config: LogtoConfig = {
  appId: '<your-application-id>',
  endpoint: '<your-logto-endpoint>'
};

const app = createApp(App);

app.use(createLogto, config);
app.mount("#app");
```

### Setup your sign-in

```ts
import { useLogto } from "@logto/vue";

const { signIn } = useLogto();
const onClickSignIn = () => signIn(redirectUrl);
```

```html
<button @click="onClickSignIn">Sign In</button>
```

### Retrieve Auth Status

```ts
import { useLogto } from '@logto/vue';

const { isAuthenticated } = useLogto();
```

```html
<div v-if="!isAuthenticated">
  <!-- E.g. navigate to the sign in page -->
</div>
<div v-else>
  <!-- Do things when user is authenticated -->
</div>
```

### Sign out

```ts
import { useLogto } from "@logto/vue";

const { signOut } = useLogto();
const onClickSignOut = () => signOut('http://localhost:1234');
```

```html
<button @click="onClickSignOut">Sign Out</button>
```

## Resources

[![Website](https://img.shields.io/badge/website-logto.io-8262F8.svg)](https://logto.io/)
[![Docs](https://img.shields.io/badge/docs-logto.io-green.svg)](https://docs.logto.io/docs/sdk/swift/)
[![Discord](https://img.shields.io/discord/965845662535147551?logo=discord&logoColor=ffffff&color=7389D8&cacheSeconds=600)](https://discord.gg/UEPaF3j5e6)
