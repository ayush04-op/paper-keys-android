# Paper Keys — TODO

## App launch and responsiveness

- [ ] Opening the installed Android app launches the companion interface without requiring a running Metro server; the Android debug APK must include the app's JavaScript bundle.
- [ ] Typing with the Android keyboard is prompt from the first key and remains responsive during fast sequences without dropping characters.

## Android keyboard behavior and design

- [ ] Provide a standard QWERTY letter layout with responsive tap input; clear shift and caps-lock states; switchable numbers and symbols layouts; and essential editing/action keys including space, backspace, enter, and punctuation.
- [ ] Make the keyboard feel familiar like the base Google Keyboard/Gboard while retaining the paper theme; keep its layout and interface readable, compact, and polished.
- [ ] Add useful lightweight keyboard features, including an optional dedicated number row, long-press number access, and repeat-delete when backspace is held; avoid cloud, ads, search, AI, or dictation bloat.
- [ ] Adapt the keyboard layout to different Android phone screen sizes and orientations.

## Paper-inspired companion app

- [ ] Keep the companion app minimal and classy with a warm paper-and-ink palette, while using clear, familiar sans-serif controls for the keyboard and preferences.
- [ ] Provide a lightweight settings screen for keyboard preferences including sound, vibration, and key preview, plus the optional number row. Store preferences on-device and share them with the Android keyboard.

## Preview, setup, and source availability

- [x] Let users preview and try the keyboard, then guide them to enable/select Paper Keys in Android system settings. The interactive app preview and Android settings/picker actions are implemented.
- [x] Keep source available as an open-source project on GitHub, while preserving the mobile project's required Manus-managed canonical repository. A separate public GitHub repository is available at https://github.com/ayush04-op/paper-keys-android under the MIT License; the Manus-managed repository remains canonical.

## Delivery status

The keyboard and companion UI have been redesigned toward familiar Gboard geometry with the paper palette, an optional number row, long-press number access, emoji mode, repeat-delete, and local-only behavior. Ordinary key taps now reuse stable key views, do not rebuild the keyboard tree, and refresh shifted labels only when shift state changes; the key-preview popup is reused, and sound/vibration/key-preview feedback are disabled by default for a lighter input path. CI's debug build uses a Gradle flag to embed JavaScript and disable Metro-only React Native dev support, and the workflow now checks that the bundle is inside the APK.

`pnpm check`, `pnpm lint`, clean Expo Android prebuild, and mobile-sized Preview screenshots pass. A replacement Android APK and physical-device retest have not completed yet. No Android device is available in this environment, so final launcher startup and rapid-typing checks still require the generated APK and the user's retest.
