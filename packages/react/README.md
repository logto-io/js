# Logto React SDK
[![Version](https://img.shields.io/npm/v/@logto/react)](https://www.npmjs.com/package/@logto/react)
[![Build Status](https://github.com/logto-io/js/actions/workflows/main.yml/badge.svg)](https://github.com/logto-io/js/actions/workflows/main.yml)
[![Codecov](https://img.shields.io/codecov/c/github/logto-io/js)](https://app.codecov.io/gh/logto-io/js?branch=master)

The Logto React SDK written in TypeScript. Check out our [integration guide](https://docs.logto.io/integrate-sdk/react) or [docs](https://docs.logto.io/sdk/react) for more information.

We also provide [集成指南](https://docs.logto.io/zh-cn/integrate-sdk/react) and [文档](https://docs.logto.io/zh-cn/sdk/react) in Simplified Chinese.

## Installation

### Using npm

```bash
npm install @logto/react
```

### Using yarn

```bash
yarn add @logto/react
```

### Using pnpm

```bash
pnpm install @logto/react
```

### Using CDN

```bash
<script src="https://logto.io/js/logto-sdk-react/0.1.0/logto-sdk-react.production.js" />
```

## Get Started

A sample project with the following code snippets can be found at [React Sample](https://github.com/logto-io/js/tree/master/packages/react-sample)

Check out the source code and try it yourself. (We use [pnpm](https://pnpm.io/) for package management)

```bash
pnpm i && pnpm start
```

### Initiate LogtoClient

```tsx
import { LogtoProvider, LogtoConfig } from '@logto/react';

const App = () => {
  const config: LogtoConfig = {
    clientId: 'foo',
    endpoint: 'https://your-endpoint-domain.com'
  };

  return (
    <BrowserRouter>
      <LogtoProvider config={config}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/callback" element={<Callback />} />
          <Route
            path="/protected-resource"
            element={
              <RequireAuth>
                <ProtectedResource />
              </RequireAuth>
            }
          />
        </Routes>
      </LogtoProvider>
    </BrowserRouter>
  );
};
```

### Setup your sign-in

```tsx
import { useLogto } from '@logto/react';

const SignInButton = () => {
  const { signIn } = useLogto();
  const redirectUrl = window.location.origin + '/callback';

  return <button onClick={() => signIn(redirectUrl)}>Sign In</button>;
};

export default SignInButton;
```

### Retrieve Auth Status

```tsx
import { useLogto } from '@logto/react';

const App = () => {
  const { isAuthenticated, signIn } = useLogto();

  if !(isAuthenticated) {
    return <SignInButton />
  }

  return <>
    <AppContent />
    <SignOutButton />
  </>
};
```

### Sign out

```tsx
import React from 'react';
import { useLogto } from '@logto/react';

const SignOutButton = () => {
  const { signOut } = useLogto();
  const postLogoutRedirectUri = window.location.origin;

  return <button onClick={() => signOut(postLogoutRedirectUri)}>Sign out</button>;
};

export default SignOutButton;
```

## Resources

[![Website](https://img.shields.io/badge/website-logto.io-8262F8.svg)](https://logto.io/)
[![Docs](https://img.shields.io/badge/docs-logto.io-green.svg)](https://docs.logto.io/docs/sdk/swift/)
[![Discord](https://img.shields.io/discord/965845662535147551?logo=discord&logoColor=ffffff&color=7389D8&cacheSeconds=600)](https://discord.gg/UEPaF3j5e6)
