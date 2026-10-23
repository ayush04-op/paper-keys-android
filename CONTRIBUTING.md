# Contributing to Paper Keys

Thanks for your interest in improving Paper Keys. Bug reports, accessibility feedback, documentation improvements, and focused pull requests are welcome.

## Before you begin

- Search existing issues and pull requests to avoid duplicating work.
- For larger changes, open an issue first to discuss the user need and proposed approach.
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Development setup

Use a supported Node.js version, pnpm, and (for Android-native work) the Android SDK. Install dependencies and run the existing checks:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm lint
pnpm exec expo prebuild --platform android --no-install
```

For an installed Android test build, use `pnpm android` with a configured emulator/device, or build the project through its managed Expo workflow. Expo Web is useful for the companion screens but cannot verify the Android keyboard service.

## Pull requests

- Keep changes focused and explain the behavior or user problem they address.
- Update the README or other docs when setup, privacy, or user-visible behavior changes.
- Never include credentials, personal data, or real typed text in source, screenshots, logs, or test fixtures.
- For input-service or preference-bridge changes, describe the Android version/device used for verification. If you cannot test natively, state that clearly.
- Run `pnpm check` and `pnpm lint` before requesting review.

By submitting a contribution, you agree that it will be distributed under the repository’s [MIT License](LICENSE).
