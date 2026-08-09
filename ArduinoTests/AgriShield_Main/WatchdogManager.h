#pragma once
class WatchdogManager {
public:
    static void init();
    static void feed();
    static void reset();
};
