#pragma once
// Global Debug Mode
#define DEBUG_MODE 1 // 0=OFF, 1=INFO, 2=VERBOSE

// Multi-WiFi Configuration Struct
struct KnownWiFi {
    const char* ssid;
    const char* password;
    const char* api_url;
};

// Add all your Wi-Fi networks here and the laptop's IP address on that specific network!
const KnownWiFi KNOWN_WIFI_NETWORKS[] = {
    {"vivot4pro", "12345678900", "http://10.65.76.146:8000/api/v1"},    // Network 1 (Mobile Phone Hotspot)
    {"unknown", "reddygariabbayi", "http://10.65.76.146:8000/api/v1"},  // Network 2 (Laptop's Windows Hotspot)
    {"", "", ""}                                                         // Network 3 (Farm Backup)
};

const int KNOWN_WIFI_COUNT = sizeof(KNOWN_WIFI_NETWORKS) / sizeof(KNOWN_WIFI_NETWORKS[0]);

// Legacy single Wi-Fi fallbacks
#define WIFI_SSID KNOWN_WIFI_NETWORKS[0].ssid
#define WIFI_PASS KNOWN_WIFI_NETWORKS[0].password

// Legacy API URL (Required so ApiManager.cpp compiles without errors in the Arduino IDE)
#define API_BASE_URL "http://127.0.0.1:8000/api/v1"

#define DEVICE_ID "ESP32-NODE-ALPHA"

// Display Language ("EN" = English, "HI" = Hindi, "TE" = Telugu, "TA" = Tamil)
#define DISPLAY_LANGUAGE "EN"

// Test Selector (Phase 1)
#define RUN_TEST_MODE 0 // 0=Production, 1=OLED, 2=DHT, 3=BH1750
