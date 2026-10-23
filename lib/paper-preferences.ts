import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";

export type KeyboardPreferences = {
  sound: boolean;
  vibration: boolean;
  keyPreview: boolean;
};

export const defaultKeyboardPreferences: KeyboardPreferences = {
  sound: false,
  vibration: true,
  keyPreview: true,
};

const storageKey = "paper-keys.preferences.v1";
type NativePreferences = {
  getPreferences: () => Promise<KeyboardPreferences>;
  setPreferences: (sound: boolean, vibration: boolean, keyPreview: boolean) => Promise<void>;
  openInputMethodSettings: () => void;
  showInputMethodPicker: () => void;
};

export const paperKeysNative = NativeModules.PaperKeysPreferences as NativePreferences | undefined;

export async function readKeyboardPreferences(): Promise<KeyboardPreferences> {
  if (Platform.OS === "android" && paperKeysNative?.getPreferences) {
    try {
      return { ...defaultKeyboardPreferences, ...(await paperKeysNative.getPreferences()) };
    } catch {
      // Keep the app usable even if the native preferences bridge is unavailable.
    }
  }
  try {
    const stored = await AsyncStorage.getItem(storageKey);
    return stored ? { ...defaultKeyboardPreferences, ...JSON.parse(stored) } : defaultKeyboardPreferences;
  } catch {
    return defaultKeyboardPreferences;
  }
}

export async function writeKeyboardPreferences(preferences: KeyboardPreferences): Promise<void> {
  await AsyncStorage.setItem(storageKey, JSON.stringify(preferences));
  if (Platform.OS === "android" && paperKeysNative?.setPreferences) {
    await paperKeysNative.setPreferences(preferences.sound, preferences.vibration, preferences.keyPreview);
  }
}
