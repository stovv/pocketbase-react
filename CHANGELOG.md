# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-03-26

### Added
- New `useConnectionStatus` hook for connection state tracking
- New hooks for record management: `useRecord`, `useCollection`
- Added documentation in `docs/` directory
- Added connection state context `ConnectionStatusContext`
- TypeScript types for all components and hooks

### Changed
- Completely reworked data storage architecture using Redux
- Updated all dependencies to latest versions
- Improved performance through memoization
- Renamed `usePocketBase` hook to `useClient`
- Reorganized file structure for better maintainability

### Removed
- Removed deprecated hooks: `useAppContent`, `useAuth`, `useClientContext`
- Removed unused interfaces and types

## [0.1.5] - 2022-10-10

### Changed

- SDK now uses custom @tobicrain/pocketbase javascript framework

## [0.1.4] - 2022-10-10

### Fixed

- SDK now runs on React and React Native

## [0.1.3] - 2022-10-06

### Changed

- Redux now toggles between localStorage / AsyncStorage

## [0.1.2] - 2022-10-05

### Changed

- Adjusted Rollup / Babel Config for use in React

## [0.1.1] - 2022-10-04

### Changed

- initialCollections now also "subscribe" instead of just "fetch" content once

## [0.1.0] - 2022-10-03

### Added

- Initial commit

### Changed

- Readme Instructions and so on
