package __APP_PACKAGE__

import android.content.Context
import android.content.Intent
import android.content.res.ColorStateList
import android.content.res.Configuration
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.RippleDrawable
import android.inputmethodservice.InputMethodService
import android.media.AudioManager
import android.os.Handler
import android.os.Looper
import android.text.SpannableString
import android.text.TextUtils
import android.text.style.ForegroundColorSpan
import android.text.style.RelativeSizeSpan
import android.text.style.SuperscriptSpan
import android.view.Gravity
import android.view.HapticFeedbackConstants
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.widget.LinearLayout
import android.widget.PopupWindow
import android.widget.TextView
import java.util.Locale

class PaperKeysInputMethodService : InputMethodService() {
  private data class KeySpec(val label: String, val action: String = "char", val weight: Float = 1f)

  private var keyboardRoot: LinearLayout? = null
  private var symbols = false
  private var symbolPage = 0
  private var emojiMode = false
  private var shifted = false
  private var capsLock = false
  private var sentenceStart = false
  private var soundEnabled = false
  private var vibrationEnabled = false
  private var keyPreviewEnabled = false
  private var numberRowEnabled = false
  private var deleteRepeating = false
  private var shiftKeyView: TextView? = null
  private val letterKeyViews = mutableListOf<Pair<KeySpec, TextView>>()
  private val prefsName = "paper_keys_settings"
  private val panel = Color.rgb(229, 223, 212)
  private val keyFill = Color.rgb(255, 254, 250)
  private val keyUtility = Color.rgb(220, 213, 200)
  private val ink = Color.rgb(43, 40, 35)
  private val muted = Color.rgb(113, 105, 93)
  private val clay = Color.rgb(151, 99, 66)
  private val line = Color.rgb(204, 195, 180)
  private val handler = Handler(Looper.getMainLooper())
  private var previewPopup: PopupWindow? = null
  private var previewLabel: TextView? = null
  private val dismissPreview = Runnable { previewPopup?.dismiss() }
  private val repeatDelete = object : Runnable {
    override fun run() {
      if (!deleteRepeating) return
      deletePreviousCodePoint()
      handler.postDelayed(this, 48L)
    }
  }
  private val digitHints = mapOf("q" to "1", "w" to "2", "e" to "3", "r" to "4", "t" to "5", "y" to "6", "u" to "7", "i" to "8", "o" to "9", "p" to "0")

  override fun onCreateInputView(): View {
    refreshPreferences()
    val root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(dp(4), dp(3), dp(4), dp(4))
      setBackgroundColor(panel)
    }
    keyboardRoot = root
    buildKeys(root)
    prepareKeyPreview()
    return root
  }

  override fun onStartInputView(info: EditorInfo?, restarting: Boolean) {
    super.onStartInputView(info, restarting)
    stopDeleteRepeat()
    val numberRowChanged = refreshPreferences()
    val capsMode = currentInputConnection?.getCursorCapsMode(
      TextUtils.CAP_MODE_CHARACTERS or TextUtils.CAP_MODE_WORDS or TextUtils.CAP_MODE_SENTENCES,
    ) ?: 0
    capsLock = (capsMode and TextUtils.CAP_MODE_CHARACTERS) != 0
    shifted = capsLock || (capsMode and (TextUtils.CAP_MODE_WORDS or TextUtils.CAP_MODE_SENTENCES)) != 0
    sentenceStart = shifted
    keyboardRoot?.let { root ->
      if (numberRowChanged || root.childCount == 0) buildKeys(root) else updateKeyLabels()
    }
  }

  override fun onFinishInputView(finishingInput: Boolean) {
    stopDeleteRepeat()
    handler.removeCallbacks(dismissPreview)
    previewPopup?.dismiss()
    super.onFinishInputView(finishingInput)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    keyboardRoot?.let { buildKeys(it) }
    prepareKeyPreview()
  }

  override fun onDestroy() {
    stopDeleteRepeat()
    handler.removeCallbacks(dismissPreview)
    previewPopup?.dismiss()
    previewPopup = null
    previewLabel = null
    super.onDestroy()
  }

  private fun refreshPreferences(): Boolean {
    val prefs = getSharedPreferences(prefsName, Context.MODE_PRIVATE)
    val nextNumberRow = prefs.getBoolean("numberRow", false)
    val changed = nextNumberRow != numberRowEnabled
    soundEnabled = prefs.getBoolean("sound", false)
    vibrationEnabled = prefs.getBoolean("vibration", false)
    keyPreviewEnabled = prefs.getBoolean("keyPreview", false)
    numberRowEnabled = nextNumberRow
    return changed
  }

  private fun buildKeys(root: LinearLayout) {
    root.removeAllViews()
    letterKeyViews.clear()
    shiftKeyView = null
    addToolbar(root)

    if (!symbols && !emojiMode && numberRowEnabled) {
      addRow(root, "1234567890".map { KeySpec(it.toString()) }, numberRow = true)
    }
    when {
      emojiMode -> {
        addRow(root, listOf("😀", "😃", "😄", "😁", "😆", "😊", "😍", "🥰", "😘", "😎").map { KeySpec(it) })
        addRow(root, listOf("😂", "🤣", "🥲", "😭", "😤", "😴", "🤔", "🙌", "👍", "❤️").map { KeySpec(it) }, inset = 3)
        addRow(root, listOf(KeySpec("ABC", "emoji", 1.35f)) + listOf("✨", "🎉", "🔥", "💯", "🌿", "☀️").map { KeySpec(it) } + KeySpec("⌫", "delete", 1.35f))
      }
      symbols -> {
        if (symbolPage == 0) {
          addRow(root, "1234567890".map { KeySpec(it.toString()) })
          addRow(root, listOf("@", "#", "\$", "%", "&", "-", "+", "(", ")").map { KeySpec(it) }, inset = 4)
          addRow(root, listOf(KeySpec("ABC", "symbols", 1.35f)) + listOf("!", "'", "\"", ":", ";", "?").map { KeySpec(it) } + KeySpec("⌫", "delete", 1.35f))
        } else {
          addRow(root, listOf("~", "`", "|", "•", "√", "π", "÷", "×", "¶", "∆").map { KeySpec(it) })
          addRow(root, listOf("£", "€", "¥", "^", "°", "=", "{", "}", "\\").map { KeySpec(it) }, inset = 4)
          addRow(root, listOf(KeySpec("123", "symbolPage", 1.35f)) + listOf("<", ">", "[", "]", "_", "\\", "§").map { KeySpec(it) } + KeySpec("⌫", "delete", 1.35f))
        }
      }
      else -> {
        addRow(root, "qwertyuiop".map { KeySpec(it.toString()) })
        addRow(root, "asdfghjkl".map { KeySpec(it.toString()) }, inset = 10)
        addRow(root, listOf(KeySpec("⇧", "shift", 1.45f)) + "zxcvbnm".map { KeySpec(it.toString()) } + KeySpec("⌫", "delete", 1.45f))
      }
    }

    val firstBottom = when {
      emojiMode -> KeySpec("ABC", "emoji", 1.35f)
      symbols && symbolPage == 0 -> KeySpec("=<", "symbolPage", 1.35f)
      symbols -> KeySpec("123", "symbolPage", 1.35f)
      else -> KeySpec("?123", "symbols", 1.35f)
    }
    addRow(root, listOf(
      firstBottom,
      KeySpec(",", weight = 0.85f),
      KeySpec("☺", "emoji", 1.0f),
      KeySpec("space", "space", 3.65f),
      KeySpec(".", weight = 0.85f),
      KeySpec("↵", "enter", 1.25f),
    ))
    updateKeyLabels()
  }

  private fun addToolbar(root: LinearLayout) {
    val toolbar = LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER_VERTICAL
      setPadding(dp(8), 0, dp(5), dp(1))
    }
    val title = TextView(this).apply {
      text = "paper keys"
      textSize = 12f
      typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
      setTextColor(ink)
      gravity = Gravity.CENTER_VERTICAL
    }
    toolbar.addView(title, LinearLayout.LayoutParams(0, dp(29), 1f))
    val settings = toolbarButton("⚙", "Open Paper Keys preferences") {
      packageManager.getLaunchIntentForPackage(packageName)?.let { intent ->
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        startActivity(intent)
      }
    }
    val picker = toolbarButton("⌨", "Choose keyboard") {
      (getSystemService(Context.INPUT_METHOD_SERVICE) as? InputMethodManager)?.showInputMethodPicker()
    }
    toolbar.addView(settings, LinearLayout.LayoutParams(dp(36), dp(29)))
    toolbar.addView(picker, LinearLayout.LayoutParams(dp(36), dp(29)))
    root.addView(toolbar, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(30)))
  }

  private fun toolbarButton(label: String, description: String, onPress: () -> Unit) = TextView(this).apply {
    text = label
    textSize = 15f
    typeface = Typeface.create("sans-serif", Typeface.NORMAL)
    setTextColor(muted)
    gravity = Gravity.CENTER
    contentDescription = description
    isClickable = true
    isFocusable = false
    background = RippleDrawable(
      ColorStateList.valueOf(Color.rgb(203, 193, 177)),
      rounded(Color.TRANSPARENT, dp(7), Color.TRANSPARENT),
      null,
    )
    setOnClickListener { onPress() }
  }

  private fun addRow(root: LinearLayout, keys: List<KeySpec>, inset: Int = 0, numberRow: Boolean = false) {
    val landscape = resources.configuration.orientation == Configuration.ORIENTATION_LANDSCAPE
    val rowHeight = if (landscape) 35 else if (numberRow) 36 else 43
    val row = LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER
      if (inset > 0) setPadding(dp(inset), 0, dp(inset), 0)
    }
    for (spec in keys) {
      val keyView = TextView(this).apply {
        text = keyLabel(spec)
        gravity = Gravity.CENTER
        typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
        textSize = when {
          spec.action == "space" -> 10f
          numberRow -> 16f
          spec.action in listOf("symbols", "symbolPage", "emoji", "enter", "shift", "delete") -> 15f
          spec.label.length > 1 -> 12f
          else -> 19f
        }
        setTextColor(if (spec.action == "enter") Color.WHITE else ink)
        background = keyBackground(keyColor(spec), if (spec.action == "enter") Color.rgb(126, 79, 51) else Color.rgb(202, 192, 175))
        elevation = dp(1).toFloat()
        isClickable = true
        isFocusable = false
        contentDescription = accessibilityLabel(spec)
        if (spec.action != "delete") setOnClickListener { performKey(spec, this) }
        if (spec.action == "delete") {
          setOnClickListener { performKey(spec, this) }
          setOnTouchListener { view, event ->
            when (event.actionMasked) {
              MotionEvent.ACTION_DOWN -> {
                view.isPressed = true
                deleteRepeating = true
                deletePreviousCodePoint()
                giveFeedback(view)
                if (keyPreviewEnabled) showPreview(view, "⌫")
                handler.removeCallbacks(repeatDelete)
                handler.postDelayed(repeatDelete, 420L)
                true
              }
              MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                view.isPressed = false
                stopDeleteRepeat()
                true
              }
              else -> true
            }
          }
        }
        val digit = digitHints[spec.label.lowercase(Locale.ROOT)]
        if (!numberRow && digit != null && spec.action == "char") {
          setOnLongClickListener {
            currentInputConnection?.commitText(digit, 1)
            sentenceStart = false
            if (!capsLock && shifted) {
              shifted = false
              updateKeyLabels()
            }
            giveFeedback(this)
            if (keyPreviewEnabled) showPreview(this, digit)
            true
          }
        }
        if (spec.action == "shift") shiftKeyView = this
        if (spec.action == "char" && spec.label.length == 1 && spec.label[0].isLetter()) {
          letterKeyViews.add(spec to this)
        }
      }
      val params = LinearLayout.LayoutParams(0, dp(rowHeight), spec.weight)
      params.setMargins(dp(2), dp(2), dp(2), dp(2))
      row.addView(keyView, params)
    }
    root.addView(row, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(rowHeight + 3)))
  }

  private fun keyLabel(spec: KeySpec): CharSequence {
    if (spec.action == "space") return "English"
    if (spec.action != "char" || spec.label.length != 1 || !spec.label[0].isLetter() || symbols || emojiMode) return spec.label
    val lower = spec.label.lowercase(Locale.ROOT)
    val visible = if (shifted || capsLock) spec.label.uppercase(Locale.ROOT) else lower
    val digit = if (numberRowEnabled) null else digitHints[lower]
    if (digit == null) return visible
    return SpannableString("$visible$digit").apply {
      setSpan(RelativeSizeSpan(0.42f), visible.length, length, 0)
      setSpan(SuperscriptSpan(), visible.length, length, 0)
      setSpan(ForegroundColorSpan(muted), visible.length, length, 0)
    }
  }

  private fun keyColor(spec: KeySpec): Int = when {
    spec.action == "enter" -> clay
    spec.action == "shift" && shifted -> Color.rgb(206, 186, 158)
    spec.action in listOf("shift", "delete", "symbols", "symbolPage", "emoji", "space") -> keyUtility
    else -> keyFill
  }

  private fun accessibilityLabel(spec: KeySpec): String = when {
    spec.action == "space" -> "space"
    spec.action == "delete" -> "backspace; hold to repeat"
    spec.action == "shift" -> if (capsLock) "caps lock on" else "shift"
    spec.action == "symbols" -> "numbers and symbols"
    spec.action == "symbolPage" -> "more symbols"
    spec.action == "emoji" -> "emoji"
    digitHints.containsKey(spec.label.lowercase(Locale.ROOT)) -> "${spec.label}; long press for ${digitHints[spec.label.lowercase(Locale.ROOT)]}"
    else -> spec.label
  }

  private fun performKey(spec: KeySpec, anchor: View) {
    val connection = currentInputConnection
    when (spec.action) {
      "shift" -> {
        if (capsLock) {
          capsLock = false
          shifted = false
        } else if (shifted) {
          capsLock = true
          shifted = true
        } else {
          shifted = true
        }
        updateKeyLabels()
      }
      "symbols" -> {
        symbols = !symbols
        emojiMode = false
        symbolPage = 0
        keyboardRoot?.let { buildKeys(it) }
      }
      "symbolPage" -> {
        symbolPage = 1 - symbolPage
        symbols = true
        emojiMode = false
        keyboardRoot?.let { buildKeys(it) }
      }
      "emoji" -> {
        emojiMode = !emojiMode
        symbols = false
        keyboardRoot?.let { buildKeys(it) }
      }
      "delete" -> deletePreviousCodePoint()
      "space" -> {
        connection?.commitText(" ", 1)
        if (!capsLock && shifted != sentenceStart) {
          shifted = sentenceStart
          updateKeyLabels()
        }
      }
      "enter" -> {
        sendEnter()
        sentenceStart = true
        if (!capsLock && !shifted) {
          shifted = true
          updateKeyLabels()
        }
      }
      else -> {
        val isLetter = spec.label.length == 1 && spec.label[0].isLetter() && !symbols && !emojiMode
        val text = if (isLetter && (shifted || capsLock)) spec.label.uppercase(Locale.ROOT) else spec.label
        connection?.commitText(text, 1)
        if (isLetter) {
          sentenceStart = false
          if (!capsLock && shifted) {
            shifted = false
            updateKeyLabels()
          }
        } else if (spec.label in listOf(".", "?", "!", "\n")) {
          sentenceStart = true
        }
      }
    }
    giveFeedback(anchor)
    if (keyPreviewEnabled && spec.action != "space" && spec.action != "delete") {
      showPreview(anchor, if (spec.action == "shift") if (capsLock) "⇪" else "⇧" else spec.label)
    }
  }

  private fun updateKeyLabels() {
    letterKeyViews.forEach { (spec, view) -> view.text = keyLabel(spec) }
    shiftKeyView?.let { view ->
      view.text = if (capsLock) "⇪" else "⇧"
      view.background = keyBackground(keyColor(KeySpec("⇧", "shift")), Color.rgb(202, 192, 175))
    }
  }

  private fun deletePreviousCodePoint() {
    currentInputConnection?.deleteSurroundingTextInCodePoints(1, 0)
  }

  private fun stopDeleteRepeat() {
    deleteRepeating = false
    handler.removeCallbacks(repeatDelete)
  }

  private fun giveFeedback(view: View) {
    if (vibrationEnabled) view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
    if (soundEnabled) {
      (getSystemService(Context.AUDIO_SERVICE) as? AudioManager)?.playSoundEffect(AudioManager.FX_KEY_CLICK)
    }
  }

  private fun sendEnter() {
    val connection = currentInputConnection ?: return
    val action = currentInputEditorInfo?.imeOptions?.and(EditorInfo.IME_MASK_ACTION) ?: EditorInfo.IME_ACTION_UNSPECIFIED
    if (action != EditorInfo.IME_ACTION_UNSPECIFIED && action != EditorInfo.IME_ACTION_NONE) {
      connection.performEditorAction(action)
    } else {
      connection.sendKeyEvent(KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_ENTER))
      connection.sendKeyEvent(KeyEvent(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_ENTER))
    }
  }

  private fun prepareKeyPreview() {
    if (previewPopup != null) return
    val label = TextView(this).apply {
      gravity = Gravity.CENTER
      typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
      textSize = 22f
      setTextColor(ink)
      background = rounded(keyFill, dp(9), line)
      elevation = dp(4).toFloat()
    }
    previewLabel = label
    previewPopup = PopupWindow(label, dp(44), dp(47), false).apply {
      isTouchable = false
      isOutsideTouchable = false
    }
  }

  private fun showPreview(anchor: View, text: String) {
    prepareKeyPreview()
    val popup = previewPopup ?: return
    previewLabel?.text = text
    handler.removeCallbacks(dismissPreview)
    try {
      if (popup.isShowing) popup.update(anchor, 0, -dp(54), dp(44), dp(47))
      else popup.showAsDropDown(anchor, 0, -dp(54))
      handler.postDelayed(dismissPreview, 140L)
    } catch (_: Exception) {
      // A preview is optional; key input has already been committed.
    }
  }

  private fun keyBackground(fill: Int, ripple: Int): RippleDrawable = RippleDrawable(
    ColorStateList.valueOf(ripple),
    rounded(fill, dp(6), line),
    rounded(Color.WHITE, dp(6), Color.WHITE),
  )

  private fun rounded(fill: Int, radius: Int, stroke: Int): GradientDrawable = GradientDrawable().apply {
    shape = GradientDrawable.RECTANGLE
    cornerRadius = radius.toFloat()
    setColor(fill)
    setStroke(dp(1), stroke)
  }

  private fun dp(value: Int): Int = (value * resources.displayMetrics.density + 0.5f).toInt()
}
