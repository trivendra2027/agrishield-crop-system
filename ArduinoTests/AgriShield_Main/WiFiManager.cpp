#include "WiFiManager.h"
#include <WiFi.h>
#include "SystemData.h"
#include "Logger.h"
#include "ErrorManager.h"
#include "ErrorCodes.h"
#include "Config.h"
#include "TimeManager.h"
#include "DisplayManager.h"

static unsigned long lastReconnectAttempt = 0;
static unsigned long connectionStartTime = 0;
static int currentApIndex = 0;
static bool wasConnected = false;

// ESP32 Native Event Handlers (0ms Overhead, Fully Asynchronous)
void WiFiEvent_Connected(WiFiEvent_t event, WiFiEventInfo_t info) {
    Logger::info("🟢 Wi-Fi Hardware Link Connected!");
}

void WiFiEvent_GotIP(WiFiEvent_t event, WiFiEventInfo_t info) {
    connectionStartTime = millis();
    Logger::info("🌐 Wi-Fi IP Acquired: " + WiFi.localIP().toString());
    WiFiManager::updateSystemData();
    TimeManager::syncNTP();
}

void WiFiEvent_Disconnected(WiFiEvent_t event, WiFiEventInfo_t info) {
    if (wasConnected) {
        Logger::warning("⚪ Wi-Fi Disconnected! Switched to Instant Offline Mode (0ms overhead).");
    }
    wasConnected = false;
    WiFiManager::updateSystemData();
}

void WiFiManager::init() {
    Logger::info("Initializing WiFiManager (Asynchronous Native Event Mode)...");
    WiFi.mode(WIFI_STA);
    WiFi.setAutoReconnect(false); // Disable blocking auto-reconnect hardware loops that freeze CPU
    WiFi.setHostname("ESP32-AgriShield");

    // Register ESP32 Native Event Callbacks
    WiFi.onEvent(WiFiEvent_Connected, ARDUINO_EVENT_WIFI_STA_CONNECTED);
    WiFi.onEvent(WiFiEvent_GotIP, ARDUINO_EVENT_WIFI_STA_GOT_IP);
    WiFi.onEvent(WiFiEvent_Disconnected, ARDUINO_EVENT_WIFI_STA_DISCONNECTED);

    // Initial non-blocking connect trigger
    if (KNOWN_WIFI_COUNT > 0) {
        WiFi.begin(KNOWN_WIFI_NETWORKS[0].ssid, KNOWN_WIFI_NETWORKS[0].password);
    }
    
    updateSystemData();
    Logger::info("WiFi background manager initialized (Event-Driven Mode).");
}

void WiFiManager::connectToBestNetwork() {
    if (KNOWN_WIFI_COUNT > 0) {
        WiFi.begin(KNOWN_WIFI_NETWORKS[0].ssid, KNOWN_WIFI_NETWORKS[0].password);
    }
    updateSystemData();
}

void WiFiManager::handle() {
    bool nowConnected = (WiFi.status() == WL_CONNECTED);
    
    if (!nowConnected) {
        // When disconnected, flush stale BSSID cache and attempt background WiFi.begin() every 15 seconds
        if (millis() - lastReconnectAttempt > 15000) {
            lastReconnectAttempt = millis();
            if (KNOWN_WIFI_COUNT > 0) {
                currentApIndex = (currentApIndex + 1) % KNOWN_WIFI_COUNT;
                WiFi.disconnect(true, false); // Flush stale BSSID/channel cache
                delay(20);
                WiFi.begin(KNOWN_WIFI_NETWORKS[currentApIndex].ssid, KNOWN_WIFI_NETWORKS[currentApIndex].password);
            }
        }
    } else {
        wasConnected = true;
        static unsigned long lastRssiUpdate = 0;
        if (millis() - lastRssiUpdate > 5000) {
            lastRssiUpdate = millis();
            updateSystemData();
        }
    }
}

void WiFiManager::disconnect() {
    WiFi.disconnect(true, false);
    updateSystemData();
}

bool WiFiManager::isConnected() {
    return WiFi.status() == WL_CONNECTED;
}

uint8_t WiFiManager::calculateSignalQuality(int8_t rssi) {
    if (rssi <= -100) return 0;
    if (rssi >= -50) return 100;
    return 2 * (rssi + 100);
}

void WiFiManager::updateSystemData() {
    SD_Network net = SystemData::getNetwork();
    net.wifiConnected = (WiFi.status() == WL_CONNECTED);
    
    if (net.wifiConnected) {
        strncpy(net.ssid, WiFi.SSID().c_str(), sizeof(net.ssid)-1);
        strncpy(net.ipAddress, WiFi.localIP().toString().c_str(), sizeof(net.ipAddress)-1);
        strncpy(net.gateway, WiFi.gatewayIP().toString().c_str(), sizeof(net.gateway)-1);
        strncpy(net.dns, WiFi.dnsIP().toString().c_str(), sizeof(net.dns)-1);
        strncpy(net.macAddress, WiFi.macAddress().c_str(), sizeof(net.macAddress)-1);
        
        net.rssi = WiFi.RSSI();
        net.wifiQuality = calculateSignalQuality(net.rssi);
        net.connectionUptime = (millis() - connectionStartTime) / 1000;
    } else {
        net.ssid[0] = '\0';
        strncpy(net.ipAddress, "0.0.0.0", sizeof(net.ipAddress)-1);
        net.rssi = -100;
        net.wifiQuality = 0;
        net.connectionUptime = 0;
    }
    
    SystemData::setNetwork(net);
}

void WiFiManager::scanNetworks() {
    Logger::info("Scanning WiFi Networks...");
    int n = WiFi.scanNetworks();
    if (n == 0) {
        Logger::warning("No networks found.");
    } else {
        Logger::info(String(n) + " networks found.");
    }
}
