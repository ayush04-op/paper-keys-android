# Paper Keys

**A calmer Android keyboard, shaped by paper.** Paper Keys pairs a minimal, serif-led companion app with a warm, tactile system keyboard for people who want fewer distractions while they write.

> **Project status:** The companion app and Android input-method source are implemented. A native Android APK/AAB build and on-device verification are still pending; Expo Web is only a preview and does not install a system keyboard.

## Features

- **Android system keyboard:** A native `InputMethodService` that inserts text into the focused editor through Android’s `InputConnection`.
- **Everyday typing:** QWERTY letters, shift and caps lock, number/symbol layouts, punctuation, space, backspace, and editor-aware enter actions.
- **Responsive layout:** Weighted key rows and orientation-aware sizing for different phone screens.
- **Paper-inspired interface:** Warm paper, ink, and muted-clay colors, a restrained surface grain, and serif typography.
- **Try before enabling:** A tappable in-app keyboard preview, with the key-pop preview controlled by the same preference as the native keyboard.
- **Simple preferences:** On-device controls for key sounds, vibration, and key preview.
- **Android onboarding:** Direct actions to enable Paper Keys in keyboard settings and choose it in Android’s keyboard picker.

## Android installation and setup

After an Android APK is built and installed, open Paper Keys and tap **Enable keyboard**. Turn on Paper Keys in Android’s keyboard settings, return to the app, and tap **Choose keyboard**. Android requires users to explicitly enable and select third-party keyboards.

The actual input method is native Android code. Expo Web and Expo Go can show the companion interface, but neither provides the system-wide keyboard; use a native APK/AAB to verify typing in other apps.

## Build and development

The project uses Expo Router, React Native, TypeScript, and a local Expo config plugin for the Android IME. For local development, install Node.js, pnpm, and (for Android builds) the Android SDK.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm lint
pnpm exec expo prebuild --platform android
pnpm android
```

### GitHub Actions debug APK

Every push to `main` builds the Android `debug` variant in GitHub Actions. To start a build manually, open **Actions → Android debug APK → Run workflow**. When it finishes, download the `paper-keys-debug-apk` artifact from that run; artifacts are retained for 14 days. This is a development build, not a Play Store release, and its companion UI may need a Metro development server.

For a managed APK/AAB build, checkpoint the source in Manus and use the project Dashboard’s Android build action.

## Privacy

The Android keyboard service commits the selected key into the focused app and does not store or transmit typed text. Sound, vibration, and key-preview preferences are stored locally on the device. Android displays its own system warning when a third-party keyboard is enabled; that platform warning applies to all third-party input methods.

## Project structure

- `app/` — Paper Keys home, interactive preview, and preferences screens.
- `components/` — Reusable paper-styled keyboard preview.
- `constants/` — Shared paper, ink, and clay design tokens.
- `lib/` — Preference storage and the native Android bridge interface.
- `plugins/with-paper-keys-ime.js` — Expo config plugin that registers the Android input method and bridge.
- `plugins/android/` — Native input service, Android preferences bridge, and IME metadata.
- `assets/images/` — Launcher, adaptive-icon, splash, favicon, and paper-grain artwork.

## Contributing

Bug reports and focused pull requests are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md), follow the [Code of Conduct](CODE_OF_CONDUCT.md), and use the issue templates for actionable reports. For security concerns, see [SECURITY.md](SECURITY.md). Changes to the input service or settings bridge should be built and tried on an Android device, since a Web preview cannot validate native keyboard behavior.

## License

Paper Keys is released under the [MIT License](LICENSE).
