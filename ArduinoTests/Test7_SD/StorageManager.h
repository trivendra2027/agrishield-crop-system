#pragma once
#include <Arduino.h>
#include <SD.h>
#include <SPI.h>

class StorageManager {
public:
    static void init();
    static bool enqueueRecord(String jsonRecord);
    static String dequeueRecord();
    static bool confirmUpload();
    static bool runDiagnosticsTest();
    
    // Expose folder generation
    static void ensureDailyFolder();

    // Reserved Hooks
    static void enableCompression();
    static void enableEncryption();
    static void forceLogRotation();
    static void exportToUSB();
};
