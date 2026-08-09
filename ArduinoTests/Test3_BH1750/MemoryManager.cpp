#include "MemoryManager.h"
#include "Logger.h"

uint32_t MemoryManager::getFreeHeap() { return ESP.getFreeHeap(); }
uint32_t MemoryManager::getLargestBlock() { return ESP.getMaxAllocHeap(); }

void MemoryManager::printMemoryStats() {
    Logger::info("Heap: " + String(getFreeHeap()) + " B | MaxBlock: " + String(getLargestBlock()) + " B");
}
