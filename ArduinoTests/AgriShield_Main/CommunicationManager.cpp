#include "CommunicationManager.h"
#include "PreferencesManager.h"
#include "SystemData.h"
#include "Logger.h"
#include "StorageManager.h"
#include "ApiManager.h"
#include "BluetoothManager.h"
#include "ErrorManager.h"
#include "ErrorCodes.h"

static CommProtocol currentProtocol = CommProtocol::HTTP;

void CommunicationManager::init(CommProtocol protocol) {
    PreferencesManager::init();
    currentProtocol = protocol;
    BluetoothManager::init("AgriShield-ESP32-BT");
    Logger::info("CommunicationManager Initialized (Protocol & Bluetooth Enabled).");
}

static bool _performHealthCheck() {
    Logger::debug("Pinging Backend Health...");
    unsigned long start = millis();
    bool isOnline = ApiManager::checkHealth();
    if (isOnline) { ApiManager::registerDevice(); }
    unsigned long latency = millis() - start;
    
    SD_Network net = SystemData::getNetwork();
    net.backendOnline = isOnline;
    net.backendLatency = latency;
    if (!isOnline) {
        ErrorManager::throwError(E704);
    }
    SystemData::setNetwork(net);
    
    return isOnline;
}

bool CommunicationManager::sendTelemetry(String payload) {
    // Broadcast telemetry to connected Bluetooth devices
    BluetoothManager::sendTelemetry(payload);

    SD_Network net = SystemData::getNetwork();
    
    if (!net.wifiConnected) {
        Logger::warning("WiFi Offline. Routing telemetry to Offline Storage Queue.");
        return StorageManager::enqueueRecord(payload);
    }
    
    if (!_performHealthCheck()) {
        Logger::warning("Backend Offline. Routing telemetry to Offline Storage Queue.");
        return StorageManager::enqueueRecord(payload);
    }
    
    // Backend is ONLINE and reachable
    // 1. Unload FIFO Queue from StorageManager if any pending
    SD_Storage stor = SystemData::getStorage();
    if (stor.pendingRecords > 0) {
        Logger::info("Backend Reconnected! Unloading FIFO Queue...");
        String queuedJson = StorageManager::dequeueRecord();
        if (ApiManager::postTelemetry(queuedJson)) { // Assume ApiManager::postTelemetry takes String
            StorageManager::confirmUpload();
        }
    }
    
    // 2. Send current live telemetry
    bool success = ApiManager::postTelemetry(payload);
    if (success) {
        net = SystemData::getNetwork();
        net.lastSyncTime = millis();
        SystemData::setNetwork(net);
    }
    return success;
}

bool CommunicationManager::sendHeartbeat(String payload) {
    return false; // Stub
}

void CommunicationManager::setupMQTT() {}
void CommunicationManager::setupBLE() {}
