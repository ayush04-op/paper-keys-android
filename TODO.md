# Paper Keys — TODO

## Android system keyboard
- [ ] Deliver Paper Keys as an Android keyboard app with Android input-method integration so users can enable and select it as their system keyboard. The input-method service and Android registration are implemented; a signed/native APK and on-device system-wide typing check remain outstanding.
- [x] Provide a standard QWERTY letter layout with responsive tap input; clear shift and caps-lock states; switchable numbers and symbols layouts; and essential editing/action keys including space, backspace, enter, and punctuation. Implemented in the native input service and in-app preview; native device behavior awaits an Android build.
- [x] Adapt the keyboard layout to different Android phone screen sizes and orientations. Weighted key rows and orientation-aware sizing are implemented; native device behavior awaits an Android build.

## Paper-inspired companion app
- [x] Make the keyboard interface paper-themed with subtle texture and restrained contrast, in a minimal, classy style.
- [x] Use a serif font throughout the app UI, settings, and keyboard itself.
- [x] Provide a lightweight settings screen for keyboard preferences including sound, vibration, and key preview. Preferences are stored on device and shared with the native keyboard; the key-preview choice also controls the in-app preview.

## Preview, setup, and source availability
- [x] Let users preview and try the keyboard, then guide them to enable/select Paper Keys in Android system settings. The interactive app preview and Android settings/picker actions are implemented.
- [ ] Keep source available as an open-source project on GitHub, while preserving the mobile project's required Manus-managed canonical repository. Public repository creation and open-source license selection remain pending.

## Delivery status
The paper-themed Android input-method service, preference bridge, config plugin, companion screens, interactive keyboard preview, Android onboarding actions, and generated branding are implemented. Expo Web preview, TypeScript, lint, and Android prebuild pass. The Android Kotlin compilation could not reach source compilation because this Sandbox has no Android SDK; no native release build or device validation is claimed.
