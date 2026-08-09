#include "DisplayManager.h"
#include "GraphicsManager.h"
#include "WidgetManager.h"
#include "SystemData.h"
#include "LanguageManager.h"
#include "IconsTelugu.h"
#include "Config.h"
#include <Adafruit_SSD1306.h> 

static unsigned long lastRotationTime = 0;
static unsigned long lastDrawTime = 0;
static const unsigned long ROTATION_INTERVAL = 3000; // 3-second refresh per page
static const unsigned long FRAME_INTERVAL = 100;

void DisplayManager::showBootSplash() {
    for (int i = 0; i <= 100; i += 20) {
        GraphicsManager::clear();
        GraphicsManager::setTextColor(WHITE);
        GraphicsManager::setTextSize(2);
        GraphicsManager::setCursor(8, 6);
        GraphicsManager::print("AgriShield");
        
        GraphicsManager::setTextSize(1);
        GraphicsManager::setCursor(16, 26);
        GraphicsManager::print("ESP32 Smart Node");
        
        // Render Loading Bar Outline & Fill
        GraphicsManager::drawRect(14, 42, 100, 10, WHITE);
        int fillWidth = map(i, 0, 100, 0, 96);
        GraphicsManager::fillRect(16, 44, fillWidth, 6, WHITE);
        
        GraphicsManager::update();
        delay(120);
    }
}

bool DisplayManager::init() {
    SystemData::init();
    LanguageManager::setLanguageByCode(DISPLAY_LANGUAGE);
    bool success = true;
    if(!GraphicsManager::init()) {
        Serial.println("OLED init failed");
        success = false;
    } else {
        showBootSplash(); // Render animated AgriShield loading bar on OLED boot
    }
    lastRotationTime = millis();
    return success;
}

void DisplayManager::handleAutoRotation() {
    // Auto-rotation disabled: Page switching is controlled exclusively via Push Button (GPIO 25)
}

void DisplayManager::drawProfessionalTheme(int page) {
    GraphicsManager::clear();
    
    // Always render the top header status bar (12-hr Time, WiFi, BT, Batt %)
    WidgetManager::drawHeader();
    
    GraphicsManager::setTextColor(WHITE);
    
    int activeP = page;
    if (activeP < 1 || activeP > 5) activeP = 1;
    
    switch (activeP) {
        case 1: showDashboard(); break;       // Page 1: Climate & Light (Temp, Hum, Lux)
        case 2: showEnvSensors2(); break;     // Page 2: Soil, Rain, Pressure
        case 3: showBatteryDetails(); break;  // Page 3: Battery Voltage & Power
        case 4: showNetwork(); break;         // Page 4: Connectivity (WiFi Name, WiFi, BT)
        case 5: showStorage(); break;         // Page 5: Storage (SD Mounted, Free Space, Queue)
    }
    
    GraphicsManager::update();
}

void DisplayManager::update() {
    if (millis() - lastDrawTime >= FRAME_INTERVAL) {
        lastDrawTime = millis();
        SD_System sys = SystemData::getSystem();
        drawProfessionalTheme(sys.activePage);
    }
}

// ==========================================
// PAGE 1: CLIMATE & LIGHT (Temp, Hum, Light)
// ==========================================
void DisplayManager::showDashboard() {
    SD_Sensors sens = SystemData::getSensors();
    GraphicsManager::setTextSize(1);
    
    String tempStr = sens.temperatureValid ? String(sens.temperature, 1) + " C" : "--";
    String humStr = sens.humidityValid ? String(sens.humidity, 1) + " %" : "--";
    String lightStr = sens.lightValid ? String(sens.lightIntensity, 0) + " Lux" : "--";

    WidgetManager::drawValueField(4, 18, "Temp    ", tempStr);
    WidgetManager::drawValueField(4, 33, "Humidity", humStr);
    WidgetManager::drawValueField(4, 48, "Light   ", lightStr);
}

// ==========================================
// PAGE 2: SOIL & WEATHER (Soil, Rain, Pressure)
// ==========================================
void DisplayManager::showEnvSensors2() {
    SD_Sensors sens = SystemData::getSensors();
    GraphicsManager::setTextSize(1);
    
    String soilStr = sens.soilValid ? String(sens.soilMoisture, 1) + " %" : "--";
    String rainStr = sens.rainValid ? (sens.rainDetected ? "Rain Detected" : "No Rain") : "--";
    String pressStr = sens.pressureValid ? String(sens.pressure, 0) + " hPa" : "--";

    WidgetManager::drawValueField(4, 18, "Soil    ", soilStr);
    WidgetManager::drawValueField(4, 33, "Rain    ", rainStr);
    WidgetManager::drawValueField(4, 48, "Pressure", pressStr);
}

// ==========================================
// PAGE 3: BATTERY & POWER (Normal Charging)
// ==========================================
void DisplayManager::showBatteryDetails() {
    SD_Sensors sens = SystemData::getSensors();
    GraphicsManager::setTextSize(1);
    
    String voltStr = sens.batteryValid ? String(sens.batteryVoltage, 2) + " V" : "--";
    String pctStr = sens.batteryValid ? String((int)sens.batteryPercentage) + " %" : "--";
    String statusStr = sens.batteryValid ? (sens.batteryCharging ? "Charging (USB)" : "Discharging") : "Discharging";

    WidgetManager::drawValueField(4, 18, "Volt    ", voltStr);
    WidgetManager::drawValueField(4, 33, "Level   ", pctStr);
    WidgetManager::drawValueField(4, 48, "Charge  ", statusStr);
}

// ==========================================
// PAGE 4: CONNECTIVITY & NETWORK
// ==========================================
void DisplayManager::showNetwork() {
    SD_Network net = SystemData::getNetwork();
    GraphicsManager::setTextSize(1);
    String ssidStr = String(net.ssid);
    if (ssidStr.length() > 12) ssidStr = ssidStr.substring(0, 12);
    
    WidgetManager::drawValueField(4, 18, "WiFi Name", ssidStr);
    WidgetManager::drawValueField(4, 33, "WiFi    ", net.wifiConnected ? "Connected" : "Disconnected");
    WidgetManager::drawValueField(4, 48, "Bluetooth", net.bleConnected ? "Connected" : "Not Connected");
}

// ==========================================
// PAGE 5: STORAGE & SD CARD
// ==========================================
void DisplayManager::showStorage() {
    SD_Storage stor = SystemData::getStorage();
    GraphicsManager::setTextSize(1);
    WidgetManager::drawValueField(4, 15, "SD    ", stor.sdMounted ? "MOUNTED" : "NO CARD");
    WidgetManager::drawValueField(4, 27, "Queue ", String(stor.pendingRecords) + " items");
    WidgetManager::drawValueField(4, 39, "Free  ", String(stor.freeSpaceMB) + " MB");
    WidgetManager::drawValueField(4, 51, "File  ", String(stor.currentLogFile).substring(0, 11));
}

// ==========================================
// PAGE 6: SYSTEM DIAGNOSTICS
// ==========================================
void DisplayManager::showDiagnostics() {
    SD_DeviceInfo dev = SystemData::getDeviceInfo();
    GraphicsManager::setTextSize(1);
    uint32_t freeHeapKb = ESP.getFreeHeap() / 1024;
    uint32_t maxBlkKb = ESP.getMaxAllocHeap() / 1024;
    WidgetManager::drawValueField(4, 15, "Heap  ", String(freeHeapKb) + " KB");
    WidgetManager::drawValueField(4, 27, "MaxBlk", String(maxBlkKb) + " KB");
    WidgetManager::drawValueField(4, 39, "CPU   ", String(ESP.getCpuFreqMHz()) + " MHz");
    WidgetManager::drawValueField(4, 51, "Reset ", String(dev.restartReason).substring(0, 11));
}

// ==========================================
// PAGE 7: DEVICE INFORMATION
// ==========================================
void DisplayManager::showDeviceInfo() {
    SD_DeviceInfo dev = SystemData::getDeviceInfo();
    GraphicsManager::setTextSize(1);
    
    uint32_t sec = dev.uptimeSeconds;
    uint32_t days = sec / 86400;
    uint32_t hours = (sec % 86400) / 3600;
    uint32_t mins = (sec % 3600) / 60;
    String upStr = String(days) + "d " + String(hours) + "h " + String(mins) + "m";
    
    WidgetManager::drawValueField(4, 15, "Node  ", String(dev.deviceId).substring(0, 11));
    WidgetManager::drawValueField(4, 27, "HW    ", String(dev.hardwareVersion).substring(0, 11));
    WidgetManager::drawValueField(4, 39, "FW    ", String(dev.firmwareVersion));
    WidgetManager::drawValueField(4, 51, "Uptime", upStr);
}
