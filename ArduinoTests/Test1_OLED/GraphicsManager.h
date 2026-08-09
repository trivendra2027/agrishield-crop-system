#pragma once
#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>

#ifndef WHITE
#define WHITE SH110X_WHITE
#endif

#ifndef BLACK
#define BLACK SH110X_BLACK
#endif

class GraphicsManager {
public:
    static bool init();
    static void clear();
    static void update();
    
    // Primitives
    static void drawLine(int x0, int y0, int x1, int y1, uint16_t color);
    static void fillRect(int x, int y, int w, int h, uint16_t color);
    static void drawRect(int x, int y, int w, int h, uint16_t color);
    
    // Text
    static void setCursor(int x, int y);
    static void setTextColor(uint16_t color, uint16_t bg = 0xFFFF);
    static void setTextSize(int size);
    static void print(String text);
    static void printf(const char* format, ...);
    
    // Bitmaps
    static void drawBitmap(int x, int y, const uint8_t *bitmap, int w, int h, uint16_t color);
    
    // Future Graph Reservation
    static void drawTrendGraphBox(int x, int y, int w, int h);
};
