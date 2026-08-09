# 👥 Contributors – Agri Shield

## Project Team

### Lead Developer

| Role | Responsibilities |
|------|----------------|
| **Full-Stack Developer** | Backend API, Frontend React, AI Integration, System Architecture |
| **Hardware Engineer** | ESP32 firmware, sensor integration, OLED UI, power management |
| **AI/ML Engineer** | Model training pipeline, Knowledge Distillation, GradCAM implementation |
| **Documentation** | Technical documentation, API specifications, hardware guides |

---

## Project Supervisor

| Role | Description |
|------|-------------|
| **Academic Supervisor** | Faculty guide for Final Year Project |
| **Domain Expert** | Agricultural science advisor |

---

## Technologies and Acknowledgements

### Open Source Libraries Used

| Library | Author/Organization | Purpose |
|---------|-------------------|---------|
| FastAPI | Sebastián Ramírez (tiangolo) | REST API framework |
| React | Meta (Facebook) | Frontend UI framework |
| TensorFlow | Google Brain Team | Machine learning framework |
| MongoDB | MongoDB Inc. | Database |
| Adafruit SSD1306 | Adafruit Industries | OLED display driver |
| ArduinoJson | Benoît Blanchon | JSON for ESP32 |
| BH1750 Library | Christopher Laws (claws) | Light sensor driver |
| i18next | i18next team | Internationalization |
| Recharts | Recharts team | Data visualization |
| Framer Motion | Framer | Animations |
| jsPDF | parallax | PDF generation |
| Lucide React | Lucide Contributors | Icon library |
| Tailwind CSS | Tailwind Labs | CSS utility framework |

### Dataset Acknowledgement
> Dataset: PlantVillage Dataset  
> Authors: David P. Hughes, Marcel Salathé  
> Paper: "An open access repository of images on plant health to enable the development of mobile disease diagnostics" (2015)  
> License: Creative Commons Attribution 4.0 International

### AI Model
> NVIDIA NIM API – Llama 3.1 8B Instruct  
> Model by Meta AI | Served via NVIDIA NIM Infrastructure

---

## How to Contribute

### Reporting Issues
1. Document the exact issue with steps to reproduce
2. Note the operating system and software versions
3. Include any error messages from the Serial monitor, browser console, or backend logs

### Adding Features
1. Read the [Feature_Roadmap.md](./Feature_Roadmap.md) to check if the feature is planned
2. Follow the existing code patterns (manager-based for firmware, router-based for backend)
3. Update the relevant documentation in this folder
4. Update `Feature_Roadmap.md` to mark the feature as implemented

### Hardware Contributions
1. Test new sensors on a breadboard before PCB integration
2. Follow the existing `SensorManager` pattern for new sensor additions
3. Document wiring, I2C/SPI addresses, and calibration in `Sensor_Documentation.md`

---

## Project License

See [License.md](./License.md)
