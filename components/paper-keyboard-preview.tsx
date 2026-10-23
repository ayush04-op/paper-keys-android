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
type KeySpec = {
  label: string;
  action?: Action;
  flex?: number;
  hint?: string;
  symbolHint?: string;
};
type ToolbarAction =
  | "tools"
  | "emoji"
  | "gif"
  | "settings"
  | "translate"
  | "voice";
type Props = {
  value: string;
  onChange: (value: string) => void;
  showKeyPreview?: boolean;
  numberRow?: boolean;
  onOpenSettings?: () => void;
  onToggleNumberRow?: () => void;
};

const bodyFont =
  Platform.select({ web: "Arial", default: "sans-serif" }) ?? "sans-serif";
const mediumFont =
  Platform.select({ web: "Arial", default: "sans-serif-medium" }) ??
  "sans-serif-medium";

const digitHints = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const symbolHints: Record<string, string> = {
  q: "%",
  w: "\\",
  e: "|",
  r: "=",
  t: "[",
  y: "]",
  u: "<",
  i: ">",
  o: "{",
  p: "}",
  a: "@",
  s: "#",
  d: "£",
  f: "-",
  g: "&",
  h: "-",
  j: "+",
  k: "(",
  l: ")",
  z: "*",
  x: '"',
  c: "'",
  v: ":",
  b: ";",
  n: "!",
  m: "?",
};
const letterRows: KeySpec[][] = [
  [..."qwertyuiop"].map((label, index) => ({
    label,
    hint: digitHints[index],
    symbolHint: symbolHints[label],
  })),
  [..."asdfghjkl"].map((label) => ({ label, symbolHint: symbolHints[label] })),
  [
    { label: "⇧", action: "shift", flex: 1.35 },
    ...[..."zxcvbnm"].map((label) => ({
      label,
      symbolHint: symbolHints[label],
    })),
    { label: "⌫", action: "delete", flex: 1.35 },
  ],
];
const symbolRows: KeySpec[][] = [
  [..."1234567890"].map((label) => ({ label })),
  ["@", "#", "$", "%", "&", "-", "+", "(", ")"].map((label) => ({
    label,
  })),
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
  ["£", "€", "¥", "^", "°", "=", "{", "}", "\\"].map((label) => ({
    label,
  })),
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
const toolbarItems: { action: ToolbarAction; icon: string; label: string }[] = [
  { action: "tools", icon: "▦", label: "Tools" },
  { action: "emoji", icon: "☻", label: "Stickers and emoji" },
  { action: "gif", icon: "GIF", label: "GIF" },
  { action: "settings", icon: "⚙", label: "Settings" },
  { action: "translate", icon: "文A", label: "Translate" },
  { action: "voice", icon: "🎙", label: "Voice input" },
];

export function PaperKeyboardPreview({
  value,
  onChange,
  showKeyPreview = false,
  numberRow = true,
  onOpenSettings,
  onToggleNumberRow,
}: Props) {
  const [shifted, setShifted] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [symbols, setSymbols] = useState(false);
  const [symbolPage, setSymbolPage] = useState(0);
  const [emojiMode, setEmojiMode] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [toolbarNotice, setToolbarNotice] = useState("");
  const [lastKey, setLastKey] = useState("");
  const clearPreviewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (clearPreviewTimer.current) clearTimeout(clearPreviewTimer.current);
    },
    [],
  );

  const pressToolbar = (action: ToolbarAction) => {
    setToolbarNotice("");
    if (action === "tools") {
      setToolsOpen((open) => !open);
      return;
    }
    if (action === "emoji") {
      setEmojiMode((active) => !active);
      setSymbols(false);
      setToolsOpen(false);
      return;
    }
    if (action === "settings") {
      setToolsOpen(false);
      if (onOpenSettings) onOpenSettings();
      else setToolbarNotice("Open Settings to personalize the keyboard.");
      return;
    }
    if (action === "gif") {
      setToolbarNotice(
        "GIF search is not included. Paper Keys stays on-device.",
      );
    } else if (action === "translate") {
      setToolbarNotice(
        "Translation is not connected so typing stays on-device.",
      );
    } else {
      setToolbarNotice(
        "Voice input is off; Paper Keys does not request microphone access.",
      );
    }
  };

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
          label: symbolPage === 0 ? "=<" : "123",
          action: "symbolPage",
          flex: 1.35,
        }
      : { label: "?123", action: "symbols", flex: 1.35 };
  const bottomRow: KeySpec[] = [
    bottomKey,
    { label: ",", flex: 0.85 },
    { label: "☻", action: "emoji", flex: 1 },
    { label: "space", action: "space", flex: 3.65 },
    { label: ".", flex: 0.85 },
    { label: "⌕", action: "enter", flex: 1.25 },
  ];

  return (
    <View style={styles.shell}>
      <View style={styles.toolbar}>
        {toolbarItems.map((item) => (
          <Pressable
            key={item.action}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={() => pressToolbar(item.action)}
            style={({ pressed }) => [
              styles.toolbarButton,
              item.action === "voice" && styles.voiceButton,
              pressed && styles.pressedKey,
            ]}
          >
            <Text
              style={[
                styles.toolbarIcon,
                ["gif", "translate", "voice"].includes(item.action) &&
                  styles.disabledToolbarIcon,
                (item.action === "gif" || item.action === "translate") &&
                  styles.compactToolbarIcon,
              ]}
            >
              {item.icon}
            </Text>
          </Pressable>
        ))}
      </View>
      {toolsOpen ? (
        <View style={styles.toolTray}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setEmojiMode(true);
              setSymbols(false);
              setToolsOpen(false);
            }}
            style={({ pressed }) => [
              styles.toolItem,
              pressed && styles.pressedKey,
            ]}
          >
            <Text style={styles.toolText}>Emoji</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              onToggleNumberRow?.();
              setToolsOpen(false);
            }}
            style={({ pressed }) => [
              styles.toolItem,
              pressed && styles.pressedKey,
            ]}
          >
            <Text style={styles.toolText}>
              Number row {numberRow ? "on" : "off"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setToolsOpen(false);
              onOpenSettings?.();
            }}
            style={({ pressed }) => [
              styles.toolItem,
              pressed && styles.pressedKey,
            ]}
          >
            <Text style={styles.toolText}>Settings</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.typingSurface}>
        <Text style={styles.typedText} numberOfLines={2}>
          {value || "Tap a key to try it"}
        </Text>
        <Text style={styles.inputHint} numberOfLines={1}>
          {toolbarNotice || "LOCAL PREVIEW · NOT SENT ANYWHERE"}
        </Text>
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
                        : key.action === "enter"
                          ? "Search"
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
                  {key.symbolHint && numberRow && !symbols && !emojiMode ? (
                    <Text style={styles.symbolHint}>{key.symbolHint}</Text>
                  ) : key.hint && !numberRow && !symbols && !emojiMode ? (
                    <Text style={styles.numberHint}>{key.hint}</Text>
                  ) : null}
                  {key.action === "enter" ? (
                    <View style={styles.searchIconContainer}>
                      <View style={styles.searchLens} />
                      <View style={styles.searchHandle} />
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.keyText,
                        key.action === "space" && styles.spaceText,
                      ]}
                    >
                      {key.action === "space" ? "English" : label}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
      {showKeyPreview && lastKey ? (
        <View pointerEvents="none" style={styles.keyPopup}>
          <Text style={styles.keyPopupText}>{lastKey}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderColor: c.line,
    borderWidth: 1,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: c.paperDeep,
  },
  toolbar: {
    minHeight: 39,
    paddingHorizontal: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#EEE9DF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.line,
  },
  toolbarButton: {
    flex: 1,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  voiceButton: { backgroundColor: c.paperLight, marginHorizontal: 7 },
  toolbarIcon: {
    color: c.ink,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 17,
    textAlign: "center",
  },
  disabledToolbarIcon: { color: c.inkSoft },
  compactToolbarIcon: { fontSize: 10 },
  toolTray: {
    minHeight: 34,
    paddingHorizontal: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: c.paperDeep,
  },
  toolItem: {
    flex: 1,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: c.paperLight,
  },
  toolText: {
    color: c.inkSoft,
    fontFamily: mediumFont,
    fontWeight: "600",
    fontSize: 9,
  },
  typingSurface: {
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    letterSpacing: 0.7,
  },
  keysPanel: {
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 5,
    gap: 3,
    backgroundColor: c.paperDeep,
  },
  row: { height: 38, flexDirection: "row", gap: 3 },
  homeRow: { marginHorizontal: 10 },
  key: {
    minWidth: 0,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
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
    fontSize: 16,
  },
  symbolHint: {
    position: "absolute",
    top: 2,
    right: 4,
    color: c.inkSoft,
    fontFamily: bodyFont,
    fontSize: 7,
  },
  numberHint: {
    position: "absolute",
    top: 2,
    right: 4,
    color: c.inkSoft,
    fontFamily: bodyFont,
    fontSize: 7,
  },
  spaceText: { fontSize: 9 },
  searchIconContainer: { width: 22, height: 22, position: "relative" },
  searchLens: {
    position: "absolute",
    top: 1,
    left: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: c.white,
  },
  searchHandle: {
    position: "absolute",
    top: 13,
    left: 13,
    width: 8,
    height: 2,
    borderRadius: 2,
    backgroundColor: c.white,
    transform: [{ rotate: "45deg" }],
  },
  keyPopup: {
    position: "absolute",
    right: 24,
    bottom: 57,
    zIndex: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.paperLight,
    shadowColor: "#3A342B",
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 4,
  },
  keyPopupText: {
    color: c.ink,
    fontFamily: mediumFont,
    fontSize: 18,
  },
});
