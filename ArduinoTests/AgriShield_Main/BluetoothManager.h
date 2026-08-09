#pragma once
#include <Arduino.h>
#include "BluetoothSerial.h"

class BluetoothManager {
private:
    static BluetoothSerial SerialBT;
    static bool initialized;

public:
    static void init(const String& deviceName = "AgriShield-ESP32-BT");
    static void sendTelemetry(const String& payload);
    static void handleCommands();
    static bool isConnected();
};
