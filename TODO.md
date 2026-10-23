# Paper Keys — TODO

## Android system keyboard

- [ ] Deliver Paper Keys as an Android keyboard app with Android input-method integration so users can enable and select it as their system keyboard. The input-method service and Android registration are implemented; a debug APK is available from [successful GitHub Actions run #39970802019](https://github.com/ayush04-op/paper-keys-android/actions/runs/39970802019). On-device system-wide typing and a standalone/release build remain outstanding.
- [x] Provide a standard QWERTY letter layout with responsive tap input; clear shift and caps-lock states; switchable numbers and symbols layouts; and essential editing/action keys including space, backspace, enter, and punctuation. The native service compiled and assembled in the GitHub Actions debug build; on-device keyboard behavior remains to be verified.
- [x] Adapt the keyboard layout to different Android phone screen sizes and orientations. Weighted key rows and orientation-aware sizing are implemented; actual device layouts remain to be verified.

## Paper-inspired companion app

- [x] Make the keyboard interface paper-themed with subtle texture and restrained contrast, in a minimal, classy style.
- [x] Use a serif font throughout the app UI, settings, and keyboard itself.
- [x] Provide a lightweight settings screen for keyboard preferences including sound, vibration, and key preview. Preferences are stored on device and shared with the native keyboard; the key-preview choice also controls the in-app preview.

## Preview, setup, and source availability

- [x] Let users preview and try the keyboard, then guide them to enable/select Paper Keys in Android system settings. The interactive app preview and Android settings/picker actions are implemented.
- [x] Keep source available as an open-source project on GitHub, while preserving the mobile project's required Manus-managed canonical repository. A separate public GitHub repository is available at https://github.com/ayush04-op/paper-keys-android under the MIT License; the Manus-managed repository remains canonical.

## Delivery status

The paper-themed Android input-method service, preference bridge, config plugin, companion screens, interactive keyboard preview, Android onboarding actions, generated branding, MIT license, contributor/security/community docs, and issue templates are implemented. TypeScript, lint, Android prebuild, Kotlin compilation, and debug APK assembly pass. The debug artifact is retained in GitHub Actions through November 6, 2026. No Android device or release-build validation is claimed.
