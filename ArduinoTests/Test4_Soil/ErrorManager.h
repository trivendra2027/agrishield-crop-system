#pragma once
#include <Arduino.h>
class ErrorManager {
public:
    static void throwError(String errorCode);
    static void logErrors();
};
