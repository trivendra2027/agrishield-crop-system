#pragma once
#include <Arduino.h>

class PreferencesManager {
public:
    static void init();
    static void saveTheme(int theme);
    static int loadTheme();
    static void saveWiFiCredentials(String ssid, String pass);
    static String loadSSID();
    static String loadPass();
    static void saveCalibrationData(String key, float value);
    static float loadCalibrationData(String key, float defaultValue);
    
    // API Tokens
    static void saveDeviceToken(String token);
    static String loadDeviceToken();
    static bool hasDeviceToken();
};
