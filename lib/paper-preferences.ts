import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";

export type KeyboardPreferences = {
  sound: boolean;
  vibration: boolean;
  keyPreview: boolean;
  numberRow: boolean;
};

export const defaultKeyboardPreferences: KeyboardPreferences = {
  sound: false,
  vibration: false,
  keyPreview: false,
  numberRow: true,
};

const storageKey = "paper-keys.preferences.v2";
const legacyStorageKey = "paper-keys.preferences.v1";
type NativePreferences = {
  getPreferences: () => Promise<KeyboardPreferences>;
  setPreferences: (
    sound: boolean,
    vibration: boolean,
    keyPreview: boolean,
    numberRow: boolean,
  ) => Promise<void>;
  openInputMethodSettings: () => void;
  showInputMethodPicker: () => void;
};

export const paperKeysNative = NativeModules.PaperKeysPreferences as
  | NativePreferences
  | undefined;

async function readLocalPreferences(): Promise<KeyboardPreferences> {
  try {
    const stored = await AsyncStorage.getItem(storageKey);
    if (stored) return { ...defaultKeyboardPreferences, ...JSON.parse(stored) };
    const legacy = await AsyncStorage.getItem(legacyStorageKey);
    if (!legacy) return defaultKeyboardPreferences;
    const migrated = { ...defaultKeyboardPreferences, ...JSON.parse(legacy) };
    await AsyncStorage.setItem(storageKey, JSON.stringify(migrated));
    await AsyncStorage.removeItem(legacyStorageKey).catch(() => undefined);
    return migrated;
  } catch {
    return defaultKeyboardPreferences;
  }
}

export async function readKeyboardPreferences(): Promise<KeyboardPreferences> {
  if (Platform.OS === "android" && paperKeysNative?.getPreferences) {
    try {
      return {
        ...defaultKeyboardPreferences,
        ...(await paperKeysNative.getPreferences()),
      };
    } catch {
      // Keep the app usable even if the native preferences bridge is unavailable.
    }
  }
  return readLocalPreferences();
}

export async function writeKeyboardPreferences(
  preferences: KeyboardPreferences,
): Promise<void> {
  await AsyncStorage.setItem(storageKey, JSON.stringify(preferences));
  await AsyncStorage.removeItem(legacyStorageKey).catch(() => undefined);
  if (Platform.OS === "android" && paperKeysNative?.setPreferences) {
    await paperKeysNative.setPreferences(
      preferences.sound,
      preferences.vibration,
      preferences.keyPreview,
      preferences.numberRow,
    );
  }
}
