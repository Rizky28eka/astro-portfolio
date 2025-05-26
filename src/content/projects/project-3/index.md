---
title: "TremorTrack 2.0: Earthquake Magnitude Predictor"
summary: "Machine Learning Earthquake Magnitude Prediction"
date: "March 25 2025"
draft: false
tags:
  - Python
  - Streamlit
  - Machine Learning
demoUrl: https://track-tremor-ddi6fap46rjvvqvx52zh4p.streamlit.app/
repoUrl: https://github.com/Rizky28eka/track-tremor
---

## Project Overview

TremorTrack 2.0 is a machine learning-based application for predicting and visualizing earthquake magnitudes. This project is designed to assist professionals, researchers, and the public in objectively and interactively analyzing and predicting earthquake strength.

## Problem Statement

Manual assessment of earthquake magnitude is often subjective and time-consuming. There is a need for an automated, accurate, and scalable solution to predict earthquake magnitude from seismic data, supporting better decision-making in disaster mitigation.

## Target Users / Use Cases

- **Seismologists & Researchers:** Analyze earthquake data and evaluate prediction models.
- **Disaster Management Agencies:** Obtain rapid predictions for early response.
- **General Public:** Education and earthquake risk monitoring.
- **Developers/Data Scientists:** Reference for developing data-driven prediction applications.

## Tech Stack

- **Programming Language:** Python
- **Framework:** Streamlit
- **Libraries:** pandas, scikit-learn, plotly, numpy, joblib, gdown
- **Visualization:** Plotly
- **Dependency Management:** requirements.txt
- **Version Control:** Git

## Methodology / Workflow

1. **Data Collection:** Gather earthquake data from USGS and ShakeMap.
2. **Data Preprocessing:** Impute missing values, encoding, normalization.
3. **Feature Engineering:** Select and engineer important features.
4. **Model Training:** Train a Random Forest Regressor.
5. **Model Evaluation:** Evaluate using MAE, MSE, R².
6. **Deployment:** Implement an interactive app with Streamlit.
7. **User Interaction:** Prediction & visualization based on user input.

## Project Structure

```
track-tremor/
├── app.py                      # Main application script
├── extracted_datafinal.csv     # Preprocessed dataset
├── categorical_imputer.pkl     # Categorical imputer
├── numerical_imputer.pkl       # Numerical imputer
├── actual_vs_predicted.png     # Model performance visualization
├── after dropping unimportant features.png # Feature selection visualization
├── requirements.txt            # Dependencies list
├── readme.md                   # Project documentation
```

## Key Features

- Automated earthquake magnitude prediction
- Data preprocessing (imputation, encoding)
- Feature selection & engineering
- Interactive visualizations (correlation, intensity, ground motion)
- Modular & extensible codebase

## Data Source & Preprocessing

- **Data Sources:** USGS Global Earthquake Database, ShakeMap, historical seismic data
- **Preprocessing:**
  - Impute missing values (pre-trained imputers)
  - Select important features
  - Normalize & encode categorical features

## Challenges & Solutions

- **Incomplete/Noisy Data:** Imputation & outlier detection
- **Feature Redundancy:** Feature analysis & selection
- **Model Overfitting:** Cross-validation & regularization
- **Dynamic Visualization:** Plotly integration for interactivity

## Model Performance / Evaluation Metrics

- **MAE:** 0.3067
- **MSE:** 0.1730
- **R² Score:** 0.8735
- **Visualizations:**
  - ![Actual vs Predicted](src/content/projects/project-3/images/actual_vs_predicted.png)
  - ![Feature Selection](after dropping unimportant features.png)

## Results & Impact

- High prediction accuracy with low error
- More objective & repeatable magnitude assessment
- Supports better disaster mitigation decision-making

## Demo / Screenshots

- ![Prediction vs Actual](src/content/projects/project-3/images/after_dropping_unimportant_features.png)
- ![Feature Selection](after dropping unimportant features.png)

## Future Improvements

- Real-time data integration
- Multi-class classification for earthquake types
- Web/mobile deployment
- Enhanced UI/UX & reporting features

## Lessons Learned

- Importance of thorough data preprocessing
- Feature selection greatly impacts performance
- Challenges of real-world seismic data
- Documentation & code modularity ease development

## Installation & Setup Guide

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd track-tremor
   ```
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Run the application:**
   ```bash
   python app.py
   ```

## Credits / Acknowledgments

- Developer: Rizky Eka Haryadi
- Data: USGS, ShakeMap
- Thanks to the open-source community
- Contact: r28eka@gmail.com
