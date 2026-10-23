import { useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { paperTheme as c } from "@/constants/paper-theme";
import {
  defaultKeyboardPreferences,
  paperKeysNative,
  readKeyboardPreferences,
  writeKeyboardPreferences,
  type KeyboardPreferences,
} from "@/lib/paper-preferences";

type PreferenceKey = keyof KeyboardPreferences;
const preferenceRows: { key: PreferenceKey; title: string; detail: string }[] =
  [
    {
      key: "numberRow",
      title: "Number row",
      detail: "Keep 0–9 above the letter keys.",
    },
    {
      key: "keyPreview",
      title: "Key preview",
      detail: "Show a small key pop-up while typing.",
    },
    {
      key: "vibration",
      title: "Haptic feedback",
      detail: "A light touch with each key.",
    },
    {
      key: "sound",
      title: "Key sounds",
      detail: "A quiet click with each tap.",
    },
  ];

const bodyFont =
  Platform.select({ web: "Arial", default: "sans-serif" }) ?? "sans-serif";
const mediumFont =
  Platform.select({ web: "Arial", default: "sans-serif-medium" }) ??
  "sans-serif-medium";

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.paper },
  grain: { ...StyleSheet.absoluteFill, opacity: 0.12 },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 17,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    minHeight: 44,
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: c.paperLight,
    borderWidth: 1,
    borderColor: c.line,
  },
  backArrow: { color: c.ink, fontFamily: bodyFont, fontSize: 20 },
  headerTitle: {
    color: c.ink,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 17,
  },
  intro: { gap: 4, paddingTop: 1 },
  eyebrow: {
    color: c.clayDark,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 10,
    letterSpacing: 1.1,
  },
  introText: {
    color: c.inkSoft,
    fontFamily: bodyFont,
    fontSize: 12,
    lineHeight: 17,
  },
  sectionTitle: {
    color: c.ink,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 13,
    marginBottom: -8,
  },
  group: {
    paddingHorizontal: 13,
    borderRadius: 14,
    backgroundColor: c.paperLight,
    borderWidth: 1,
    borderColor: c.line,
  },
  row: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.line },
  rowText: { flex: 1, gap: 3 },
  rowTitle: {
    color: c.ink,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 13,
  },
  rowDetail: {
    color: c.inkSoft,
    fontFamily: bodyFont,
    fontSize: 10,
    lineHeight: 14,
  },
  switchTrack: {
    width: 44,
    height: 25,
    borderRadius: 13,
    padding: 2,
    justifyContent: "center",
    backgroundColor: "#D8D1C5",
    borderWidth: 1,
    borderColor: c.line,
  },
  switchOn: { backgroundColor: c.clay, borderColor: c.clay },
  switchThumb: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: c.paperLight,
    shadowColor: "#372C20",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.16,
    shadowRadius: 2,
    elevation: 1,
  },
  switchThumbOn: { alignSelf: "flex-end" },
  note: {
    color: c.inkSoft,
    fontFamily: bodyFont,
    fontSize: 10,
    lineHeight: 15,
    marginTop: -10,
  },
  systemCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: c.paperDeep,
    borderWidth: 1,
    borderColor: c.line,
    gap: 8,
  },
  systemTitle: {
    color: c.ink,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 14,
  },
  systemCopy: {
    color: c.inkSoft,
    fontFamily: bodyFont,
    fontSize: 11,
    lineHeight: 16,
  },
  systemButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: c.ink,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  systemButtonText: {
    color: c.paperLight,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 12,
  },
  systemButtonArrow: {
    color: c.paperLight,
    fontFamily: bodyFont,
    fontSize: 15,
  },
  message: {
    color: c.clayDark,
    fontFamily: bodyFont,
    fontSize: 11,
    lineHeight: 15,
  },
  pressed: { opacity: 0.76 },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
    paddingTop: 11,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerMark: {
    color: c.ink,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 12,
  },
  footerNote: { color: c.inkSoft, fontFamily: bodyFont, fontSize: 10 },
});

export default function SettingsScreen() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<KeyboardPreferences>(
    defaultKeyboardPreferences,
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void readKeyboardPreferences().then((value) => {
      if (active) setPreferences(value);
    });
    return () => {
      active = false;
    };
  }, []);

  const updatePreference = async (key: PreferenceKey, value: boolean) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    setMessage("");
    try {
      await writeKeyboardPreferences(next);
    } catch {
      setMessage("Could not save that setting. Please try again.");
    }
  };

  const openSystemSettings = () => {
    if (Platform.OS === "android" && paperKeysNative?.openInputMethodSettings) {
      paperKeysNative.openInputMethodSettings();
      setMessage("Turn on Paper Keys in Android keyboard settings.");
    } else {
      setMessage("Keyboard setup is available in the installed Android app.");
    }
  };

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.grain} pointerEvents="none">
        <Image
          source={require("../assets/images/paper-grain.png")}
          style={StyleSheet.absoluteFill}
          resizeMode="repeat"
          fadeDuration={0}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Keyboard settings</Text>
        </View>
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>PAPER KEYS</Text>
          <Text style={styles.introText}>
            A familiar layout with only the controls you need. Your preferences
            stay on this device.
          </Text>
        </View>
        <Text style={styles.sectionTitle}>Layout &amp; key feedback</Text>
        <View style={styles.group}>
          {preferenceRows.map((row, index) => (
            <View
              key={row.key}
              style={[styles.row, index > 0 && styles.divider]}
            >
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{row.title}</Text>
                <Text style={styles.rowDetail}>{row.detail}</Text>
              </View>
              <Pressable
                onPress={() => updatePreference(row.key, !preferences[row.key])}
                style={[
                  styles.switchTrack,
                  preferences[row.key] && styles.switchOn,
                ]}
                accessibilityRole="switch"
                accessibilityState={{ checked: preferences[row.key] }}
                accessibilityLabel={row.title}
              >
                <View
                  style={[
                    styles.switchThumb,
                    preferences[row.key] && styles.switchThumbOn,
                  ]}
                />
              </Pressable>
            </View>
          ))}
        </View>
        <Text style={styles.note}>
          Key preview and vibration are off by default to keep typing immediate.
          Turn either on if you prefer extra feedback.
        </Text>
        <View style={styles.systemCard}>
          <Text style={styles.systemTitle}>Enable Paper Keys in Android</Text>
          <Text style={styles.systemCopy}>
            Android keeps keyboard selection under your control. Paper Keys
            works locally and does not send the text you type anywhere.
          </Text>
          <Pressable
            onPress={openSystemSettings}
            style={({ pressed }) => [
              styles.systemButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
          >
            <Text style={styles.systemButtonText}>Open keyboard settings</Text>
            <Text style={styles.systemButtonArrow}>↗</Text>
          </Pressable>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerMark}>Paper Keys</Text>
          <Text style={styles.footerNote}>Paper tones · private by design</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
