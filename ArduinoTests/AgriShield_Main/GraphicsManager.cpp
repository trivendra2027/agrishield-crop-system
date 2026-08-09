#include "GraphicsManager.h"
#include <Adafruit_SH110X.h>

#ifndef WHITE
#define WHITE SH110X_WHITE
#endif

#ifndef BLACK
#define BLACK SH110X_BLACK
#endif

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define OLED_ADDR 0x3C

// Support for 1.3" SH1106G OLED Display
static Adafruit_SH1106G display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

bool GraphicsManager::init() {
    Wire.begin();
    // Initialize 1.3" SH1106G Display at Address 0x3C
    if(!display.begin(OLED_ADDR, true)) {
        return false;
    }
    display.setTextWrap(false);
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
}

void GraphicsManager::printf(const char* format, ...) {
    char buffer[64];
    va_list args;
    va_start(args, format);
    vsnprintf(buffer, sizeof(buffer), format, args);
    va_end(args);
    display.print(buffer);
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
