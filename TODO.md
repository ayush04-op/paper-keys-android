# Paper Keys — TODO

## Standalone Android app and typing responsiveness

- [ ] The installed Android APK opens the companion app from its launcher without requiring a running Metro server; the APK must contain the JavaScript bundle.
- [ ] The Android keyboard responds from the first tap and registers fast typing without dropped characters.

## Screenshot-matched keyboard layout and behavior

- [ ] Match the supplied Gboard screenshot's overall keyboard structure: a six-action utility toolbar; a dedicated number row; QWERTY, home, and shift/backspace rows with small alternate-symbol hints; and a bottom row with `?123`, comma, emoji, language/space, period, and an editor-aware action key.
- [ ] Keep the keyboard keys' familiar rounded shape, proportions, spacing, corner radii, typography, symbol/digit hints, utility-key treatment, and pressed states close to the supplied reference while recoloring and texturing the keyboard with the Paper theme.
- [ ] Keep key actions native and immediate: letters and symbols enter the focused Android field; Shift/Caps Lock change case; numbers/symbols/emoji switch layouts; long-press exposes alternate digits; holding backspace repeats deletion; space, punctuation, and the action key work; and the action key adapts to Search/Go/Send/Next/Done editor types.
- [ ] Display the same six toolbar positions shown in the reference (tools, sticker/emoji, GIF, settings, translate, microphone). Keep GIF search, translation, and voice input unconnected to cloud services or microphone access unless the user separately opts in; local tools, emoji, and settings remain available.
- [ ] Use a dedicated number row by default, with a companion setting to turn it off if desired; adapt the keyboard rows to Android phone screen size and orientation.

## App-wide paper design and preferences

- [ ] Apply a coherent minimalist, editorial Paper theme across the whole app and keyboard: warm cream/paper surfaces, subtle grain, ink-colored legends, restrained clay accents, and clear typography.
- [ ] Provide local settings for number row, sound, haptics, and key preview; keep sound, haptics, and key previews off by default. Share saved settings between the companion app and the Android keyboard.

## Preview, Android setup, and open source

- [x] Let users preview and try the keyboard, then guide them to enable/select Paper Keys in Android system settings. The interactive app preview and Android settings/picker actions are implemented.
- [x] Keep source available as an open-source project on GitHub, while preserving the mobile project's required Manus-managed canonical repository. The public MIT repository is https://github.com/ayush04-op/paper-keys-android.

## Delivery status

The supplied screenshot's keyboard geometry is now implemented in the native service and app preview: six toolbar positions, the default-on number row, QWERTY symbol hints, rounded utility keys, and a Search magnifier. Local tools, emoji, settings, number-row toggling, and editor-aware actions are present. GIF/Translate/voice retain their toolbar positions but are deliberately offline-only; no microphone permission or cloud typing service is added. Ordinary key taps still reuse stable native views; the tree is built when an input view opens, not for each typed character.

The mobile Preview visually shows the updated layout. `pnpm check`, `pnpm lint`, plugin syntax checking, and clean Expo Android prebuild pass. A fresh GitHub Actions APK build is required after this source update. The current source has not been verified on the user's physical device; launcher startup and fast-typing behavior need a retest with that fresh APK.
