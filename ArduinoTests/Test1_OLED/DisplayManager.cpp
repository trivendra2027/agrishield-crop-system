#include "DisplayManager.h"
#include "GraphicsManager.h"
#include "WidgetManager.h"
#include "SystemData.h"
#include <Adafruit_SSD1306.h> 

static unsigned long lastRotationTime = 0;
static unsigned long lastDrawTime = 0;
static const unsigned long ROTATION_INTERVAL = 5000;
static const unsigned long FRAME_INTERVAL = 100;

bool DisplayManager::init() {
    SystemData::init();
    if(!GraphicsManager::init()) {
        Serial.println("OLED init failed");
        return false;
    }
    lastRotationTime = millis();
    return true;
}

void DisplayManager::handleAutoRotation() {
    if (millis() - lastRotationTime >= ROTATION_INTERVAL) {
        lastRotationTime = millis();
        SD_System sys = SystemData::getSystem();
        sys.activePage++;
        if (sys.activePage > 6) sys.activePage = 2; // Skip boot
        SystemData::setSystem(sys);
    }
}

void DisplayManager::drawProfessionalTheme(int page) {
    GraphicsManager::clear();
    
    if (page != 1) {
        WidgetManager::drawHeader();
        WidgetManager::drawFooter(); // Simplified countdown rendering
    }
    
    GraphicsManager::setTextColor(WHITE);
    
    switch (page) {
        case 1: showBoot(); break;
        case 2: showDashboard(); break;
        case 3: showNetwork(); break;
        case 4: showStorage(); break;
        case 5: showDiagnostics(); break;
        case 6: showDeviceInfo(); break;
    }
    
    GraphicsManager::update();
}

void DisplayManager::update() {
    if (millis() - lastDrawTime >= FRAME_INTERVAL) {
        lastDrawTime = millis();
        SD_System sys = SystemData::getSystem();
        if (sys.activePage != 1) {
            handleAutoRotation();
            sys = SystemData::getSystem();
        }
        unsigned long renderStart = micros();
        drawProfessionalTheme(sys.activePage);
        unsigned long renderEnd = micros();
        // Logger::debug("Frame Rendering Time: " + String(renderEnd - renderStart) + " us"); // Disabled to avoid serial flood
    }
}

void DisplayManager::showBoot() {
    SD_DeviceInfo dev = SystemData::getDeviceInfo();
    GraphicsManager::setTextSize(2);
    WidgetManager::drawValueField(10, 20, "Agri", "Shield");
    GraphicsManager::setTextSize(1);
    WidgetManager::drawValueField(20, 40, "FW", String(dev.firmwareVersion));
    
    int dots = (millis() / 500) % 4;
    String dotStr = "";
    for(int i=0; i<dots; i++) dotStr += ".";
    GraphicsManager::setCursor(70, 40);
    GraphicsManager::print(dotStr);
    
    if (millis() > 3000) {
        SD_System sys = SystemData::getSystem();
        sys.activePage = 2;
        SystemData::setSystem(sys);
        lastRotationTime = millis();
    }
}

void DisplayManager::showDashboard() {
    SD_Sensors sens = SystemData::getSensors();
    GraphicsManager::setTextSize(1);
    
    String tempStr = sens.temperatureValid ? String(sens.temperature, 1) + "C" : "--";
    String humStr = sens.humidityValid ? String(sens.humidity, 1) + "%" : "--";
    String lightStr = sens.lightValid ? String(sens.lightIntensity, 0) + "lx" : "--";
    String soilStr = sens.soilValid ? String(sens.soilMoisture, 1) + "%" : "--";
    String rainStr = sens.rainValid ? (sens.rainDetected ? "YES" : "NO") : "--";
    
    // Column 1 (x=2)
    WidgetManager::drawSensorCard(2, 14, "T", tempStr);
    WidgetManager::drawSensorCard(2, 24, "Sun", lightStr);
    WidgetManager::drawStatusCard(2, 34, "Rain", rainStr);
    
    // Column 2 (x=64)
    WidgetManager::drawSensorCard(64, 14, "H", humStr);
    WidgetManager::drawSensorCard(64, 24, "Soil", soilStr);
}

void DisplayManager::showNetwork() {
    SD_Network net = SystemData::getNetwork();
    WidgetManager::drawValueField(2, 14, "SSID", String(net.ssid));
    WidgetManager::drawValueField(2, 24, "IP", String(net.ipAddress));
    WidgetManager::drawValueField(2, 34, "Signal", String(net.rssi) + "dBm (" + String(net.wifiQuality) + "%)");
    WidgetManager::drawValueField(2, 44, "Sync", net.ntpSynced ? "OK" : "NO");
}

void DisplayManager::showStorage() {
    SD_Storage stor = SystemData::getStorage();
    WidgetManager::drawValueField(2, 14, "SD", stor.sdHealthy ? "OK" : "ERROR");
    WidgetManager::drawValueField(64, 14, "Queue", String(stor.pendingRecords));
    WidgetManager::drawValueField(2, 24, "Free", String(stor.freeSpaceMB) + " MB");
    WidgetManager::drawValueField(2, 34, "File", String(stor.currentLogFile).substring(0, 16));
    
    float pct = 0.0f;
    if (stor.totalSpaceMB > 0) pct = ((float)stor.usedSpaceMB / stor.totalSpaceMB) * 100.0f;
    WidgetManager::drawProgressBar(2, 44, 124, 8, pct);
}

void DisplayManager::showDiagnostics() {
    SD_DeviceInfo dev = SystemData::getDeviceInfo();
    SD_System sys = SystemData::getSystem();
    WidgetManager::drawValueField(2, 14, "Heap", String(ESP.getFreeHeap()) + " B");
    WidgetManager::drawValueField(2, 24, "MaxBlk", String(ESP.getMaxAllocHeap()) + " B");
    WidgetManager::drawValueField(2, 34, "Rst", String(dev.restartReason));
}

void DisplayManager::showDeviceInfo() {
    SD_DeviceInfo dev = SystemData::getDeviceInfo();
    WidgetManager::drawValueField(2, 14, "ID", String(dev.deviceId));
    WidgetManager::drawValueField(2, 24, "HW", String(dev.hardwareVersion));
    WidgetManager::drawValueField(2, 34, "FW", String(dev.firmwareVersion));
    WidgetManager::drawValueField(2, 44, "Up", String(dev.uptimeSeconds) + "s");
}
