#include "WidgetManager.h"
#include "GraphicsManager.h"
#include "SystemData.h"
#include "Icons.h"
#include "TimeManager.h"
#include "LanguageManager.h"
#include "IconsTelugu.h"
#include <Adafruit_SSD1306.h>

void WidgetManager::drawHeader() {
    SD_Network net = SystemData::getNetwork();
    SD_Sensors sens = SystemData::getSensors();

    GraphicsManager::fillRect(0, 0, 128, 10, WHITE);
    GraphicsManager::setTextColor(BLACK, WHITE);
    
    // Left: 12-hour AM/PM Clock (e.g. "05:41 PM")
    String timeStr = TimeManager::getFormattedTime();
    if (timeStr == "--:--" && net.currentTime[0] != '\0') {
        timeStr = String(net.currentTime);
    }
    GraphicsManager::setCursor(1, 1);
    GraphicsManager::print(timeStr);

    // Right: Wi-Fi Icon + Battery Icon & Percentage (%)
    String battStr = String((int)sens.batteryPercentage) + "%";
    int battTextX = 128 - (battStr.length() * 6);
    GraphicsManager::setCursor(battTextX, 1);
    GraphicsManager::print(battStr);

    const uint8_t* bIcon = icon_batt_0;
    if (sens.batteryPercentage >= 85) bIcon = icon_batt_100;
    else if (sens.batteryPercentage >= 60) bIcon = icon_batt_75;
    else if (sens.batteryPercentage >= 35) bIcon = icon_batt_50;
    else if (sens.batteryPercentage >= 15) bIcon = icon_batt_25;
    if (sens.batteryCharging && ((millis() / 500) % 2 == 0)) bIcon = icon_charging;

    int bIconX = battTextX - 9;
    GraphicsManager::drawBitmap(bIconX, 1, bIcon, 8, 8, BLACK);

    int wIconX = bIconX - 9;
    if (net.wifiConnected || ((millis() / 500) % 2 == 0)) {
        GraphicsManager::drawBitmap(wIconX, 1, net.wifiConnected ? icon_wifi_on : icon_wifi_off, 8, 8, BLACK);
    }

    int btIconX = wIconX - 9;
    GraphicsManager::drawBitmap(btIconX, 1, net.bleConnected ? icon_bt_on : icon_bt_off, 8, 8, BLACK);

    GraphicsManager::setTextColor(WHITE, BLACK);
}

void WidgetManager::drawFooter() {
    // Footer removed per user request for clean 100% full screen layout
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
    if (LanguageManager::getLanguage() == DisplayLang::TE) {
        TeluguWord word = TeluguGraphics::getTeluguLabel(key);
        if (word.bitmap != nullptr) {
            // Draw Telugu text bitmap (height 12) aligned with baseline
            GraphicsManager::drawBitmap(x, y - 2, word.bitmap, word.width, word.height, WHITE);
            GraphicsManager::setCursor(x + word.width + 1, y);
            GraphicsManager::print(": " + value);
            return;
        }
    }
    
    GraphicsManager::setCursor(x, y);
    String label = LanguageManager::getText(key);
    String line = label + ": " + value;
    if (line.length() > 21) {
        line = line.substring(0, 21);
    }
    GraphicsManager::print(line);
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
