import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { paperTheme as c } from "@/constants/paper-theme";

type Action =
  | "shift"
  | "delete"
  | "symbols"
  | "symbolPage"
  | "emoji"
  | "space"
  | "enter";
type KeySpec = { label: string; action?: Action; flex?: number; hint?: string };
type Props = {
  value: string;
  onChange: (value: string) => void;
  showKeyPreview?: boolean;
  numberRow?: boolean;
};

const bodyFont =
  Platform.select({ web: "Arial", default: "sans-serif" }) ?? "sans-serif";
const mediumFont =
  Platform.select({ web: "Arial", default: "sans-serif-medium" }) ??
  "sans-serif-medium";

const digitHints = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const letterRows: KeySpec[][] = [
  [..."qwertyuiop"].map((label, index) => ({ label, hint: digitHints[index] })),
  [..."asdfghjkl"].map((label) => ({ label })),
  [
    { label: "⇧", action: "shift", flex: 1.4 },
    ...[..."zxcvbnm"].map((label) => ({ label })),
    { label: "⌫", action: "delete", flex: 1.4 },
  ],
];
const symbolRows: KeySpec[][] = [
  [..."1234567890"].map((label) => ({ label })),
  ["@", "#", "$", "%", "&", "-", "+", "(", ")"].map((label) => ({ label })),
  [
    { label: "ABC", action: "symbols", flex: 1.35 },
    ...["!", "'", '"', ":", ";", "?"].map((label) => ({ label })),
    { label: "⌫", action: "delete", flex: 1.35 },
  ],
];
const symbolPageTwo: KeySpec[][] = [
  ["~", "`", "|", "•", "√", "π", "÷", "×", "¶", "∆"].map((label) => ({
    label,
  })),
  ["£", "€", "¥", "^", "°", "=", "{", "}", "\\"].map((label) => ({ label })),
  [
    { label: "123", action: "symbolPage", flex: 1.35 },
    ...["<", ">", "[", "]", "_", "§"].map((label) => ({ label })),
    { label: "⌫", action: "delete", flex: 1.35 },
  ],
];
const emojiRows: KeySpec[][] = [
  ["😀", "😃", "😄", "😁", "😆", "😊", "😍", "🥰", "😘", "😎"].map((label) => ({
    label,
  })),
  ["😂", "🤣", "🥲", "😭", "😤", "😴", "🤔", "🙌", "👍", "❤️"].map((label) => ({
    label,
  })),
  [
    { label: "ABC", action: "emoji", flex: 1.35 },
    ...["✨", "🎉", "🔥", "💯", "🌿", "☀️"].map((label) => ({ label })),
    { label: "⌫", action: "delete", flex: 1.35 },
  ],
];

export function PaperKeyboardPreview({
  value,
  onChange,
  showKeyPreview = false,
  numberRow = false,
}: Props) {
  const [shifted, setShifted] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [symbols, setSymbols] = useState(false);
  const [symbolPage, setSymbolPage] = useState(0);
  const [emojiMode, setEmojiMode] = useState(false);
  const [lastKey, setLastKey] = useState("");
  const clearPreviewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (clearPreviewTimer.current) clearTimeout(clearPreviewTimer.current);
    },
    [],
  );

  const press = (key: KeySpec) => {
    if (showKeyPreview) {
      setLastKey(key.action === "space" ? "space" : key.label);
      if (clearPreviewTimer.current) clearTimeout(clearPreviewTimer.current);
      clearPreviewTimer.current = setTimeout(() => setLastKey(""), 180);
    }
    if (key.action === "shift") {
      if (capsLock) {
        setCapsLock(false);
        setShifted(false);
      } else if (shifted) {
        setCapsLock(true);
        setShifted(true);
      } else setShifted(true);
      return;
    }
    if (key.action === "symbols") {
      setSymbols((current) => !current);
      setEmojiMode(false);
      setSymbolPage(0);
      return;
    }
    if (key.action === "symbolPage") {
      setSymbols(true);
      setEmojiMode(false);
      setSymbolPage((current) => 1 - current);
      return;
    }
    if (key.action === "emoji") {
      setEmojiMode((current) => !current);
      setSymbols(false);
      return;
    }
    if (key.action === "delete") {
      onChange(Array.from(value).slice(0, -1).join(""));
      return;
    }
    if (key.action === "space") {
      onChange(`${value} `);
      return;
    }
    if (key.action === "enter") {
      onChange(`${value}\n`);
      return;
    }
    const isLetter = !symbols && !emojiMode && /^[a-z]$/i.test(key.label);
    const output =
      isLetter && (shifted || capsLock)
        ? key.label.toUpperCase()
        : isLetter
          ? key.label.toLowerCase()
          : key.label;
    onChange(`${value}${output}`);
    if (isLetter && !capsLock) setShifted(false);
  };

  const dedicatedNumberRow: KeySpec[] = [..."1234567890"].map((label) => ({
    label,
  }));
  const rows: KeySpec[][] = emojiMode
    ? emojiRows
    : symbols
      ? symbolPage === 0
        ? symbolRows
        : symbolPageTwo
      : [...(numberRow ? [dedicatedNumberRow] : []), ...letterRows];
  const bottomKey: KeySpec = emojiMode
    ? { label: "ABC", action: "emoji", flex: 1.35 }
    : symbols
      ? {
          label: symbolPage === 0 ? "=\\<" : "123",
          action: "symbolPage",
          flex: 1.35,
        }
      : { label: "?123", action: "symbols", flex: 1.35 };
  const bottomRow: KeySpec[] = [
    bottomKey,
    { label: ",", flex: 0.85 },
    { label: "☺", action: "emoji", flex: 1 },
    { label: "space", action: "space", flex: 3.65 },
    { label: ".", flex: 0.85 },
    { label: "↵", action: "enter", flex: 1.25 },
  ];

  return (
    <View style={styles.shell}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarSymbol}>⋯</Text>
        <View style={styles.brandMark}>
          <View style={styles.brandMarkInner} />
        </View>
        <Text style={styles.brandLabel}>paper keys</Text>
        <Text style={styles.modeLabel}>
          {emojiMode ? "emoji" : symbols ? "symbols" : "English"}
        </Text>
        {showKeyPreview && lastKey ? (
          <Text style={styles.previewPill}>{lastKey}</Text>
        ) : null}
      </View>
      <View style={styles.typingSurface}>
        <Text style={styles.typedText} numberOfLines={2}>
          {value || "Tap a key to try it"}
        </Text>
        <Text style={styles.inputHint}>LOCAL PREVIEW · NOT SENT ANYWHERE</Text>
      </View>
      <View style={styles.keysPanel}>
        {[...rows, bottomRow].map((row, rowIndex) => (
          <View
            key={`row-${rowIndex}`}
            style={[
              styles.row,
              rowIndex === (numberRow ? 2 : 1) &&
                !symbols &&
                !emojiMode &&
                styles.homeRow,
            ]}
          >
            {row.map((key, keyIndex) => {
              const label =
                key.action === "shift"
                  ? capsLock
                    ? "⇪"
                    : "⇧"
                  : !symbols && !emojiMode && /^[a-z]$/i.test(key.label)
                    ? shifted || capsLock
                      ? key.label.toUpperCase()
                      : key.label.toLowerCase()
                    : key.label;
              const active = key.action === "shift" && (shifted || capsLock);
              return (
                <Pressable
                  key={`${rowIndex}-${keyIndex}-${key.label}`}
                  accessibilityRole="button"
                  accessibilityLabel={
                    key.action === "space"
                      ? "space"
                      : key.action === "delete"
                        ? "backspace"
                        : label
                  }
                  onPress={() => press(key)}
                  style={({ pressed }) => [
                    styles.key,
                    { flex: key.flex ?? 1 },
                    key.action && styles.utilityKey,
                    key.action === "enter" && styles.enterKey,
                    active && styles.activeKey,
                    pressed && styles.pressedKey,
                  ]}
                >
                  {key.hint && !numberRow && !symbols && !emojiMode ? (
                    <Text style={styles.numberHint}>{key.hint}</Text>
                  ) : null}
                  <Text
                    style={[
                      styles.keyText,
                      key.action === "space" && styles.spaceText,
                      key.action === "enter" && styles.enterText,
                    ]}
                  >
                    {key.action === "space" ? "English" : label}
                  </Text>
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
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: c.paperDeep,
  },
  toolbar: {
    minHeight: 33,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EEE9DF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.line,
  },
  toolbarSymbol: {
    color: c.inkSoft,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 17,
    width: 18,
    textAlign: "center",
  },
  brandMark: {
    width: 12,
    height: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: c.clay,
    alignItems: "center",
    justifyContent: "center",
  },
  brandMarkInner: {
    width: 4,
    height: 4,
    borderRadius: 3,
    backgroundColor: c.clay,
  },
  brandLabel: {
    color: c.ink,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 11,
  },
  modeLabel: {
    marginLeft: "auto",
    color: c.inkSoft,
    fontFamily: bodyFont,
    fontSize: 10,
  },
  previewPill: {
    color: c.clayDark,
    backgroundColor: c.paperDeep,
    borderRadius: 8,
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 3,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 9,
  },
  typingSurface: {
    minHeight: 50,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: c.paperLight,
    justifyContent: "center",
  },
  typedText: {
    minHeight: 20,
    color: c.ink,
    fontFamily: bodyFont,
    fontSize: 14,
    lineHeight: 19,
  },
  inputHint: {
    marginTop: 2,
    color: c.inkSoft,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 7,
    letterSpacing: 0.8,
  },
  keysPanel: {
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 5,
    gap: 3,
    backgroundColor: c.paperDeep,
  },
  row: { height: 36, flexDirection: "row", gap: 3 },
  homeRow: { marginHorizontal: 10 },
  key: {
    minWidth: 0,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    backgroundColor: c.key,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D0C8BC",
    shadowColor: "#3A342B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  utilityKey: { backgroundColor: c.keyUtility },
  activeKey: { backgroundColor: "#D5C4AD", borderColor: c.clay },
  enterKey: { backgroundColor: c.clay, borderColor: c.clay },
  pressedKey: {
    transform: [{ translateY: 1 }],
    opacity: 0.76,
    shadowOpacity: 0,
  },
  keyText: {
    color: c.ink,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 15,
  },
  numberHint: {
    position: "absolute",
    top: 2,
    right: 3,
    color: c.inkSoft,
    fontFamily: bodyFont,
    fontSize: 6,
  },
  spaceText: { fontSize: 9 },
  enterText: { color: c.white, fontSize: 18 },
});
