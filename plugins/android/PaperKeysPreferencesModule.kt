package __APP_PACKAGE__

import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.view.inputmethod.InputMethodManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class PaperKeysPreferencesModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName(): String = "PaperKeysPreferences"

  private fun keyboardPreferences() =
    reactApplicationContext.getSharedPreferences("paper_keys_settings", Context.MODE_PRIVATE).apply {
      if (!contains("showNumberRow")) {
        edit()
          .putBoolean("showNumberRow", getBoolean("numberRow", true))
          .remove("numberRow")
          .apply()
      }
    }

  @ReactMethod
  fun getPreferences(promise: Promise) {
    try {
      val prefs = keyboardPreferences()
      val result = Arguments.createMap().apply {
        putBoolean("sound", prefs.getBoolean("sound", false))
        putBoolean("vibration", prefs.getBoolean("vibration", false))
        putBoolean("keyPreview", prefs.getBoolean("keyPreview", false))
        putBoolean("numberRow", prefs.getBoolean("showNumberRow", true))
      }
      promise.resolve(result)
    } catch (error: Exception) {
      promise.reject("PAPER_KEYS_PREFS_READ", error)
    }
  }

  @ReactMethod
  fun setPreferences(sound: Boolean, vibration: Boolean, keyPreview: Boolean, numberRow: Boolean, promise: Promise) {
    try {
      keyboardPreferences()
        .edit()
        .putBoolean("sound", sound)
        .putBoolean("vibration", vibration)
        .putBoolean("keyPreview", keyPreview)
        .putBoolean("showNumberRow", numberRow)
        .apply()
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("PAPER_KEYS_PREFS_WRITE", error)
    }
  }

  @ReactMethod
  fun openInputMethodSettings() {
    val intent = Intent(Settings.ACTION_INPUT_METHOD_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    reactApplicationContext.startActivity(intent)
  }

  @ReactMethod
  fun showInputMethodPicker() {
    val manager = reactApplicationContext.getSystemService(Context.INPUT_METHOD_SERVICE) as? InputMethodManager
    manager?.showInputMethodPicker()
  }
}
