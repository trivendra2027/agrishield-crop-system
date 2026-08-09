#include "StorageManager.h"
#include "SystemData.h"
#include "Logger.h"
#include "ErrorManager.h"
#include "ErrorCodes.h"
#include "MemoryManager.h"

#define SD_CS_PIN 5

// Very simplified queue simulation tracking for Phase 1.
// In Phase 2, this will scan the actual SD directory.
static uint32_t simQueueCount = 0;

#include <SPI.h>

void StorageManager::init() {
    Logger::info("Initializing SD Card Subsystem (SPI: CS=5, SCK=18, MOSI=23, MISO=19)...");
    uint32_t heapBefore = MemoryManager::getFreeHeap();
    
    SD_Storage stor = SystemData::getStorage();
    
    // Explicitly initialize SPI Bus on GPIO 18 (SCK), GPIO 19 (MISO), GPIO 23 (MOSI), GPIO 5 (CS)
    SPI.begin(18, 19, 23, 5);
    
    // Try mounting SD Card at 4MHz for wire noise immunity, then 10MHz
    bool mounted = SD.begin(SD_CS_PIN, SPI, 4000000);
    if (!mounted) {
        mounted = SD.begin(SD_CS_PIN, SPI, 10000000);
    }
    
    if (!mounted) {
        Logger::error("SD Card Mount Failed! Check FAT32 Format & 5V Power.");
        ErrorManager::throwError(E601);
        stor.sdMounted = false;
        stor.sdHealthy = false;
        stor.storageValid = false;
        stor.totalSpaceMB = 0;
        stor.usedSpaceMB = 0;
        stor.freeSpaceMB = 0;
    } else {
        uint8_t cardType = SD.cardType();
        if (cardType == CARD_NONE) {
            Logger::error("No SD Card attached in slot!");
            stor.sdMounted = false;
            stor.sdHealthy = false;
            stor.storageValid = false;
        } else {
            Logger::info("SD Card Mounted Successfully!");
            stor.sdMounted = true;
            stor.sdHealthy = true;
            stor.storageValid = true;
            
            uint64_t totalBytes = SD.totalBytes();
            uint64_t usedBytes = SD.usedBytes();
            
            stor.totalSpaceMB = (uint32_t)(totalBytes / (1024 * 1024));
            stor.usedSpaceMB = (uint32_t)(usedBytes / (1024 * 1024));
            stor.freeSpaceMB = stor.totalSpaceMB - stor.usedSpaceMB;
            
            Logger::info("SD Size: " + String(stor.totalSpaceMB) + "MB | Free: " + String(stor.freeSpaceMB) + "MB");
        }
    }
    
    SystemData::setStorage(stor);
    uint32_t heapAfter = MemoryManager::getFreeHeap();
    Logger::debug("SD Init Memory Delta: " + String(heapBefore - heapAfter) + " B");
}

void StorageManager::ensureDailyFolder() {
    // Uses dummy date for this Phase 1 implementation. TimeManager handles real dates later.
    String folderPath = "/logs/2026/07/12";
    if (!SD.exists(folderPath)) {
        SD.mkdir(folderPath);
        Logger::info("Created Daily Folder: " + folderPath);
    }
    
    SD_Storage stor = SystemData::getStorage();
    String filePath = folderPath + "/telemetry.jsonl";
    strncpy(stor.currentLogFile, filePath.c_str(), sizeof(stor.currentLogFile)-1);
    SystemData::setStorage(stor);
}

bool StorageManager::enqueueRecord(String jsonRecord) {
    SD_Storage stor = SystemData::getStorage();
    if (!stor.sdMounted) return false;
    
    unsigned long start = micros();
    
    ensureDailyFolder();
    
    File file = SD.open(stor.currentLogFile, FILE_APPEND);
    if (!file) {
        Logger::error("Failed to open log file for appending.");
        ErrorManager::throwError(E602);
        return false;
    }
    
    file.println(jsonRecord);
    file.close();
    
    unsigned long latency = micros() - start;
    Logger::debug("SD Append Latency: " + String(latency) + " us");
    
    simQueueCount++;
    stor.pendingRecords = simQueueCount;
    stor.lastWriteTime = millis();
    SystemData::setStorage(stor);
    
    return true;
}

String StorageManager::dequeueRecord() {
    SD_Storage stor = SystemData::getStorage();
    if (!stor.sdMounted || simQueueCount == 0) return "";
    
    // In full Phase 2, this reads the exact first line of the file.
    // For this hardware validation layer, we simulate dequeuing logic.
    return "{\"simulated_dequeue\": true}"; 
}

bool StorageManager::confirmUpload() {
    SD_Storage stor = SystemData::getStorage();
    if (simQueueCount > 0) simQueueCount--;
    
    stor.pendingRecords = simQueueCount;
    stor.lastUploadTime = millis();
    SystemData::setStorage(stor);
    
    Logger::info("Record uploaded and purged from offline queue.");
    return true;
}

bool StorageManager::runDiagnosticsTest() {
    if (!SystemData::getStorage().sdMounted) return false;
    
    Logger::info("Running SD R/W Diagnostics...");
    String testFile = "/logs/test.txt";
    
    // Write Test
    File f = SD.open(testFile, FILE_WRITE);
    if (!f) return false;
    f.println("DIAG");
    f.close();
    
    // Read Test
    f = SD.open(testFile, FILE_READ);
    if (!f) return false;
    String out = f.readStringUntil('\n');
    f.close();
    
    // Delete Test
    SD.remove(testFile);
    
    if (out.indexOf("DIAG") >= 0) {
        return true;
    }
    return false;
}

// Stubs
void StorageManager::enableCompression() {}
void StorageManager::enableEncryption() {}
void StorageManager::forceLogRotation() {}
void StorageManager::exportToUSB() {}
