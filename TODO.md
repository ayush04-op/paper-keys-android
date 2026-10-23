# Paper Keys — TODO

## Standalone Android app and typing responsiveness

- [x] Build a standalone Android debug APK without requiring Metro for its JavaScript bundle. GitHub Actions run [#39980844277](https://github.com/ayush04-op/paper-keys-android/actions/runs/39980844277) passed `assembleDebug`, verified `assets/index.android.bundle` inside the APK, and uploaded `paper-keys-debug-apk` (expires 2026-11-06 15:59 UTC).
- [ ] Verify the installed APK opens the companion app from its launcher without a running Metro server; Android-device retest is still required.
- [ ] Confirm the Android keyboard responds from the first tap and registers fast typing without dropped characters.

## Screenshot-matched keyboard layout and behavior

- [x] Implement the supplied Gboard screenshot's overall keyboard structure in the native input service and app preview: a six-action utility toolbar; a dedicated number row; QWERTY, home, and shift/backspace rows with small alternate-symbol hints; and a bottom row with `?123`, comma, emoji, language/space, period, and an editor-aware action key.
- [x] Implement the familiar rounded key appearance, proportions, spacing, symbol/digit hints, utility-key treatment, and pressed states in the warm Paper palette; the phone-sized Preview screenshot and native APK compilation both passed.
- [ ] Verify on an Android device that letters/symbols enter the focused field; Shift/Caps Lock change case; number/symbol/emoji layouts switch; long-press exposes alternate digits; held Backspace repeats deletion; space, punctuation, and editor-aware Search/Go/Send/Next/Done actions work as intended.
- [x] Display all six reference toolbar positions (tools, sticker/emoji, GIF, settings, translate, microphone). Local tools, emoji, settings, and number-row controls work locally; GIF search, translation, and voice input remain explicitly offline-only without cloud services or microphone access.
- [x] Use a dedicated number row by default with a companion setting to turn it off; the layout responds to available width/orientation in the Android service and cleanly compiles.

## App-wide paper design and preferences

- [x] Apply a minimalist Paper theme across the companion screens and keyboard: warm cream/paper surfaces, subtle screen grain, ink-colored legends, restrained clay accents, and clean typography. The phone-sized home/settings Preview and native build passed.
- [x] Provide local settings for number row, sound, haptics, and key preview; keep sound, haptics, and key previews off by default, share preferences with the Android keyboard, and migrate existing number-row choices instead of resetting them.

## Preview, Android setup, and open source

- [x] Let users preview and try the keyboard, then guide them to enable/select Paper Keys in Android system settings. The interactive app preview and Android settings/picker actions are implemented.
- [x] Keep source available as an open-source project on GitHub, while preserving the mobile project's required Manus-managed canonical repository. The public MIT repository is https://github.com/ayush04-op/paper-keys-android.

## Delivery status

`pnpm check`, `pnpm lint`, config-plugin syntax validation, and clean Expo Android prebuild pass. GitHub Actions run #39980844277 completed successfully in 15m28s, built the standalone debug APK, verified the embedded JS bundle, and uploaded the 54.5 MB artifact; download it from the linked run before it expires on 2026-11-06. The user has not retested this updated APK on a physical Android device, so launcher opening and real typing speed remain unresolved. GIF, translation, and microphone remain intentionally offline-only to preserve the lightweight/private scope.
