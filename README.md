# Paper Keys

**A quieter keyboard with the familiar shape of Gboard and the feel of paper.** Paper Keys is an independent, lightweight Android input method with warm paper colors, a clean sans-serif layout, and no cloud-first extras. It is inspired by familiar keyboard ergonomics; it does not contain or modify Google's proprietary Gboard source.

> **Build status:** A standalone debug APK with its JavaScript bundle is being produced by the current GitHub Actions workflow. The first APK artifact predates that standalone-build fix and is not the recommended no-Metro build. Launcher and rapid-typing behavior still need an on-device retest.

## Features

- **Android system keyboard:** A native `InputMethodService` that inserts text into the focused editor through Android's `InputConnection`.
- **Familiar typing layout:** QWERTY rows, shift and caps lock, punctuation, space, backspace, and editor-aware enter actions.
- **Useful basics:** An optional dedicated number row, long-press number hints, repeat-delete, and a compact emoji page.
- **Paper-inspired interface:** Warm paper, ink, and muted-clay colors, a restrained surface grain, and clear sans-serif controls and key legends.
- **Local-only preferences:** On-device switches for the number row, key preview, haptics, and key sounds; all feedback options start off.
- **Try before enabling:** A tappable companion-app keyboard preview and direct actions to enable/select the keyboard in Android settings.
- **No online bloat:** No ads, analytics, cloud typing, search, AI, or dictation. Typed text is passed directly to the focused app.

Paper Keys is a small, custom keyboard rather than a full Gboard replacement. It currently does not provide swipe typing, autocorrect, predictive suggestions, or a personal dictionary.

## Android installation and setup

Install a standalone debug APK, open **Paper Keys**, tap **Enable keyboard**, and turn it on in Android's keyboard settings. Return to the app and tap **Choose keyboard**. Android requires users to explicitly enable and select third-party keyboards.

The Android input method itself is native code. Expo Web and Expo Go can display the companion interface and interactive preview, but they do not install a system-wide keyboard.

## Build and development

The project uses Expo Router, React Native, TypeScript, and a local Expo config plugin for the Android IME. Local development requires Node.js and pnpm; Android builds also require the Android SDK.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm lint
pnpm exec expo prebuild --platform android
pnpm android
```

The ordinary local debug variant uses React Native's Metro developer support. To build a standalone debug APK locally after prebuild, run:

```sh
cd android
./gradlew --no-daemon -PpaperKeysStandaloneDebug=true :app:assembleDebug
```

### GitHub Actions debug APK

The [`Android debug APK` workflow](https://github.com/ayush04-op/paper-keys-android/actions/workflows/android-debug-apk.yml) builds the standalone `debug` variant on relevant source changes to `main`, or manually via **Actions → Android debug APK → Run workflow**. It verifies that the JavaScript bundle is inside the APK before uploading the `paper-keys-debug-apk` artifact. Artifacts are retained for 14 days. This is a development APK, not a Play Store release.

## Privacy and current limits

The keyboard commits selected keys into the focused app and does not store or transmit typed text. Preferences are stored locally on the device. Android displays its standard system warning when a third-party keyboard is enabled.

There is no autocorrection, prediction strip, glide typing, voice input, cloud service, or cross-device sync. The native keyboard is built and run on Android; Web Preview cannot verify real-device typing performance.

## Project structure

- `app/` — Paper Keys home, interactive preview, and preferences screens.
- `components/` — Reusable paper-styled keyboard preview.
- `constants/` — Shared paper, ink, and clay design tokens.
- `lib/` — Preference storage and the native Android bridge interface.
- `plugins/with-paper-keys-ime.js` — Expo config plugin that registers the Android input method and bridge.
- `plugins/android/` — Native input service, Android preferences bridge, and IME metadata.
- `assets/images/` — Launcher, adaptive-icon, splash, favicon, and paper-grain artwork.

## Contributing

Bug reports and focused pull requests are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md), follow the [Code of Conduct](CODE_OF_CONDUCT.md), and use the issue templates for actionable reports. For security concerns, see [SECURITY.md](SECURITY.md). Changes to the input service or settings bridge should be built and tried on an Android device.

## License

Paper Keys is released under the [MIT License](LICENSE).
