#pragma once
#include <Arduino.h>
#include <pgmspace.h>

struct TeluguWord {
    const unsigned char* bitmap;
    uint8_t width;
    uint8_t height;
};

class TeluguGraphics {
public:
    static TeluguWord getTeluguLabel(String key);
};

extern const unsigned char telugu_temp[] PROGMEM;
extern const unsigned char telugu_hum[] PROGMEM;
extern const unsigned char telugu_light[] PROGMEM;
extern const unsigned char telugu_soil[] PROGMEM;
extern const unsigned char telugu_rain[] PROGMEM;
extern const unsigned char telugu_pressure[] PROGMEM;
extern const unsigned char telugu_voltage[] PROGMEM;
extern const unsigned char telugu_charge[] PROGMEM;
extern const unsigned char telugu_status[] PROGMEM;
extern const unsigned char telugu_health[] PROGMEM;
extern const unsigned char telugu_connecting[] PROGMEM;
extern const unsigned char telugu_connected[] PROGMEM;
extern const unsigned char telugu_clear[] PROGMEM;
extern const unsigned char telugu_raining[] PROGMEM;
extern const unsigned char telugu_discharging[] PROGMEM;
extern const unsigned char telugu_charging[] PROGMEM;