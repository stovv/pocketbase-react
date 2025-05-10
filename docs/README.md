# PocketBase React SDK

[![Npm package version](https://badgen.net/npm/v/pocketbase-react)](https://npmjs.com/package/pocketbase-react)

Unofficial React SDK (React, React Native, Expo) for interacting with the [PocketBase JS SDK](https://github.com/pocketbase/js-sdk).

## Features

- 🔄 Real-time subscriptions and connection status monitoring
- 🔐 Authentication with email and OAuth providers
- 📱 React Native and Expo compatibility
- 🎣 Powerful hooks for data management
- 🔄 Redux integration for state management
- 🚀 TypeScript support
- 📡 Connection status monitoring
- 🔍 Advanced record filtering and sorting

## Available Hooks

- `useCollection` - For managing collection of records
- `useRecord` - For working with single records
- `useConnectionStatus` - For monitoring connection state
- `useClient` - For accessing PocketBase client instance
- `useAuth` - For authentication management

## Quick Links

- [Getting Started](getting-started.md)
- [Authentication](authentication.md)
- [Content Fetching](content-fetching.md)
- [NPM Package](https://www.npmjs.com/package/pocketbase-react)
- [GitHub Repository](https://github.com/tobicrain/pocketbase-react)

## Version 1.0.0 Changes

### Breaking Changes
- Removed deprecated hooks: `useAppContent`, `useAuth`, `useClientContext`
- Completely reworked data storage architecture using Redux
- Renamed `usePocketBase` hook to `useClient`

### New Features
- Connection status monitoring with `useConnectionStatus`
- Improved record management with `useRecord` and `useCollection`
- Better TypeScript support
- Enhanced performance through memoization

## License

This project is licensed under the MIT License. 