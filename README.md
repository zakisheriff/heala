# heala – AI-Powered Personal Health Record Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-1abc9c.svg?style=for-the-badge)](./LICENSE)
[![React Native](https://img.shields.io/badge/React_Native-0.71-3498db.svg?style=for-the-badge)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18-27ae60.svg?style=for-the-badge)](https://nodejs.org/)
[![Expo](https://img.shields.io/badge/Expo-Managed-e67e22.svg?style=for-the-badge)](https://expo.dev/)

---

## Project Overview

**heala** is an AI-powered personal health record platform for Sri Lanka and similar developing countries.  
It digitizes handwritten prescriptions, analyzes medicines, summarizes lab reports, and provides actionable health insights for users while offering analytics to governments, pharma companies, and medical equipment providers.

---

## Problem Statement

- Handwritten prescriptions make patient health data **hard to track digitally**.  
- Patients lack **unified digital health records** across hospitals, clinics, and labs.  
- Stakeholders (government, pharma, medical equipment providers) lack **real-time insights** on diseases, medicine usage, and healthcare trends.  
- Patients struggle to track **past illnesses, test results, and prescribed medicines**, and **cannot easily understand lab reports** due to complex medical jargon.

---

## Solution

heala provides a **mobile + cloud-based platform**:

### 1. Prescription Digitization & Analysis
- Upload photos of handwritten prescriptions.  
- AI/ML (OCR + NLP trained on local handwriting) converts them into structured data: medicine name, dosage, duration, diagnosis.  
- AI provides **detailed insights**:
  - Purpose of each medicine  
  - Timing and proper usage  
  - Precautions and interactions  
- Data validated against a **local drug database**.

### 2. Lab Report Summarization & Guidance
- Upload lab reports (PDF or photo).  
- AI extracts results and **summarizes findings in simple language**.  
- Provides user-friendly guidance:
  - Key points to monitor  
  - Dos and don’ts  
  - Recommended diet and lifestyle changes  

### 3. Patient Health Record
- Builds a **longitudinal health history**:
  - Past illnesses & diagnoses  
  - Medicines consumed (brand + generic)  
  - Lab tests and reports with summaries  
- Records are **accessible anytime**, even if patients change doctors or hospitals.

### 4. Analytics for Stakeholders
- **Government:** track outbreaks, medicine shortages, health trends.  
- **Pharma companies:** demand insights, prescription patterns, brand vs generic usage.  
- **Medical equipment providers:** monitor high-demand diagnostics/tests.

---

## Phased Approach

1. **Phase 1:** Prescription digitization, medicine tracking, and analysis  
2. **Phase 2:** Lab report ingestion with AI extraction and summarization  
3. **Phase 3:** API integration with hospitals, clinics, and labs  
4. **Phase 4:** Predictive insights for early detection of chronic conditions

---

## Technology Stack

- **Frontend:** React Native (mobile app), Web Portal for stakeholders  
- **Backend:** Node.js + Express.js, secure cloud storage  
- **AI/ML:** OCR + NLP trained on local handwriting & medicine names; lab report summarization models  
- **Integration:** Standardized and secure RESTful APIs to enable data exchange between hospitals, clinics, labs, and the heala platform
- **Security:** Encrypted storage, HIPAA-like compliance

---

## Revenue Streams

**B2B**: Hospitals/clinics, pharma companies, insurance providers  
**B2C**: Premium app features, subscription for unlimited storage  
**Government/Public Health**: National health database contribution, outbreak dashboards

---

## Project Structure

heala/
│
├─ heala-app/ # React Native mobile app
│ ├─ assets/ # Images, icons, fonts
│ ├─ components/ # Reusable UI components
│ ├─ screens/ # App screens
│ ├─ navigation/ # App navigation (stack/tab)
│ ├─ services/ # API & helper functions
│ ├─ App.js # App entry point
│ └─ package.json # App dependencies
│
├─ heala-backend/ # Node.js backend
│ ├─ controllers/ # API route handlers
│ ├─ models/ # Database models
│ ├─ routes/ # API endpoints
│ ├─ middleware/ # Auth, validation, etc.
│ ├─ config/ # DB & server config
│ ├─ server.js # Backend entry point
│ └─ package.json # Backend dependencies
│
└─ README.md # Project documentation

---

## 🚀 Installation

### Backend
```bash
cd heala-backend
npm install
npm start

Server runs at http://localhost:5000 (or your configured port)
```

### React Native App
```bash
cd heala-app
npm install
npx expo start
Scan the QR code with Expo Go or run on an emulator.
```
