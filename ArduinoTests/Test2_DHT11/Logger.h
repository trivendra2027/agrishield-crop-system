#pragma once
#include <Arduino.h>
class Logger {
public:
    static void info(String msg);
    static void warning(String msg);
    static void error(String msg);
    static void debug(String msg);
};
