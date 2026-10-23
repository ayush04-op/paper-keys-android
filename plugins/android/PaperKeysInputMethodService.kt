package __APP_PACKAGE__

import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.inputmethodservice.InputMethodService
import android.media.AudioManager
import android.os.Handler
import android.os.Looper
import android.text.TextUtils
import android.view.Gravity
import android.view.HapticFeedbackConstants
import android.view.KeyEvent
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
  private var shifted = false
  private var capsLock = false
  private val prefsName = "paper_keys_settings"
  private val paper = Color.rgb(244, 239, 229)
  private val panel = Color.rgb(233, 224, 209)
  private val keyFill = Color.rgb(252, 250, 245)
  private val keyUtility = Color.rgb(231, 222, 207)
  private val ink = Color.rgb(41, 37, 31)
  private val clay = Color.rgb(163, 111, 80)
  private val handler = Handler(Looper.getMainLooper())

  override fun onCreateInputView(): View {
    val root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(dp(5), dp(4), dp(5), dp(5))
      setBackgroundColor(panel)
    }
    keyboardRoot = root
    buildKeys(root)
    return root
  }

  override fun onStartInputView(info: EditorInfo?, restarting: Boolean) {
    super.onStartInputView(info, restarting)
    if (!capsLock) shifted = false
    keyboardRoot?.let { buildKeys(it) }
  }

  private fun buildKeys(root: LinearLayout) {
    root.removeAllViews()
    val toolbar = LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER_VERTICAL
      setPadding(dp(8), 0, dp(8), dp(3))
    }
    val title = textView("paper keys", 14, ink).apply {
      typeface = Typeface.create("serif", Typeface.NORMAL)
      letterSpacing = 0.01f
    }
    toolbar.addView(title, LinearLayout.LayoutParams(0, dp(31), 1f))
    val switcher = textView("⌨", 16, clay).apply {
      gravity = Gravity.CENTER
      setOnClickListener {
        (getSystemService(Context.INPUT_METHOD_SERVICE) as? InputMethodManager)?.showInputMethodPicker()
      }
    }
    toolbar.addView(switcher, LinearLayout.LayoutParams(dp(44), dp(31)))
    root.addView(toolbar)

    if (!symbols) {
      addRow(root, "qwertyuiop".map { KeySpec(it.toString()) })
      addRow(root, "asdfghjkl".map { KeySpec(it.toString()) }, inset = 10)
      addRow(root, listOf(KeySpec("⇧", "shift", 1.45f)) + "zxcvbnm".map { KeySpec(it.toString()) } + KeySpec("⌫", "delete", 1.45f))
    } else {
      addRow(root, "1234567890".map { KeySpec(it.toString()) })
      addRow(root, listOf("@", "#", "\\$", "%", "&", "-", "+", "(", ")").map { KeySpec(it) }, inset = 5)
      addRow(root, listOf(KeySpec("ABC", "symbols", 1.4f)) + listOf("!", "'", "\"", ":", ";", "?").map { KeySpec(it) } + KeySpec("⌫", "delete", 1.4f))
    }
    addRow(root, listOf(
      KeySpec(if (symbols) "=\\<" else "?123", "symbols", 1.45f),
      KeySpec(",", "char", 0.8f),
      KeySpec("space", "space", 4.15f),
      KeySpec(".", "char", 0.8f),
      KeySpec("↵", "enter", 1.35f),
    ))
  }

  private fun addRow(root: LinearLayout, keys: List<KeySpec>, inset: Int = 0) {
    val isLandscape = resources.configuration.orientation == android.content.res.Configuration.ORIENTATION_LANDSCAPE
    val rowHeight = if (isLandscape) 39 else 47
    val row = LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER
      if (inset > 0) setPadding(dp(inset), 0, dp(inset), 0)
    }
    for (spec in keys) {
      val keyView = TextView(this).apply {
        text = displayLabel(spec)
        gravity = Gravity.CENTER
        typeface = Typeface.create("serif", Typeface.NORMAL)
        textSize = if (spec.action == "space") 10f else if (spec.action == "symbols" || spec.action == "enter" || spec.action == "shift" || spec.action == "delete") 15f else 19f
        setTextColor(if (spec.action == "enter") Color.WHITE else ink)
        background = rounded(if (spec.action == "enter") clay else if (isUtility(spec.action)) keyUtility else keyFill, dp(7), if (spec.action == "shift" && shifted) clay else Color.rgb(216, 207, 193))
        elevation = dp(1).toFloat()
        isClickable = true
        isFocusable = true
        contentDescription = if (spec.action == "space") "space" else if (spec.action == "delete") "backspace" else spec.label
        setOnClickListener { performKey(spec, this) }
        if (spec.action == "delete") setOnLongClickListener {
          currentInputConnection?.deleteSurroundingTextInCodePoints(2, 0)
          true
        }
        if (spec.action == "shift") setOnLongClickListener {
          capsLock = !capsLock
          shifted = capsLock
          keyboardRoot?.let { buildKeys(it) }
          true
        }
      }
      val params = LinearLayout.LayoutParams(0, dp(rowHeight), spec.weight)
      params.setMargins(dp(2), dp(2), dp(2), dp(2))
      row.addView(keyView, params)
    }
    val rowParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(rowHeight + 3))
    root.addView(row, rowParams)
  }

  private fun displayLabel(spec: KeySpec): String {
    if (spec.action == "space") return "space"
    if (spec.action == "shift") return if (capsLock) "⇧  ·" else "⇧"
    if (!symbols && spec.action == "char" && spec.label.length == 1 && spec.label[0].isLetter()) {
      return if (shifted || capsLock) spec.label.uppercase(Locale.ROOT) else spec.label.lowercase(Locale.ROOT)
    }
    return spec.label
  }

  private fun isUtility(action: String): Boolean = action in listOf("shift", "delete", "symbols", "space")

  private fun performKey(spec: KeySpec, anchor: View) {
    if (prefs().getBoolean("vibration", true)) anchor.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
    if (prefs().getBoolean("sound", false)) {
      (getSystemService(Context.AUDIO_SERVICE) as? AudioManager)?.playSoundEffect(AudioManager.FX_KEY_CLICK)
    }
    if (prefs().getBoolean("keyPreview", true) && spec.label != "space") showPreview(anchor, spec.label)

    when (spec.action) {
      "shift" -> {
        if (shifted && !capsLock) capsLock = true
        else if (capsLock) { capsLock = false; shifted = false }
        else shifted = true
        keyboardRoot?.let { buildKeys(it) }
      }
      "symbols" -> { symbols = !symbols; keyboardRoot?.let { buildKeys(it) } }
      "delete" -> currentInputConnection?.deleteSurroundingTextInCodePoints(1, 0)
      "space" -> {
        currentInputConnection?.commitText(" ", 1)
        if (!capsLock) { shifted = false; keyboardRoot?.let { buildKeys(it) } }
      }
      "enter" -> sendEnter()
      else -> {
        val text = if (!symbols && shifted || capsLock) spec.label.uppercase(Locale.ROOT) else spec.label
        currentInputConnection?.commitText(text, 1)
        if (!capsLock && spec.label.length == 1 && spec.label[0].isLetter()) {
          shifted = false
          keyboardRoot?.let { buildKeys(it) }
        }
      }
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

  private fun showPreview(anchor: View, label: String) {
    val view = TextView(this).apply {
      text = if (!symbols && shifted) label.uppercase(Locale.ROOT) else label
      gravity = Gravity.CENTER
      typeface = Typeface.create("serif", Typeface.NORMAL)
      textSize = 21f
      setTextColor(ink)
      background = rounded(keyFill, dp(10), Color.rgb(216, 207, 193))
      elevation = dp(5).toFloat()
    }
    val popup = PopupWindow(view, dp(46), dp(48), false)
    popup.isTouchable = false
    popup.isOutsideTouchable = false
    try {
      popup.showAsDropDown(anchor, 0, -dp(58))
      handler.postDelayed({ if (popup.isShowing) popup.dismiss() }, 240)
    } catch (_: Exception) {
      // The keyboard continues to work if a preview cannot be shown on a particular window.
    }
  }

  private fun prefs() = getSharedPreferences(prefsName, Context.MODE_PRIVATE)

  private fun rounded(fill: Int, radius: Int, stroke: Int): GradientDrawable = GradientDrawable().apply {
    shape = GradientDrawable.RECTANGLE
    cornerRadius = radius.toFloat()
    setColor(fill)
    setStroke(dp(1), stroke)
  }

  private fun textView(value: String, size: Int, color: Int) = TextView(this).apply {
    text = value
    textSize = size.toFloat()
    setTextColor(color)
    gravity = Gravity.CENTER_VERTICAL
  }

  private fun dp(value: Int): Int = (value * resources.displayMetrics.density + 0.5f).toInt()
}
