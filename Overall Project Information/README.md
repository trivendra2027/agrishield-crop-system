# 📚 Agri Shield – Complete Project Documentation

> **AI-Based Crop Disease Detection System**  
> Documentation Version: 1.0.0 | Last Updated: July 2026  
> Project Phase: Phase 1 (Hardware + AI + Software Integration)

---

## 📋 Project Summary

**Agri Shield** is an end-to-end smart agricultural diagnostic system that combines embedded IoT hardware (ESP32), deep learning AI (MobileNetV3 Knowledge Distillation), and a full-stack web platform (React + FastAPI) to help farmers detect crop diseases early, monitor field conditions in real time, and receive personalized AI-driven farming advice.

The system bridges the gap between affordable hardware and production-grade AI, providing farmers with an accessible, multilingual, and intelligent platform that works both online and offline.

---

## 🗂️ Documentation Navigation

| # | File | Description |
|---|------|-------------|
| 1 | [README.md](./README.md) | This file – project summary and navigation |
| 2 | [Project_Overview.md](./Project_Overview.md) | Abstract, objectives, problem statement, advantages |
| 3 | [Hardware_Architecture.md](./Hardware_Architecture.md) | ESP32 hardware, sensors, GPIO, power, wiring |
| 4 | [Sensor_Documentation.md](./Sensor_Documentation.md) | Every sensor – specs, wiring, calibration, limits |
| 5 | [Power_Management.md](./Power_Management.md) | Battery, TP4056, MT3608, charging flow, safety |
| 6 | [OLED_UI_Design.md](./OLED_UI_Design.md) | OLED display pages, UI flow, state machine |
| 7 | [ESP32_Firmware.md](./ESP32_Firmware.md) | Firmware architecture, all 18 manager modules |
| 8 | [Software_Architecture.md](./Software_Architecture.md) | Full software stack overview and communication |
| 9 | [Backend_Architecture.md](./Backend_Architecture.md) | FastAPI routers, services, DB, auth, security |
| 10 | [Frontend_Architecture.md](./Frontend_Architecture.md) | React pages, routing, state, components |
| 11 | [AI_Disease_Detection.md](./AI_Disease_Detection.md) | Dataset, model, training pipeline, inference |
| 12 | [AI_Chatbot.md](./AI_Chatbot.md) | NVIDIA NIM LLM integration, chatbot workflow |
| 13 | [Translation_System.md](./Translation_System.md) | i18n multi-language system (6 languages) |
| 14 | [API_Specifications.md](./API_Specifications.md) | All REST API endpoints with request/response schemas |
| 15 | [Folder_Structure.md](./Folder_Structure.md) | Complete project folder tree with explanations |
| 16 | [Project_Workflow.md](./Project_Workflow.md) | End-to-end system workflow with Mermaid diagrams |
| 17 | [Feature_Roadmap.md](./Feature_Roadmap.md) | Implemented, in-progress, and planned features |
| 18 | [Testing_and_Validation.md](./Testing_and_Validation.md) | Hardware, API, AI, and integration testing |
| 19 | [Installation_Guide.md](./Installation_Guide.md) | Local setup for new developers (no cloud) |
| 20 | [Future_Enhancements.md](./Future_Enhancements.md) | Roadmap for Phase 2 and beyond |
| 21 | [Contributors.md](./Contributors.md) | Project roles and responsibilities |
| 22 | [License.md](./License.md) | Project license |

---

## 🏗️ System Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AGRI SHIELD SYSTEM                          │
├──────────────────────┬──────────────────────┬───────────────────────┤
│   HARDWARE LAYER     │    SOFTWARE LAYER     │      AI LAYER         │
│                      │                      │                       │
│  ESP32 Microcontroller│  React Frontend      │  MobileNetV3 (Student)│
│  AHT10 (Temp+Humid)  │  (Vite + Tailwind)   │  85 Disease Classes   │
│  BH1750 (Light)      │                      │  Knowledge Distillation│
│  Soil Moisture       │  FastAPI Backend      │                       │
│  Rain Sensor         │  (Python + Uvicorn)  │  NVIDIA NIM LLM       │
│  SH1106 OLED         │                      │  (Llama 3.1 8B)       │
│  SD Card             │  MongoDB Database    │                       │
│  TP4056 Charger      │  (Local Instance)    │  GradCAM++ Explainer   │
│  MT3608 Boost Conv.  │                      │                       │
│  18650 Battery       │  i18n Translation    │  OOD Rejection Filter  │
└──────────────────────┴──────────────────────┴───────────────────────┘
```

---

## 🚀 Quick Start for New Developers

1. Read [Project_Overview.md](./Project_Overview.md) to understand the system goals.
2. Study [Hardware_Architecture.md](./Hardware_Architecture.md) before touching any hardware.
3. Follow [Installation_Guide.md](./Installation_Guide.md) to set up the local development environment.
4. Review [API_Specifications.md](./API_Specifications.md) before writing any API integrations.
5. See [AI_Disease_Detection.md](./AI_Disease_Detection.md) to understand the AI pipeline.
6. Reference [Feature_Roadmap.md](./Feature_Roadmap.md) to understand what is implemented vs pending.

---

## 📌 Key Technical Facts

| Property | Value |
|----------|-------|
| AI Model | MobileNetV3 (Knowledge Distillation Student) |
| Training Dataset | 88,979 images, 85 disease classes |
| Backend Framework | FastAPI 0.100+ (Python) |
| Frontend Framework | React 18 + Vite 4 + TailwindCSS 3 |
| Database | MongoDB (local instance) |
| Hardware Platform | ESP32 Dev Board (240MHz, 520KB SRAM) |
| Firmware Framework | Arduino (via PlatformIO) |
| AI Chatbot | NVIDIA NIM API – Llama 3.1 8B Instruct |
| Languages Supported | English, Hindi, Telugu, Tamil, Kannada, Malayalam |
| API Base URL (local) | `http://localhost:8000` |
| Frontend Local URL | `http://localhost:3000` |

---

## ⚠️ Important Notes

> [!IMPORTANT]
> All documentation is based on Phase 1 of the project. The system is designed for **local deployment only** – no cloud, no Docker, no CI/CD.

> [!NOTE]
> The AI model (MobileNetV3 student) is still under training as of July 2026. The training is running Knowledge Distillation Phase 3 (Epoch 7/15).

> [!WARNING]
> Never commit `.env` files with actual API keys to version control. Always use `.env.example` as a template.
