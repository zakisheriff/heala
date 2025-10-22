# Heala 🏥💚

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![React Native](https://img.shields.io/badge/React_Native-0.71-blue)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18-brightgreen)](https://nodejs.org/)
[![Expo](https://img.shields.io/badge/Expo-Managed-orange)](https://expo.dev/)

**Heala** is an **AI-powered personal health record platform** designed for Sri Lanka (and similar developing countries). It digitizes handwritten prescriptions, creates a unified patient health record, and provides analytics to stakeholders such as governments, pharma companies, and medical equipment providers.

---

## 🌟 Problem Statement

- Most medical prescriptions are **handwritten**, making them hard to track digitally.  
- Patients lack a **unified digital health record** across hospitals, clinics, and labs.  
- Governments, pharma companies, and equipment providers lack **real-time insights** on disease trends, medicine usage, and healthcare demands.  
- Patients struggle to track **past illnesses, lab results, and prescribed medicines**.

---

## 💡 Solution

Heala provides a **mobile + cloud-based platform** that:

### 1. Digitizes Prescriptions
- Patients upload photos of handwritten prescriptions.  
- AI/ML (OCR + NLP trained on local handwriting) converts them into structured data: medicine name, dosage, duration, diagnosis.  
- Data is validated against a **local drug database** to correct spelling and confirm availability.  

### 2. Patient Health Record
- Builds a **longitudinal health history** including:
  - Past illnesses and diagnoses
  - Medicines consumed (brand + generic)
  - Lab tests and reports (uploaded via photo/PDF, AI extracts values)  
- Records are **accessible anytime**, even if patients change doctors or hospitals.

### 3. Analytics for Stakeholders
- **Government:** track outbreaks, medicine shortages, health trends.  
- **Pharma companies:** understand demand, prescription patterns, generic vs. brand usage.  
- **Medical equipment providers:** monitor which diagnostics/tests are in high demand.

---

## 🏗 Phased Approach

1. **Phase 1:** Prescription digitization & medicine tracking.  
2. **Phase 2:** Lab report ingestion with AI extraction.  
3. **Phase 3:** API integration with hospitals, clinics, and labs (WSO2 for interoperability).  
4. **Phase 4:** Predictive insights — early detection of chronic conditions.  

---

## ⚡ Technology Stack

- **Frontend:** React Native (mobile app), Web Portal for stakeholders  
- **Backend:** Node.js + Express.js, secure cloud storage  
- **AI/ML:** OCR + NLP trained on Sri Lankan doctors’ handwriting & medicine names  
- **Integration:** WSO2 for hospital/clinic/pharmacy interoperability  
- **Security:** Encrypted data storage, HIPAA-like compliance  

---

## 💰 Revenue Streams

1. **B2B:**  
   - Hospital/clinic subscriptions to access patient history (with consent)  
   - Pharma companies pay for anonymized insights  
   - Insurance providers pay for verified medical histories  

2. **B2C:**  
   - Premium patient app features (medicine reminders, digital prescriptions)  
   - Subscription for unlimited storage of reports and health data  

3. **Government/Public Health:**  
   - National health database contribution  
   - Analytics dashboards for outbreak monitoring  

---

## 📂 Project Structure
heala/
├─ heala-app/ # React Native mobile app
│ ├─ components/ # Reusable UI components
│ ├─ screens/ # App screens
│ ├─ assets/ # Images, icons, fonts
│ └─ App.js # App entry point
├─ heala-backend/ # Node.js backend
│ ├─ controllers/ # API route handlers
│ ├─ models/ # Database models
│ ├─ routes/ # API routes
│ └─ server.js # Backend entry point
└─ README.md # Project documentation

---

## 🚀 Installation

### Backend
```bash
cd heala-backend
npm install
npm start

Server runs at http://localhost:5000 (or your configured port)


**React Native App**
cd heala-app
npm install
npx expo start
Scan the QR code with Expo Go or run on an emulator.
