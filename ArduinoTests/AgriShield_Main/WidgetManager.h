#pragma once
#include <Arduino.h>

class WidgetManager {
public:
    static void drawHeader();
    static void drawFooter();
    static void drawSensorCard(int x, int y, String label, String value);
    static void drawStatusCard(int x, int y, String label, String status);
    static void drawProgressBar(int x, int y, int w, int h, float percentage);
    static void drawValueField(int x, int y, String key, String value);
    static void drawIconLabel(int x, int y, const uint8_t *icon, String label);
    static void drawNotificationBanner(String message);
};
