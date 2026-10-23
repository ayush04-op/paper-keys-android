import { useEffect, useState } from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { paperTheme as c, serif } from "@/constants/paper-theme";
import { defaultKeyboardPreferences, paperKeysNative, readKeyboardPreferences, writeKeyboardPreferences, type KeyboardPreferences } from "@/lib/paper-preferences";

type PreferenceKey = keyof KeyboardPreferences;
const preferenceRows: { key: PreferenceKey; title: string; detail: string }[] = [
  { key: "sound", title: "Key sounds", detail: "A quiet click with each tap." },
  { key: "vibration", title: "Gentle vibration", detail: "A small touch of feedback." },
  { key: "keyPreview", title: "Key preview", detail: "See each key lift as you type." },
];

export default function SettingsScreen() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<KeyboardPreferences>(defaultKeyboardPreferences);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    readKeyboardPreferences().then((value) => { if (active) setPreferences(value); });
    return () => { active = false; };
  }, []);

  const updatePreference = async (key: PreferenceKey, value: boolean) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    setMessage("");
    try {
      await writeKeyboardPreferences(next);
    } catch {
      setMessage("The preference could not be saved. Please try once more.");
    }
  };

  const openSystemSettings = () => {
    if (Platform.OS === "android" && paperKeysNative?.openInputMethodSettings) {
      paperKeysNative.openInputMethodSettings();
      setMessage("Turn on Paper Keys in Android settings, then return here.");
    } else {
      setMessage("System keyboard setup is available in the installed Android build.");
    }
  };

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.paperGrain} pointerEvents="none">
        <Image source={require("../assets/images/paper-grain.png")} style={StyleSheet.absoluteFill} resizeMode="repeat" fadeDuration={0} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={styles.headerLabel}>PAPER KEYS / PREFERENCES</Text>
          <View style={{ width: 42 }} />
        </View>

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>THE SMALL DETAILS</Text>
          <Text style={styles.title}>Your keyboard,{"\n"}your rhythm.</Text>
          <Text style={styles.introCopy}>A few quiet choices for the way each key feels.</Text>
        </View>

        <View style={styles.groupLabel}>
          <Text style={styles.sectionNo}>01 / FEEDBACK</Text>
          <Text style={styles.groupCaption}>Stored on this device</Text>
        </View>
        <View style={styles.preferenceCard}>
          {preferenceRows.map((row, index) => (
            <View key={row.key} style={[styles.preferenceRow, index > 0 && styles.divider]}>
              <View style={styles.preferenceText}>
                <Text style={styles.preferenceTitle}>{row.title}</Text>
                <Text style={styles.preferenceDetail}>{row.detail}</Text>
              </View>
              <Pressable
                onPress={() => updatePreference(row.key, !preferences[row.key])}
                style={[styles.switchTrack, preferences[row.key] && styles.switchOn]}
                accessibilityRole="switch"
                accessibilityState={{ checked: preferences[row.key] }}
                accessibilityLabel={row.title}
              >
                <View style={[styles.switchThumb, preferences[row.key] && styles.switchThumbOn]} />
              </Pressable>
            </View>
          ))}
        </View>
        <Text style={styles.savedHint}>Your choices are saved locally and shared with the Paper Keys Android keyboard.</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}

        <View style={styles.systemCard}>
          <Text style={styles.sectionNo}>02 / ANDROID</Text>
          <Text style={styles.systemTitle}>Enable the system keyboard</Text>
          <Text style={styles.systemCopy}>Android asks you to enable and select each keyboard. Paper Keys only receives the characters you type through Android’s input connection; it does not save your typed text.</Text>
          <Pressable onPress={openSystemSettings} style={({ pressed }) => [styles.systemButton, pressed && styles.pressed]} accessibilityRole="button">
            <Text style={styles.systemButtonText}>Open keyboard settings</Text>
            <Text style={styles.systemButtonArrow}>↗</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerMark}>paper keys</Text>
          <Text style={styles.footerNote}>Warm paper. Clear words.</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.paper },
  paperGrain: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, opacity: 0.22 },
  content: { flexGrow: 1, paddingHorizontal: 21, paddingTop: 12, paddingBottom: 34, gap: 21 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: c.paperLight, borderWidth: 1, borderColor: c.line },
  backArrow: { color: c.ink, fontFamily: serif, fontSize: 20 },
  headerLabel: { color: c.inkSoft, fontFamily: serif, fontSize: 9, letterSpacing: 1.5 },
  intro: { paddingTop: 11, gap: 9 },
  eyebrow: { color: c.clayDark, fontFamily: serif, fontSize: 10, letterSpacing: 1.8 },
  title: { color: c.ink, fontFamily: serif, fontSize: 34, lineHeight: 39, letterSpacing: -0.5 },
  introCopy: { color: c.inkSoft, fontFamily: serif, fontSize: 14, lineHeight: 20 },
  groupLabel: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: -13 },
  sectionNo: { color: c.clayDark, fontFamily: serif, fontSize: 9, letterSpacing: 1.5 },
  groupCaption: { color: c.inkSoft, fontFamily: serif, fontSize: 11 },
  preferenceCard: { borderRadius: 18, backgroundColor: c.paperLight, borderWidth: 1, borderColor: c.line, paddingHorizontal: 15 },
  preferenceRow: { minHeight: 67, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.line },
  preferenceText: { flex: 1 },
  preferenceTitle: { color: c.ink, fontFamily: serif, fontSize: 15 },
  preferenceDetail: { color: c.inkSoft, fontFamily: serif, fontSize: 11, marginTop: 3 },
  switchTrack: { width: 46, height: 27, borderRadius: 14, padding: 3, justifyContent: "center", backgroundColor: "#DDD5C8", borderWidth: 1, borderColor: c.line },
  switchOn: { backgroundColor: c.clay, borderColor: c.clay },
  switchThumb: { width: 19, height: 19, borderRadius: 10, backgroundColor: c.paperLight, shadowColor: "#372C20", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.18, shadowRadius: 2, elevation: 1 },
  switchThumbOn: { alignSelf: "flex-end" },
  savedHint: { color: c.inkSoft, fontFamily: serif, fontSize: 11, lineHeight: 16, marginTop: -12 },
  message: { color: c.olive, fontFamily: serif, fontSize: 12, lineHeight: 17, marginTop: -12 },
  systemCard: { borderRadius: 18, backgroundColor: "#EEE7DB", borderWidth: 1, borderColor: c.line, padding: 17, gap: 10 },
  systemTitle: { color: c.ink, fontFamily: serif, fontSize: 20, marginTop: -4 },
  systemCopy: { color: c.inkSoft, fontFamily: serif, fontSize: 12, lineHeight: 18 },
  systemButton: { minHeight: 45, paddingHorizontal: 13, borderRadius: 13, backgroundColor: c.ink, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 3 },
  systemButtonText: { color: c.paperLight, fontFamily: serif, fontSize: 14 },
  systemButtonArrow: { color: c.paperLight, fontFamily: serif, fontSize: 16 },
  pressed: { opacity: 0.78 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.line, paddingTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerMark: { color: c.ink, fontFamily: serif, fontSize: 14 },
  footerNote: { color: c.inkSoft, fontFamily: serif, fontSize: 11, fontStyle: "italic" },
});
