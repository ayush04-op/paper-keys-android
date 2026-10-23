# Paper Keys

**A private Android keyboard with Gboard's familiar geometry and a warm paper finish.** Paper Keys follows the supplied reference's keyboard rows, toolbar positions, and core text-entry behavior, but uses its own paper-and-ink design and independent native implementation. It does not contain or modify Google's proprietary Gboard code or assets.

> **Build status:** The screenshot-aligned standalone debug APK built successfully in [GitHub Actions run #39980844277](https://github.com/ayush04-op/paper-keys-android/actions/runs/39980844277) for commit `0ea3b2f`. The `paper-keys-debug-apk` artifact (54.5 MB) contains the JavaScript bundle verified by CI and expires **November 6, 2026 at 15:59 UTC**. Physical launcher and rapid-typing verification still needs a device retest.

## What it does

- **Native Android keyboard:** A real `InputMethodService` sends key input through Android's focused `InputConnection`.
- **Reference-matched layout:** A six-action top toolbar, dedicated 0–9 row on by default, symbol hints over QWERTY rows, Shift/Caps Lock, `?123`, comma, emoji, English-labelled space, period, and an editor-aware Search/Go/Send/Next/Done key.
- **Fast everyday editing:** Long-press letters for number access, hold Backspace to repeat-delete, switch symbols/emoji locally, and long-press Space to open Android's keyboard switcher.
- **Paper styling:** Warm cream surfaces, paper grain in the companion screens, ink-colored sans-serif legends, muted clay utility keys, and soft key shadows.
- **Local controls:** Preferences for the number row, key preview, haptics, and key sounds. Feedback options are off by default. A companion-screen preview lets you try the layout before enabling it in Android.

The six toolbar positions remain visually familiar. Tools, emoji, settings, and the number-row toggle are local. The GIF, Translate, and microphone shortcuts show an explanation instead of connecting to online services; Paper Keys does not request microphone access or send typed text to a service. This keeps the reference layout without adding cloud or recording behavior.

Paper Keys is not a full Gboard engine: it does not provide swipe typing, autocorrection, predictive suggestions, a personal dictionary, online GIF search, translation, or voice dictation.

## Install and enable

Download the **`paper-keys-debug-apk`** artifact from [successful run #39980844277](https://github.com/ayush04-op/paper-keys-android/actions/runs/39980844277) (or any later successful run of the [Android debug APK workflow](https://github.com/ayush04-op/paper-keys-android/actions/workflows/android-debug-apk.yml)). Install the APK, open **Paper Keys**, choose **Enable**, and turn it on in Android's keyboard settings. Return to the app and choose **Choose keyboard**. Android requires users to explicitly enable and select third-party keyboards.

The debug APK is for development, not a Play Store release. GitHub Actions retains uploaded artifacts for 14 days. Expo Web Preview shows the companion app and a demo; it cannot verify system-wide typing performance.

## Build and develop

The app uses Expo Router, React Native, TypeScript, and a local Expo config plugin for the Android IME. Local development needs Node.js and pnpm; Android builds also need the Android SDK.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm lint
pnpm exec expo prebuild --platform android
pnpm android
```

Ordinary local debug uses Metro developer support. To build a standalone debug APK with the JavaScript bundle included, use:

```sh
cd android
./gradlew --no-daemon -PpaperKeysStandaloneDebug=true :app:assembleDebug
```

The GitHub Actions workflow builds that standalone debug variant on relevant source changes to `main`, and it can also be run manually from **Actions → Android debug APK → Run workflow**. It verifies that `assets/index.android.bundle` exists in the APK before uploading it.

## Privacy and project structure

Paper Keys commits the selected key to the currently focused app. It does not store or transmit the text typed with the system keyboard; keyboard preferences are kept locally. The system shows its standard warning when a third-party keyboard is enabled.

- `app/` — companion home, interactive preview, and settings screens.
- `components/` — reusable paper-styled keyboard preview.
- `constants/` — paper, ink, and clay design tokens.
- `lib/` — local preference storage and native Android bridge interface.
- `plugins/with-paper-keys-ime.js` — Expo plugin for Android service, settings bridge, and standalone debug loading.
- `plugins/android/` — native IME, preferences bridge, and keyboard metadata.
- `assets/images/` — launcher, adaptive icon, splash, favicon, and paper-grain artwork.

## License

Paper Keys is released under the [MIT License](LICENSE).
