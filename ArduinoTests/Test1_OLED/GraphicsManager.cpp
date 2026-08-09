#include "GraphicsManager.h"

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define OLED_ADDR 0x3C

static Adafruit_SH1106G display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

bool GraphicsManager::init() {
    Wire.begin();
    if(!display.begin(OLED_ADDR, true)) {
        return false;
    }
    display.clearDisplay();
    display.display();
    return true;
}

void GraphicsManager::clear() {
    display.clearDisplay();
}

void GraphicsManager::update() {
    display.display();
}

void GraphicsManager::drawLine(int x0, int y0, int x1, int y1, uint16_t color) {
    display.drawLine(x0, y0, x1, y1, color);
}

void GraphicsManager::fillRect(int x, int y, int w, int h, uint16_t color) {
    display.fillRect(x, y, w, h, color);
}

void GraphicsManager::drawRect(int x, int y, int w, int h, uint16_t color) {
    display.drawRect(x, y, w, h, color);
}

void GraphicsManager::setCursor(int x, int y) {
    display.setCursor(x, y);
}

void GraphicsManager::setTextColor(uint16_t color, uint16_t bg) {
    if (bg == 0xFFFF) {
        display.setTextColor(color);
    } else {
        display.setTextColor(color, bg);
    }
}

void GraphicsManager::setTextSize(int size) {
    display.setTextSize(size);
}

void GraphicsManager::print(String text) {
    display.print(text);
    Serial.println("[OLED] " + text);
}

void GraphicsManager::printf(const char* format, ...) {
    char buffer[64];
    va_list args;
    va_start(args, format);
    vsnprintf(buffer, sizeof(buffer), format, args);
    va_end(args);
    display.print(buffer);
    Serial.println("[OLED] " + String(buffer));
}

void GraphicsManager::drawBitmap(int x, int y, const uint8_t *bitmap, int w, int h, uint16_t color) {
    display.drawBitmap(x, y, bitmap, w, h, color);
}

void GraphicsManager::drawTrendGraphBox(int x, int y, int w, int h) {
    // Placeholder for future graph logic
    display.drawRect(x, y, w, h, WHITE);
    display.setCursor(x + 2, y + 2);
    display.print("Graph");
}
