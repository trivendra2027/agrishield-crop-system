#pragma once
#include "MemoryManager.h"

class SensorManager {
public:
    static void init();
    static float readTemperature();
    static float readHumidity();
    static float readPressure();
    static float readLight();
    static float readSoil();
    static int readRain();
    static float readBattery();
    
    // Future Slots
    static float readWind() { return 0.0; }
    static float readGPS() { return 0.0; }
    static float readNPK() { return 0.0; }
    static float readPH() { return 0.0; }
};
