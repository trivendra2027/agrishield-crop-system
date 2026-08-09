# AI-Based Crop Disease Detection System (Phase 1)

An automated agricultural diagnostics system designed for modern farming. Farmers can upload or capture real-time crop leaf images, diagnose pathogenic infestations using deep learning neural networks, and manage historical scan records.

---

## 📂 Project Folder Structure

```text
AI-Crop-Disease-System/
├── backend/
│   ├── app/
│   │   ├── core/         # Settings, configuration, JWT security utilities
│   │   ├── db/           # MongoDB database connection helpers
│   │   ├── models/       # Pydantic schemas (Request / Response validation)
│   │   ├── routers/      # Router endpoints (auth, upload, predict, history)
│   │   └── main.py       # FastAPI application initializations & lifecycles
│   ├── tests/            # API integration and unit test suites
│   ├── requirements.txt  # Python package dependencies
│   └── .env              # Active backend configuration keys
├── frontend/
│   ├── src/
│   │   ├── components/   # Modular, reusable UI components (Buttons, Cards, Nav, etc.)
│   │   ├── context/      # React AuthContext state hooks
│   │   ├── pages/        # Route views (Landing, Dashboard, Scan, History, Profile, etc.)
│   │   ├── services/     # Axios client configuration (interceptors, credentials)
│   │   ├── App.jsx       # App routers configuration
│   │   ├── index.css     # Global stylesheets and glassmorphic variables
│   │   └── main.jsx      # React DOM bootstrap entrypoint
│   ├── package.json      # Node package dependencies list
│   └── tailwind.config.js# Tailwind compiler parameters
├── model/
│   ├── classes.json      # Sorted alphabetical PlantVillage class names list
│   ├── create_dummy_model.py # Fast placeholder model compiling script
│   ├── predict.py        # Image pre-processing and TensorFlow inference helper
│   └── train.py          # Transfer learning & fine-tuning pipeline on EfficientNetB0
├── uploads/              # Local server directory hosting crop image uploads
├── docs/                 # Supplementary design documents
└── README.md             # Project instruction handbook
```

---

## 🛠️ System Prerequisites & Installation

### 1. Database Configuration
1. Ensure a local MongoDB instance is running on `mongodb://localhost:27017` OR set up a database cluster on **MongoDB Atlas**.
2. Create a database named `crop_disease_db`.

### 2. Backend Installation (FastAPI)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (CMD/Powershell):
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy environment templates and configure parameters:
   ```bash
   cp .env.example .env
   ```

### 3. AI Model Weight Initialization
Before running the backend, compile the placeholder weights file so the REST APIs compile without warnings:
```bash
python model/create_dummy_model.py
```

### 4. Frontend Installation (React + Vite)
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```

---

## 🚀 Running the Application Local Servers

### Step 1: Start Backend API Server
Navigate to the root directory and start Uvicorn:
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
API Documentation will be accessible at:
* Swagger UI Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
* ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Step 2: Start React Frontend Server
Navigate to the frontend folder and launch the Vite dev server:
```bash
cd ../frontend
npm run dev
```
Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

---

## 🧪 Running Automated API Tests
You can run automated integration and endpoint test suites on a temporary test database:
```bash
cd backend
pytest -v
```

---

## 🛰️ Production Deployment Steps

### Backend Hosting (Render)
1. Create a Web Service on **Render**.
2. Connect your GitHub repository.
3. Configure the Build Command: `pip install -r backend/requirements.txt`.
4. Configure the Start Command: `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`.
5. Set Environment Variables in Render:
   * `MONGODB_URI`: Your MongoDB Atlas cluster connection string.
   * `JWT_SECRET_KEY`: A secure cryptographically random hexadecimal key.
   * `JWT_ALGORITHM`: `HS256`
   * `ACCESS_TOKEN_EXPIRE_MINUTES`: `1440`

### Frontend Hosting (Vercel)
1. Connect your repo on **Vercel**.
2. Set Root Directory to `frontend`.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Add Environment Variable:
   * `VITE_API_URL`: Your deployed Render backend service URL (e.g., `https://api-crop-disease.onrender.com`).
