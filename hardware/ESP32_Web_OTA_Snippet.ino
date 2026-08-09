#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <Update.h>

// --------------------------------------------------------
// Wi-Fi Credentials
// --------------------------------------------------------
const char* ssid = "vivot4pro";
const char* password = "12345678900";

// --------------------------------------------------------
// Web Server on port 80
// --------------------------------------------------------
WebServer server(80);

// HTML page for the Update UI
const char* serverIndex = 
"<script src='https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js'></script>"
"<form method='POST' action='#' enctype='multipart/form-data' id='upload_form'>"
   "<input type='file' name='update'>"
   "<input type='submit' value='Update Firmware'>"
"</form>"
"<div id='prg'>Progress: 0%</div>"
"<script>"
"$('form').submit(function(e){"
"  e.preventDefault();"
"  var form = $('#upload_form')[0];"
"  var data = new FormData(form);"
"  $.ajax({"
"    url: '/update',"
"    type: 'POST',"
"    data: data,"
"    contentType: false,"
"    processData: false,"
"    xhr: function() {"
"      var xhr = new window.XMLHttpRequest();"
"      xhr.upload.addEventListener('progress', function(evt) {"
"        if (evt.lengthComputable) {"
"          var per = evt.loaded / evt.total;"
"          $('#prg').html('Progress: ' + Math.round(per*100) + '%');"
"        }"
"      }, false);"
"      return xhr;"
"    },"
"    success:function(d, s) {"
"      console.log('success!');"
"      $('#prg').html('Update Success! ESP32 is rebooting...');"
"    },"
"    error: function (a, b, c) {"
"      $('#prg').html('Update Failed!');"
"    }"
"  });"
"});"
"</script>";

void setup() {
  Serial.begin(115200);
  
  // 1. Connect to Wi-Fi
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // 2. Setup the Web Server Routes
  
  // Route 1: Show the upload HTML page when going to the root URL (http://192.168.x.x/)
  server.on("/", HTTP_GET, []() {
    server.sendHeader("Connection", "close");
    server.send(200, "text/html", serverIndex);
  });

  // Route 2: Handle the actual file upload (Firmware Flash)
  server.on("/update", HTTP_POST, []() {
    server.sendHeader("Connection", "close");
    server.send(200, "text/plain", (Update.hasError()) ? "FAIL" : "OK");
    ESP.restart(); // Reboot after successful update
  }, []() {
    // This code runs WHILE the file is uploading
    HTTPUpload& upload = server.upload();
    
    if (upload.status == UPLOAD_FILE_START) {
      Serial.printf("Update Starting: %s\n", upload.filename.c_str());
      // Start the update process, use UPDATE_SIZE_UNKNOWN because we don't know the exact file size yet
      if (!Update.begin(UPDATE_SIZE_UNKNOWN)) {
        Update.printError(Serial);
      }
    } else if (upload.status == UPLOAD_FILE_WRITE) {
      // Flashing the incoming bytes to the ESP32 storage
      if (Update.write(upload.buf, upload.currentSize) != upload.currentSize) {
        Update.printError(Serial);
      }
    } else if (upload.status == UPLOAD_FILE_END) {
      // Finalize the update
      if (Update.end(true)) { 
        Serial.printf("Update Success: %u bytes\n", upload.totalSize);
      } else {
        Update.printError(Serial);
      }
    }
  });

  // 3. Start the Web Server
  server.begin();
  Serial.println("Web Server for OTA Updates Started!");
}

void loop() {
  // Listen for incoming web browser connections
  server.handleClient();
  
  // ---> Put the rest of your AgriShield sensor logic here!
}
