#include "WidgetManager.h"
#include "GraphicsManager.h"
#include "SystemData.h"
#include "Icons.h"
#include <Adafruit_SSD1306.h>

void WidgetManager::drawHeader() {
    SD_Network net = SystemData::getNetwork();
    SD_Sensors sens = SystemData::getSensors();
    SD_Storage stor = SystemData::getStorage();

    GraphicsManager::fillRect(0, 0, 128, 10, WHITE);
    GraphicsManager::setTextColor(BLACK, WHITE);
    
    
    const uint8_t* bIcon = icon_batt_0;
    if (sens.batteryPercentage >= 85) bIcon = icon_batt_100;
    else if (sens.batteryPercentage >= 60) bIcon = icon_batt_75;
    else if (sens.batteryPercentage >= 35) bIcon = icon_batt_50;
    else if (sens.batteryPercentage >= 15) bIcon = icon_batt_25;
    
    if (sens.batteryCharging && ((millis() / 500) % 2 == 0)) {
        bIcon = icon_charging; // Blink charging
    }
    GraphicsManager::drawBitmap(128 - 10, 1, bIcon, 8, 8, BLACK);

    
    bool showWifi = net.wifiConnected || ((millis() / 500) % 2 == 0); 
    if (showWifi) {
        GraphicsManager::drawBitmap(128 - 20, 1, net.wifiConnected ? icon_wifi_on : icon_wifi_off, 8, 8, BLACK);
    }
    
    GraphicsManager::drawBitmap(128 - 30, 1, net.backendOnline ? icon_backend_ok : icon_backend_err, 8, 8, BLACK);
    GraphicsManager::drawBitmap(128 - 40, 1, stor.sdMounted ? icon_sd_ok : icon_sd_err, 8, 8, BLACK);
    
    GraphicsManager::setCursor(2, 1);
    GraphicsManager::print(String(net.currentTime));
    GraphicsManager::setTextColor(WHITE, BLACK);
}

void WidgetManager::drawFooter() {
    SD_System sys = SystemData::getSystem();
    
    GraphicsManager::drawLine(0, 64 - 10, 128, 64 - 10, WHITE);
    GraphicsManager::setCursor(2, 64 - 8);
    GraphicsManager::printf("Pg %d/%d", sys.activePage, 6);
    
    GraphicsManager::setCursor(128 - 40, 64 - 8);
    GraphicsManager::printf("Next:-"); // Countdown managed elsewhere or added to sys
}

void WidgetManager::drawSensorCard(int x, int y, String label, String value) {
    GraphicsManager::setCursor(x, y);
    GraphicsManager::print(label + ": " + value);
}

void WidgetManager::drawStatusCard(int x, int y, String label, String status) {
    GraphicsManager::setCursor(x, y);
    GraphicsManager::print(label + ": " + status);
}

void WidgetManager::drawProgressBar(int x, int y, int w, int h, float percentage) {
    GraphicsManager::drawRect(x, y, w, h, WHITE);
    int fillW = (w - 2) * (percentage / 100.0);
    GraphicsManager::fillRect(x + 1, y + 1, fillW, h - 2, WHITE);
}

void WidgetManager::drawValueField(int x, int y, String key, String value) {
    GraphicsManager::setCursor(x, y);
    GraphicsManager::print(key + ": " + value);
}

void WidgetManager::drawIconLabel(int x, int y, const uint8_t *icon, String label) {
    GraphicsManager::drawBitmap(x, y, icon, 8, 8, WHITE);
    GraphicsManager::setCursor(x + 10, y);
    GraphicsManager::print(label);
}

void WidgetManager::drawNotificationBanner(String message) {
    GraphicsManager::fillRect(0, 12, 128, 12, WHITE);
    GraphicsManager::setTextColor(BLACK, WHITE);
    GraphicsManager::setCursor(2, 14);
    GraphicsManager::print(message);
    GraphicsManager::setTextColor(WHITE, BLACK);
}
