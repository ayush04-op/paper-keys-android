import { useCallback, useState } from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { PaperKeyboardPreview } from "@/components/paper-keyboard-preview";
import { paperTheme as c, serif } from "@/constants/paper-theme";
import { defaultKeyboardPreferences, paperKeysNative, readKeyboardPreferences } from "@/lib/paper-preferences";

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.paper },
  paperGrain: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, opacity: 0.22 },
  scroll: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 30 },
  page: { width: "100%", maxWidth: 470, alignSelf: "center", gap: 22 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brandGroup: { flexDirection: "row", alignItems: "center", gap: 11 },
  logoMark: { width: 38, height: 38, borderRadius: 12, backgroundColor: c.paperDeep, borderWidth: 1, borderColor: c.line, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  logoFold: { position: "absolute", width: 15, height: 15, top: 6, right: 5, borderTopWidth: 1, borderRightWidth: 1, borderColor: c.clay },
  logoKey: { width: 14, height: 12, borderWidth: 1, borderRadius: 3, borderColor: c.ink, alignItems: "center", justifyContent: "center", marginTop: 7, marginLeft: -4 },
  logoKeyDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: c.clay },
  brandName: { fontFamily: serif, fontSize: 19, color: c.ink, letterSpacing: 0.2 },
  brandSub: { fontFamily: serif, fontSize: 11, color: c.inkSoft, marginTop: 1 },
  settingsButton: { width: 41, height: 41, borderRadius: 14, backgroundColor: c.paperLight, borderColor: c.line, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  settingsGlyph: { fontFamily: serif, fontSize: 15, color: c.clayDark },
  intro: { paddingTop: 7, gap: 9 },
  eyebrow: { color: c.clayDark, fontFamily: serif, fontSize: 10, letterSpacing: 1.9 },
  title: { color: c.ink, fontFamily: serif, fontSize: 34, lineHeight: 39, letterSpacing: -0.6 },
  introCopy: { maxWidth: 340, color: c.inkSoft, fontFamily: serif, fontSize: 14, lineHeight: 21 },
  previewHeading: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: -13 },
  sectionNo: { color: c.clayDark, fontFamily: serif, fontSize: 9, letterSpacing: 1.5 },
  sectionTitle: { color: c.ink, fontFamily: serif, fontSize: 20, marginTop: 2 },
  previewNote: { color: c.inkSoft, fontFamily: serif, fontSize: 11, paddingBottom: 3 },
  setupCard: { padding: 17, borderRadius: 19, backgroundColor: c.paperLight, borderColor: c.line, borderWidth: 1, gap: 11, shadowColor: "#70624F", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 1 },
  setupHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  setupTitle: { color: c.ink, fontFamily: serif, fontSize: 21, marginTop: 3 },
  setupNumber: { color: c.clay, fontFamily: serif, fontSize: 23 },
  setupCopy: { color: c.inkSoft, fontFamily: serif, fontSize: 13, lineHeight: 19 },
  actions: { gap: 8, marginTop: 2 },
  primaryButton: { minHeight: 45, borderRadius: 13, backgroundColor: c.clay, paddingHorizontal: 14, alignItems: "center", justifyContent: "space-between", flexDirection: "row" },
  primaryButtonText: { color: c.white, fontFamily: serif, fontSize: 15 },
  primaryArrow: { color: c.white, fontFamily: serif, fontSize: 18 },
  secondaryButton: { minHeight: 42, borderRadius: 13, borderWidth: 1, borderColor: c.line, paddingHorizontal: 14, alignItems: "center", justifyContent: "center", backgroundColor: "transparent" },
  secondaryButtonText: { color: c.ink, fontFamily: serif, fontSize: 14 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  setupMessage: { color: c.olive, fontFamily: serif, fontSize: 12, lineHeight: 17 },
  availability: { color: c.inkSoft, fontFamily: serif, fontSize: 10, lineHeight: 15, opacity: 0.85 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line, paddingTop: 12, paddingBottom: 3, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  footerQuote: { color: c.inkSoft, fontFamily: serif, fontSize: 12, fontStyle: "italic" },
  footerLink: { color: c.clayDark, fontFamily: serif, fontSize: 12 },
});

export default function HomeScreen() {
  const router = useRouter();
  const [previewText, setPreviewText] = useState("");
  const [setupMessage, setSetupMessage] = useState("");
  const [showKeyPreview, setShowKeyPreview] = useState(defaultKeyboardPreferences.keyPreview);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void readKeyboardPreferences().then((preferences) => {
        if (active) setShowKeyPreview(preferences.keyPreview);
      });
      return () => { active = false; };
    }, []),
  );

  const openImeSettings = () => {
    if (Platform.OS === "android" && paperKeysNative?.openInputMethodSettings) {
      paperKeysNative.openInputMethodSettings();
      setSetupMessage("In Android settings, turn on Paper Keys, then come back here.");
    } else {
      setSetupMessage("Build and install the Android app to enable Paper Keys as a system keyboard.");
    }
  };

  const chooseKeyboard = () => {
    if (Platform.OS === "android" && paperKeysNative?.showInputMethodPicker) {
      paperKeysNative.showInputMethodPicker();
      setSetupMessage("Choose Paper Keys from the Android keyboard picker.");
    } else {
      setSetupMessage("After enabling Paper Keys in Android settings, choose it from the keyboard picker.");
    }
  };

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.paperGrain} pointerEvents="none">
        <Image source={require("../../assets/images/paper-grain.png")} style={StyleSheet.absoluteFill} resizeMode="repeat" fadeDuration={0} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <View style={styles.header}>
            <View style={styles.brandGroup}>
              <View style={styles.logoMark}>
                <View style={styles.logoFold} />
                <View style={styles.logoKey}><View style={styles.logoKeyDot} /></View>
              </View>
              <View>
                <Text style={styles.brandName}>paper keys</Text>
                <Text style={styles.brandSub}>A quieter way to type</Text>
              </View>
            </View>
            <Pressable onPress={() => router.push("/settings")} style={styles.settingsButton} accessibilityRole="button" accessibilityLabel="Open settings">
              <Text style={styles.settingsGlyph}>Aa</Text>
            </Pressable>
          </View>

          <View style={styles.intro}>
            <Text style={styles.eyebrow}>A LITTLE MORE ROOM TO THINK</Text>
            <Text style={styles.title}>Made of paper.{"\n"}Built for every word.</Text>
            <Text style={styles.introCopy}>Softly tactile keys, warm ink, and nothing between you and the sentence.</Text>
          </View>

          <View style={styles.previewHeading}>
            <View>
              <Text style={styles.sectionNo}>01 / THE KEYBOARD</Text>
              <Text style={styles.sectionTitle}>Try a few keys</Text>
            </View>
            <Text style={styles.previewNote}>A small preview</Text>
          </View>
          <PaperKeyboardPreview value={previewText} onChange={setPreviewText} showKeyPreview={showKeyPreview} />

          <View style={styles.setupCard}>
            <View style={styles.setupHeader}>
              <View>
                <Text style={styles.sectionNo}>02 / MAKE IT YOURS</Text>
                <Text style={styles.setupTitle}>Set up Paper Keys</Text>
              </View>
              <Text style={styles.setupNumber}>↗</Text>
            </View>
            <Text style={styles.setupCopy}>Android keeps keyboard selection in your control. Enable Paper Keys, then choose it whenever you want a softer place to type.</Text>
            <View style={styles.actions}>
              <Pressable onPress={openImeSettings} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} accessibilityRole="button">
                <Text style={styles.primaryButtonText}>Enable keyboard</Text>
                <Text style={styles.primaryArrow}>→</Text>
              </Pressable>
              <Pressable onPress={chooseKeyboard} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]} accessibilityRole="button">
                <Text style={styles.secondaryButtonText}>Choose keyboard</Text>
              </Pressable>
            </View>
            {setupMessage ? <Text style={styles.setupMessage}>{setupMessage}</Text> : null}
            <Text style={styles.availability}>System keyboard availability requires an Android build; the preview above works here.</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerQuote}>“Good words need a little space.”</Text>
            <Pressable onPress={() => router.push("/settings")} accessibilityRole="button">
              <Text style={styles.footerLink}>Preferences  ↗</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
