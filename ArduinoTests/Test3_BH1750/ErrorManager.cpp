#include "ErrorManager.h"
#include "Logger.h"
#include "SystemData.h"

void ErrorManager::throwError(String errorCode) {
    Logger::error("System Fault: " + errorCode);
    SD_System sys = SystemData::getSystem();
    strncpy(sys.errorCode, errorCode.c_str(), sizeof(sys.errorCode) - 1);
    SystemData::setSystem(sys);
}
void ErrorManager::logErrors() {
    // future centralized log logic
}
