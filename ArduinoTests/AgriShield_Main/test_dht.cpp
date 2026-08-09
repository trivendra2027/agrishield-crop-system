// ==========================================
// DEPRECATED: DHT11 has been replaced by AHT20 + BMP280 (I2C)
// This file is kept for backward compatibility only.
// Use test_aht_bmp.cpp instead.
// ==========================================
#include <Arduino.h>
#include "Logger.h"

// Forward declaration of new test
extern void run_test_aht_bmp();

void run_test_dht() {
    Logger::warning("DHT11 test is DEPRECATED. Running AHT20 + BMP280 test instead.");
    run_test_aht_bmp();
}
