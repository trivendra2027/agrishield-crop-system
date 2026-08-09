#include "PreferencesManager.h"
#include <Preferences.h>

static Preferences prefs;

void PreferencesManager::init() {
    prefs.begin("agrishield", false);
}

void PreferencesManager::saveTheme(int theme) { prefs.putInt("theme", theme); }
int PreferencesManager::loadTheme() { return prefs.getInt("theme", 1); }

void PreferencesManager::saveWiFiCredentials(String ssid, String pass) {
    prefs.putString("ssid", ssid);
    prefs.putString("pass", pass);
}
String PreferencesManager::loadSSID() { return prefs.getString("ssid", ""); }
String PreferencesManager::loadPass() { return prefs.getString("pass", ""); }

void PreferencesManager::saveCalibrationData(String key, float value) { prefs.putFloat(key.c_str(), value); }
float PreferencesManager::loadCalibrationData(String key, float defaultValue) { return prefs.getFloat(key.c_str(), defaultValue); }

void PreferencesManager::saveDeviceToken(String token) { prefs.putString("token", token); }
String PreferencesManager::loadDeviceToken() { return prefs.getString("token", ""); }
bool PreferencesManager::hasDeviceToken() { return prefs.getString("token", "") != ""; }
