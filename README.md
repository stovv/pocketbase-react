# PocketBase React SDK

[![Npm package version](https://badgen.net/npm/v/pocketbase-react)](https://npmjs.com/package/pocketbase-react)

Unofficial React SDK for working with [PocketBase JS SDK](https://github.com/pocketbase/js-sdk). Supports React, React Native, and Expo.

## Features

- 🔄 Automatic real-time data synchronization
- 🎯 TypeScript support out of the box
- 📱 React Native and Expo support
- 🔐 Built-in authentication system
- 🎨 Simple and intuitive API

## Quick Start

### Installation

```bash
# Using npm
npm install pocketbase-react --save

# Using yarn
yarn add pocketbase-react
```

For React Native/Expo additional setup, see [React Native Setup Guide](./docs/getting-started.md#react-native--expo).

### Basic Setup

```tsx
import { PocketBaseProvider } from 'pocketbase-react';

const App = () => {
  return (
    <PocketBaseProvider
      serverURL="YOUR_SERVER_URL"
      webRedirectURL="http://localhost:3000"
      mobileRedirectURL="expo://localhost:19000"
    >
      <YourApp />
    </PocketBaseProvider>
  );
};
```

## Documentation

- [Getting Started](./docs/getting-started.md)
- [Authentication](./docs/authentication.md)
- [Content Fetching](./docs/content-fetching.md)
- [Available Hooks](./docs/hooks.md)

For detailed examples and API reference, visit our [documentation](./docs/).

## Development

```bash
# Install dependencies
yarn install

# Run tests
yarn test

# Build project
yarn build
```

## License

MIT
