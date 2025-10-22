# heala

[![License: MIT](https://img.shields.io/badge/License-MIT-1abc9c.svg?style=for-the-badge)](./LICENSE)
[![React Native](https://img.shields.io/badge/React_Native-0.71-3498db.svg?style=for-the-badge)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18-27ae60.svg?style=for-the-badge)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192.svg?style=for-the-badge)](https://www.postgresql.org/)
[![Azure](https://img.shields.io/badge/Azure-Cloud-0078d4.svg?style=for-the-badge)](https://azure.microsoft.com/)

---

## Project Overview

**heala** is an AI-powered personal health record platform designed for Sri Lanka and similar developing countries.  
It provides:

- **React Native Mobile App** for patients  
- **Web Dashboard** for doctors, hospitals, and pharmaceutical companies  
- **Node.js Backend** with **PostgreSQL** database  
- **Azure Cloud Integration** for secure, scalable storage  

The platform digitizes prescriptions, analyzes medicines, summarizes lab reports, and provides actionable health insights for patients while offering analytics to healthcare stakeholders.

---

## Problem Statement

- Handwritten prescriptions are **difficult to track digitally**.  
- Patients lack **unified digital health records** across hospitals, clinics, and labs.  
- Lab reports are **full of medical jargon**, making it hard for patients to understand their results.  
- Governments, pharma, and equipment providers lack **real-time insights** on disease trends and medicine usage.

---

## Solution

heala Provides a **Mobile + Web + Cloud-Based Platform**:

### 1. Prescription Digitization & Analysis
- Upload handwritten prescriptions via mobile app.  
- AI/ML (OCR + NLP) converts them into structured data: medicine name, dosage, duration, diagnosis.  
- AI analyzes **medicine purpose, timing, usage, and precautions**.  
- Validates against a **local drug database**.

### 2. Lab Report Summarization & Guidance
- Upload lab reports (PDF or image).  
- AI extracts results, **summarizes findings in simple language**.  
- Provides actionable guidance:
  - Dos and don’ts  
  - Diet and lifestyle recommendations  
  - Alerts on critical values

### 3. Patient Health Record
- Builds **longitudinal health history**:
  - Past illnesses & diagnoses  
  - Medicines consumed (brand + generic)  
  - Lab tests & summarized reports  
- Accessible anytime, even if patients change doctors or hospitals.

### 4. Web Dashboard for Stakeholders
- **Doctors:** view patient history, prescribe digitally, monitor trends  
- **Pharma Companies:** understand prescription patterns, drug demand, and market insights  
- **Hospitals & Labs:** monitor test trends and patient outcomes

### 5. Analytics for Stakeholders
- **Government:** outbreak monitoring, medicine shortages, health trends  
- **Pharma & Medical Equipment Providers:** demand insights, prescription patterns, high-demand diagnostics/tests

---

## Technology Stack

- **Mobile App:** React Native (cross-platform for iOS & Android)  
- **Web Dashboard:** React.js / Next.js for doctors & pharma companies  
- **Backend:** Node.js + Express.js  
- **Database:** PostgreSQL (relational, secure, scalable)  
- **Cloud:** Azure (data storage, authentication, deployment)  
- **AI/ML:** OCR + NLP for prescriptions, lab report summarization models  
- **Security:** Encrypted data storage, HIPAA-like compliance  

---

## Project Structure

- heala/
  - heala-app/                  # React Native mobile app
    - assets/                   # Images, icons, fonts
    - components/               # Reusable UI components
    - app/                      # App files
    - services/                 # API & helper functions
    - package.json              # App dependencies
  - heala-web/                  # Web dashboard for doctors/pharma
    - public/                   # Static assets
    - src/                      # Components, pages, utilities
    - App.js                    # Web app entry point
    - package.json              # Web dependencies
  - heala-backend/              # Node.js backend
    - controllers/              # API route handlers
    - models/                   # Database models
    - routes/                   # API endpoints
    - middleware/               # Auth, validation, etc.
    - config/                   # DB & server config
    - server.js                 # Backend entry point
    - package.json              # Backend dependencies
  - README.md                   # Project documentation
  - LICENSE                     # MIT License

---

## 🚀 Installation

### Backend
```bash
cd heala-backend
npm install
npm start
```

Server runs at http://localhost:5000 (or your configured port)


### React Native App

```bash
cd heala-app
npm install
npx expo start
```

Scan the QR code with Expo Go or run on an emulator.


## Contributing

Fork the repository
Create a branch: git checkout -b feature/YourFeature
Make changes & commit: git commit -m "Add feature"
Push branch: git push origin feature/YourFeature
Open a Pull Request

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details. 

