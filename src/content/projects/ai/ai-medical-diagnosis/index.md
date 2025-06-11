---
title: "AI-Powered Medical Diagnosis Application"
summary: "AI-based medical diagnosis tool."
date: "Mar 18 2022"
draft: false
tags:
  - Python
  - Streamlit
  - Machine Learning
demoUrl: https://ai-medical-diagnosis-app-gzz76hpzfn4yi5zxbfemth.streamlit.app/
repoUrl: https://github.com/Rizky28eka/AI-Medical-Diagnosis-App
---

### 📌 Project Overview

This AI-based Medical Diagnosis Application is a student project developed at Universitas Amikom Yogyakarta. It leverages Machine Learning (ML) models to predict diseases based on user input data and provides informative data visualizations.

### 💾 Repository Contents

This repository includes:

- Preprocessed medical datasets
- Google Colab Notebooks for model training
- Trained model files (.pkl) for disease prediction:
  - Breast Cancer
  - Diabetes
  - Fetal Health
  - Heart Disease
  - Kidney Disease
  - Lung Cancer
- Streamlit web application code

### 🚀 Key Features

- 🏥 AI-based disease prediction using Machine Learning models
- 📊 Interactive Data Visualization with Matplotlib & Seaborn
- 🌐 User-friendly Web Interface built with Streamlit
- 🔍 Secure Data Handling using Pandas
- 📱 Responsive design accessible from various devices

### 🛠️ Technologies Used

- **Python 🐍** - Primary programming language
- **Streamlit 🎨** - Framework for building web apps
- **Scikit-Learn 🤖** - Machine Learning library
- **Pandas & NumPy 📊** - Data manipulation and analysis
- **Matplotlib & Seaborn 📈** - Data visualization libraries
- **Pickle 💾** - For saving and loading trained models

### 📋 System Requirements

- Python 3.7 or newer
- Minimum 4GB RAM (8GB recommended)
- At least 1GB of storage space

### 📌 How to Run the Application Locally

### Step 1: Clone the Repository

```bash
git clone https://github.com/0073212/AI_Medical_Diagnosis_App.git
cd AI_Medical_Diagnosis_App
```

### Step 2: Create and Activate Virtual Environment

```bash

# Create virtual environment

python -m venv venv

# Activate virtual environment

# On Windows:

venv\Scripts\activate

# On Mac/Linux:

source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Run the Application

```bash
streamlit run app.py
```

The app will open in your browser at http://localhost:8501

```bash
AI_Medical_Diagnosis_App/
├── app.py                 # Main Streamlit app file
├── requirements.txt       # Python dependencies
├── models/                # Folder containing trained models (.pkl)
│   ├── breast_cancer_model.pkl
│   ├── diabetes_model.pkl
│   ├── fetal_health_model.pkl
│   ├── heart_disease_model.pkl
│   ├── kidney_disease_model.pkl
│   └── lung_cancer_model.pkl
├── data/                  # Folder with datasets
├── notebooks/             # Google Colab notebooks
└── README.md              # Project documentation

```

### 📊 Available Models

| Disease        | Accuracy | Algorithm           | Status    |
| -------------- | -------- | ------------------- | --------- |
| Breast Cancer  | 95%+     | Random Forest       | ✅ Active |
| Diabetes       | 90%+     | SVM                 | ✅ Active |
| Fetal Health   | 92%+     | Decision Tree       | ✅ Active |
| Heart Disease  | 88%+     | Logistic Regression | ✅ Active |
| Kidney Disease | 94%+     | Random Forest       | ✅ Active |
| Lung Cancer    | 91%+     | XGBoost             | ✅ Active |

### 🚨 Disclaimer

> ⚠️ **IMPORTANT:**  
> This application is intended for **educational and research purposes only**.  
> The predictions generated should **not** be used as a substitute for professional medical advice.  
> Always consult a **healthcare provider** for diagnosis and treatment.

### 🤝 Contributions

We welcome contributions from the community!

1. Fork this repository
2. Create a new branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

Made with ❤️ by a student of Universitas Amikom Yogyakarta
