#pragma once
#include <Arduino.h>
class MemoryManager {
public:
    static uint32_t getFreeHeap();
    static uint32_t getLargestBlock();
    static void printMemoryStats();
};
