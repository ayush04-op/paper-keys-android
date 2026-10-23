import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { paperTheme as c, serif } from "@/constants/paper-theme";

type Props = {
  value: string;
  onChange: (value: string) => void;
  showKeyPreview?: boolean;
};

type KeySpec = { label: string; action?: "shift" | "delete" | "symbols" | "space" | "enter"; flex?: number; utility?: boolean };

const alphaRows: KeySpec[][] = [
  [..."qwertyuiop"].map((label) => ({ label })),
  [..."asdfghjkl"].map((label) => ({ label })),
  [
    { label: "⇧", action: "shift", flex: 1.4, utility: true },
    ...[..."zxcvbnm"].map((label) => ({ label })),
    { label: "⌫", action: "delete", flex: 1.4, utility: true },
  ],
  [
    { label: "?123", action: "symbols", flex: 1.45, utility: true },
    { label: ",", flex: 0.8 },
    { label: "space", action: "space", flex: 4.2, utility: true },
    { label: ".", flex: 0.8 },
    { label: "↵", action: "enter", flex: 1.35, utility: true },
  ],
];
const symbolRows: KeySpec[][] = [
  [..."1234567890"].map((label) => ({ label })),
  ["@", "#", "$", "%", "&", "-", "+", "(", ")"].map((label) => ({ label })),
  [
    { label: "ABC", action: "symbols", flex: 1.4, utility: true },
    ...["!", "'", "\"", ":", ";", "?"].map((label) => ({ label })),
    { label: "⌫", action: "delete", flex: 1.4, utility: true },
  ],
  [
    { label: "=\\<", action: "symbols", flex: 1.45, utility: true },
    { label: ",", flex: 0.8 },
    { label: "space", action: "space", flex: 4.2, utility: true },
    { label: ".", flex: 0.8 },
    { label: "↵", action: "enter", flex: 1.35, utility: true },
  ],
];

export function PaperKeyboardPreview({ value, onChange, showKeyPreview = true }: Props) {
  const [shifted, setShifted] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [symbols, setSymbols] = useState(false);
  const [lastKey, setLastKey] = useState("");
  const clearPreviewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const press = (key: KeySpec) => {
    if (showKeyPreview) {
      setLastKey(key.action === "space" ? "space" : key.label);
      if (clearPreviewTimer.current) clearTimeout(clearPreviewTimer.current);
      clearPreviewTimer.current = setTimeout(() => setLastKey(""), 420);
    }
    if (key.action === "shift") {
      if (shifted && !capsLock) setCapsLock(true);
      else if (capsLock) {
        setCapsLock(false);
        setShifted(false);
      } else setShifted(true);
      return;
    }
    if (key.action === "symbols") {
      setSymbols((current) => !current);
      return;
    }
    if (key.action === "delete") {
      onChange(value.slice(0, -1));
      return;
    }
    if (key.action === "space") {
      onChange(`${value} `);
      if (!capsLock) setShifted(false);
      return;
    }
    if (key.action === "enter") {
      onChange(`${value}\n`);
      if (!capsLock) setShifted(false);
      return;
    }
    const output = key.label.length === 1 && /^[a-z]$/i.test(key.label)
      ? shifted || capsLock ? key.label.toUpperCase() : key.label.toLowerCase()
      : key.label;
    onChange(`${value}${output}`);
    if (!capsLock) setShifted(false);
  };

  const rows = symbols ? symbolRows : alphaRows;
  return (
    <View style={styles.shell}>
      <View style={styles.keyboardBar}>
        <View style={styles.brandDot}><View style={styles.brandDotInner} /></View>
        <Text style={styles.brandLabel}>paper keys</Text>
        <Text style={styles.modeLabel}>{symbols ? "123 / symbols" : "serif · qwerty"}</Text>
        {showKeyPreview && lastKey ? <View style={styles.previewPill}><Text style={styles.previewPillText}>{lastKey}</Text></View> : null}
      </View>
      <View style={styles.typingSurface}>
        <Text style={styles.typedText} numberOfLines={2}>{value || "Your words will appear here."}</Text>
        <Text style={styles.inputHint}>TAP THE PAPER KEYS TO TRY THEM</Text>
      </View>
      <View style={styles.keysPanel}>
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={[styles.row, rowIndex === 1 && styles.secondRow]}>
            {row.map((key, keyIndex) => {
              const isShiftOn = key.action === "shift" && shifted;
              const label = !symbols && /^[a-z]$/i.test(key.label)
                ? shifted || capsLock ? key.label.toUpperCase() : key.label.toLowerCase()
                : key.label;
              return (
                <Pressable
                  key={`${rowIndex}-${keyIndex}-${key.label}`}
                  accessibilityRole="button"
                  accessibilityLabel={key.action === "space" ? "space" : key.action === "delete" ? "backspace" : label}
                  onPress={() => press(key)}
                  style={({ pressed }) => [
                    styles.key,
                    { flex: key.flex ?? 1 },
                    key.utility && styles.utilityKey,
                    key.action === "enter" && styles.enterKey,
                    isShiftOn && styles.activeShiftKey,
                    pressed && styles.keyPressed,
                  ]}
                >
                  <Text style={[styles.keyText, key.action === "space" && styles.spaceText, key.action === "enter" && styles.enterText]}>
                    {key.action === "space" ? "" : label}
                  </Text>
                  {key.action === "space" ? <View style={styles.spaceMark} /> : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderColor: c.line,
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: c.paperDeep,
  },
  keyboardBar: {
    minHeight: 39,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EFE8DB",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.line,
  },
  brandDot: { width: 13, height: 13, borderRadius: 4, borderWidth: 1, borderColor: c.clay, alignItems: "center", justifyContent: "center", transform: [{ rotate: "-8deg" }] },
  brandDotInner: { width: 4, height: 4, borderRadius: 2, backgroundColor: c.clay },
  brandLabel: { fontFamily: serif, color: c.ink, fontSize: 13, letterSpacing: 0.2 },
  modeLabel: { marginLeft: "auto", color: c.inkSoft, fontFamily: serif, fontSize: 10, letterSpacing: 0.5 },
  previewPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: c.clay },
  previewPillText: { fontFamily: serif, color: c.white, fontSize: 10 },
  typingSurface: { minHeight: 59, paddingHorizontal: 15, paddingVertical: 9, backgroundColor: c.paperLight, justifyContent: "center" },
  typedText: { minHeight: 21, color: c.ink, fontFamily: serif, fontSize: 16, lineHeight: 22 },
  inputHint: { marginTop: 3, color: c.inkSoft, fontFamily: serif, fontSize: 8, letterSpacing: 1.25 },
  keysPanel: { paddingHorizontal: 5, paddingTop: 5, paddingBottom: 8, gap: 5, backgroundColor: c.paperDeep },
  row: { height: 39, flexDirection: "row", gap: 4 },
  secondRow: { marginHorizontal: 11 },
  key: { minWidth: 0, alignItems: "center", justifyContent: "center", borderRadius: 7, backgroundColor: c.key, borderWidth: StyleSheet.hairlineWidth, borderColor: "#D5CCBD", shadowColor: "#5C5041", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 1, elevation: 1 },
  utilityKey: { backgroundColor: c.keyUtility },
  activeShiftKey: { backgroundColor: "#D7C7B1", borderColor: c.clay },
  enterKey: { backgroundColor: c.clay, borderColor: c.clay },
  keyPressed: { transform: [{ translateY: 1 }], opacity: 0.72, shadowOpacity: 0 },
  keyText: { color: c.ink, fontFamily: serif, fontSize: 15 },
  spaceText: { fontSize: 11 },
  enterText: { color: c.white, fontSize: 19 },
  spaceMark: { position: "absolute", bottom: 5, width: 37, height: 1, backgroundColor: "#A69A89" },
});
