import { useCallback, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { PaperKeyboardPreview } from "@/components/paper-keyboard-preview";
import { paperTheme as c } from "@/constants/paper-theme";
import {
  defaultKeyboardPreferences,
  paperKeysNative,
  readKeyboardPreferences,
  writeKeyboardPreferences,
  type KeyboardPreferences,
} from "@/lib/paper-preferences";

const bodyFont =
  Platform.select({ web: "Arial", default: "sans-serif" }) ?? "sans-serif";
const mediumFont =
  Platform.select({ web: "Arial", default: "sans-serif-medium" }) ??
  "sans-serif-medium";

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.paper },
  grain: { ...StyleSheet.absoluteFill, opacity: 0.12 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
  },
  page: { width: "100%", maxWidth: 470, alignSelf: "center", gap: 16 },
  header: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: c.paperDeep,
    borderWidth: 1,
    borderColor: c.line,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: c.clayDark,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 16,
  },
  brandName: {
    color: c.ink,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 16,
  },
  brandMeta: {
    color: c.inkSoft,
    fontFamily: bodyFont,
    fontSize: 10,
    marginTop: 1,
  },
  settingsButton: {
    minWidth: 42,
    height: 38,
    paddingHorizontal: 11,
    borderRadius: 11,
    backgroundColor: c.paperLight,
    borderWidth: 1,
    borderColor: c.line,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsText: {
    color: c.ink,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 12,
  },
  intro: { gap: 5, paddingTop: 2 },
  eyebrow: {
    color: c.clayDark,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 10,
    letterSpacing: 1.2,
  },
  title: {
    color: c.ink,
    fontFamily: bodyFont,
    fontSize: 26,
    fontWeight: "600",
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  copy: {
    color: c.inkSoft,
    fontFamily: bodyFont,
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 390,
  },
  setupCard: {
    padding: 14,
    borderRadius: 15,
    backgroundColor: c.paperLight,
    borderWidth: 1,
    borderColor: c.line,
    gap: 10,
  },
  setupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: c.ink,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 15,
  },
  stepTag: {
    color: c.clayDark,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 10,
    letterSpacing: 0.6,
    backgroundColor: c.paperDeep,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  setupCopy: {
    color: c.inkSoft,
    fontFamily: bodyFont,
    fontSize: 12,
    lineHeight: 17,
  },
  buttonRow: { flexDirection: "row", gap: 8 },
  primaryButton: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 11,
    borderRadius: 11,
    backgroundColor: c.ink,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 11,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.paperLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: c.paperLight,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 12,
  },
  secondaryText: {
    color: c.ink,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 12,
  },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
  message: {
    color: c.clayDark,
    fontFamily: bodyFont,
    fontSize: 11,
    lineHeight: 15,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: -7,
  },
  previewTitle: {
    color: c.ink,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 15,
  },
  previewHint: { color: c.inkSoft, fontFamily: bodyFont, fontSize: 10 },
  localNote: {
    color: c.inkSoft,
    fontFamily: bodyFont,
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
    paddingHorizontal: 8,
  },
});

export default function HomeScreen() {
  const router = useRouter();
  const [previewText, setPreviewText] = useState("");
  const [setupMessage, setSetupMessage] = useState("");
  const [preferences, setPreferences] = useState<KeyboardPreferences>(
    defaultKeyboardPreferences,
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void readKeyboardPreferences().then((next) => {
        if (active) setPreferences(next);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const openImeSettings = () => {
    if (Platform.OS === "android" && paperKeysNative?.openInputMethodSettings) {
      paperKeysNative.openInputMethodSettings();
      setSetupMessage(
        "Turn on Paper Keys in Android settings, then return here.",
      );
    } else {
      setSetupMessage(
        "Install the Android build to enable Paper Keys as a system keyboard.",
      );
    }
  };

  const chooseKeyboard = () => {
    if (Platform.OS === "android" && paperKeysNative?.showInputMethodPicker) {
      paperKeysNative.showInputMethodPicker();
      setSetupMessage("Select Paper Keys in Android’s keyboard picker.");
    } else {
      setSetupMessage(
        "After enabling Paper Keys, choose it from the Android keyboard picker.",
      );
    }
  };

  const toggleNumberRow = () => {
    const next = { ...preferences, numberRow: !preferences.numberRow };
    setPreferences(next);
    void writeKeyboardPreferences(next).catch(() => {
      setSetupMessage(
        "Could not save the number-row preference. Please try again.",
      );
    });
  };

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.grain} pointerEvents="none">
        <Image
          source={require("../../assets/images/paper-grain.png")}
          style={StyleSheet.absoluteFill}
          resizeMode="repeat"
          fadeDuration={0}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>P</Text>
              </View>
              <View>
                <Text style={styles.brandName}>Paper Keys</Text>
                <Text style={styles.brandMeta}>OFFLINE · YOURS TO SHAPE</Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push("/settings")}
              style={({ pressed }) => [
                styles.settingsButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.settingsText}>Settings</Text>
            </Pressable>
          </View>

          <View style={styles.intro}>
            <Text style={styles.eyebrow}>A KEYBOARD, NOT A FEED</Text>
            <Text style={styles.title}>
              Familiar typing.{"\n"}Less clutter.
            </Text>
            <Text style={styles.copy}>
              The everyday QWERTY layout, in warm paper colors. No account or
              network features.
            </Text>
          </View>

          <View style={styles.setupCard}>
            <View style={styles.setupHeader}>
              <Text style={styles.sectionTitle}>Set up the keyboard</Text>
              <Text style={styles.stepTag}>ANDROID</Text>
            </View>
            <Text style={styles.setupCopy}>
              Android asks you to enable a keyboard and choose when to use it.
            </Text>
            <View style={styles.buttonRow}>
              <Pressable
                onPress={openImeSettings}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
              >
                <Text style={styles.primaryText}>Enable</Text>
              </Pressable>
              <Pressable
                onPress={chooseKeyboard}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
              >
                <Text style={styles.secondaryText}>Choose keyboard</Text>
              </Pressable>
            </View>
            {setupMessage ? (
              <Text style={styles.message}>{setupMessage}</Text>
            ) : null}
          </View>

          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Try the layout</Text>
            <Text style={styles.previewHint}>
              {preferences.numberRow ? "Number row on" : "Tap to type"}
            </Text>
          </View>
          <PaperKeyboardPreview
            value={previewText}
            onChange={setPreviewText}
            showKeyPreview={preferences.keyPreview}
            numberRow={preferences.numberRow}
            onOpenSettings={() => router.push("/settings")}
            onToggleNumberRow={toggleNumberRow}
          />
          <Text style={styles.localNote}>
            Key taps in this preview stay on this screen. The system keyboard
            inserts text only into the app you’re typing in.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
