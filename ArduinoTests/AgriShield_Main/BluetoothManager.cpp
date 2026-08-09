#include "BluetoothManager.h"
#include "TimeManager.h"
#include "Logger.h"
#include "SystemData.h"

BluetoothSerial BluetoothManager::SerialBT;
bool BluetoothManager::initialized = false;

// Bluetooth SPP Event Callback
void btCallback(esp_spp_cb_event_t event, esp_spp_cb_param_t *param) {
    SD_Network net = SystemData::getNetwork();
    if (event == ESP_SPP_SRV_OPEN_EVT) {
        Logger::info("🔵 Bluetooth Client Connected Successfully!");
        net.bleConnected = true;
        SystemData::setNetwork(net);
    } else if (event == ESP_SPP_CLOSE_EVT) {
        Logger::info("⚪ Bluetooth Client Disconnected.");
        net.bleConnected = false;
        SystemData::setNetwork(net);
    }
}

void BluetoothManager::init(const String& deviceName) {
    if (initialized) return;
    
    #if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
        Logger::error("Bluetooth is not enabled in SDK configuration!");
        return;
    #endif

    // Register callback before begin
    SerialBT.register_callback(btCallback);

    if (!SerialBT.begin(deviceName)) {
        Logger::error("CRITICAL: Failed to initialize ESP32 Bluetooth Serial!");
        return;
    }

    initialized = true;
    Logger::info("Bluetooth Serial (SPP) Enabled!");
    Logger::info("ESP32 Device Name: " + deviceName);
    Logger::info("Pairing Code (if requested): 1234 or 0000");
}

void BluetoothManager::sendTelemetry(const String& payload) {
    if (!initialized) return;
    
    if (SerialBT.hasClient()) {
        SerialBT.println(payload);
        Logger::info("Telemetry data sent via Bluetooth Serial.");
    }
}

void BluetoothManager::handleCommands() {
    if (!initialized) return;
    
    bool connected = SerialBT.hasClient();
    SD_Network net = SystemData::getNetwork();
    if (net.bleConnected != connected) {
        net.bleConnected = connected;
        SystemData::setNetwork(net);
    }
    
    if (SerialBT.available()) {
        String input = SerialBT.readStringUntil('\n');
        input.trim();
        if (input.length() > 0) {
            if (input.equalsIgnoreCase("PING")) {
                SerialBT.println("{\"status\":\"PONG\", \"device\":\"AgriShield-ESP32\"}");
            } else if (input.equalsIgnoreCase("STATUS")) {
                SerialBT.println("{\"bluetooth\":\"online\", \"system\":\"nominal\"}");
            } else if (input.startsWith("TIME:")) {
                String timeVal = input.substring(5);
                timeVal.trim();
                TimeManager::setCustomTimeString(timeVal);
                SerialBT.println("{\"status\":\"TIME_UPDATED\", \"time\":\"" + timeVal + "\"}");
            } else if (input.indexOf(':') > 0) { // e.g. "06:46 PM" or "18:46"
                TimeManager::setCustomTimeString(input);
                SerialBT.println("{\"status\":\"TIME_UPDATED\", \"time\":\"" + input + "\"}");
            } else {
                SerialBT.println("{\"received\":\"" + input + "\"}");
            }
        }
    }
}

bool BluetoothManager::isConnected() {
    return initialized && SerialBT.hasClient();
}
