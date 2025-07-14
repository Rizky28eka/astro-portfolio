---
title: "Fruit Market: A Cross-Platform E-commerce Application"
summary: "Mobile-first fruit shopping experience"
date: "Jul 14 2025"
draft: false
category: "Fullstack"
tags:
  - Fullstack
  - Market
  - Slicing UI
demoUrl: https://www.behance.net/gallery/115391773/Fruit-Market-Online-Delivery-App-UI-kit
repoUrl: https://https://github.com/Rizky28eka/fruit-market-fs
---

## Project Overview
The Fruit Market project is a comprehensive full-stack e-commerce application designed for buying and selling fruits. It features a cross-platform mobile application built with Flutter for the frontend and a robust Node.js backend for API services and database management. The application aims to provide a seamless experience for customers to browse, purchase, and manage fruit orders, while also offering administrative and delivery functionalities.

## Problem Statement
In today's digital age, many local fruit vendors lack an online presence, limiting their reach and convenience for customers. Customers often face challenges with traditional shopping methods, such as limited product information, inconvenient payment options, and time-consuming physical visits. This project addresses these issues by providing a centralized, accessible, and efficient platform for fruit transactions.

## Target Users / Use Cases
*   **Customers:** Browse fruit catalog, add items to cart, place orders, track orders, manage profiles, view order history.
*   **Fruit Vendors/Admins:** Manage fruit inventory, process orders, view sales data, manage user accounts.
*   **Delivery Personnel:** Receive delivery assignments, update delivery status, manage delivery routes.

## Tech Stack
*   **Frontend:** Flutter (Dart)
*   **Backend:** Node.js, Express.js
*   **Database:** MySQL
*   **Real-time Communication:** Socket.IO

## Methodology / Workflow
The project appears to follow a modular and component-based architecture, typical for Flutter and Node.js applications. The Flutter frontend utilizes a screen-based structure with common widgets, while the Node.js backend employs a clear separation of concerns with controllers, helpers, and routes, indicative of an MVC-like pattern.

## Project Structure

```
fruit-market/
├── fruit_market_flutter/  # Flutter mobile application (Frontend)
│   ├── lib/               # Dart source code
│   │   ├── common/        # Common utilities, helpers, and services
│   │   ├── common_widgets/# Reusable UI components
│   │   └── screen/        # Application screens (e.g., login, home, cart, admin)
│   ├── assets/            # Images, fonts, and other static assets
│   └── ...
└── fruit_market_node/     # Node.js backend API (Backend)
    ├── app.js             # Main application entry point
    ├── controllers/       # Business logic for API endpoints
    ├── helpers/           # Database helpers and utility functions
    ├── routes/            # API route definitions
    ├── bin/               # Server startup script
    ├── public/            # Static files
    ├── config/            # Configuration files
    └── ...
```

## Key Features
*   **User Authentication:** Secure login and registration for customers, admins, and delivery personnel.
*   **Product Catalog:** Browse a wide variety of fruits with detailed descriptions.
*   **Shopping Cart:** Add, remove, and manage items in the shopping cart.
*   **Order Management:** Place new orders, view order history, and track order status.
*   **User Profiles:** Manage personal information and delivery addresses.
*   **Admin Panel:** Comprehensive dashboard for managing products, users, and orders.
*   **Delivery Module:** Dedicated interface for delivery personnel to manage assignments.
*   **Real-time Updates:** Socket.IO for real-time communication (e.g., order status updates).
*   **Location Services:** Integration for delivery address management.
*   **Payment Integration:** Support for multiple payment methods (e.g., PayPal, Google Pay, Visa - based on assets).
*   **Favorites:** Mark and manage favorite fruits for quick access.

## Data Source & Preprocessing
The application uses a MySQL database (`fruit_market_app.sql`) to store all application data, including user information, product details, orders, and more. Data is directly managed and accessed via the Node.js backend, with no explicit complex preprocessing steps visible within the provided project structure.

## Challenges & Solutions
*   **Cross-Platform Development:** Utilized Flutter to build a single codebase for both Android and iOS, significantly reducing development time and effort.
*   **API Integration:** Designed a RESTful API with Node.js and Express.js to handle communication between the frontend and the database, ensuring efficient data exchange.
*   **State Management:** Implemented an appropriate state management solution in Flutter (e.g., Provider, BLoC) to handle complex UI states and data flow across the application.
*   **Real-time Communication:** Integrated Socket.IO to enable instant updates for critical features like order status tracking, enhancing user experience.
*   **Database Design:** Structured a relational database schema in MySQL to efficiently store and retrieve diverse application data.

## Model Performance / Evaluation Metrics
This project is an e-commerce application and does not involve machine learning models. Therefore, traditional model performance or evaluation metrics are not applicable. Performance is primarily measured by application responsiveness, API latency, and database query efficiency.

## Results & Impact
The Fruit Market application provides a functional and user-friendly platform that streamlines the process of buying and selling fruits online. It enhances convenience for customers and offers robust management tools for vendors and delivery personnel, demonstrating a complete full-stack e-commerce solution.

## Future Improvements
*   Implement advanced search and filtering options for fruits.
*   Add push notifications for order updates and promotions.
*   Integrate more payment gateways.
*   Develop a recommendation engine for personalized fruit suggestions.
*   Enhance UI/UX with more animations and interactive elements.
*   Implement a rating and review system for products and delivery.

## Lessons Learned
*   The importance of a well-structured API design for seamless frontend-backend communication.
*   Effective state management is crucial for complex Flutter applications.
*   Real-time communication significantly enhances user experience in dynamic applications.
*   Database schema design directly impacts application performance and scalability.
*   The benefits of using a cross-platform framework like Flutter for rapid mobile development.

## Installation & Setup Guide

To set up and run the Fruit Market application locally, follow these steps:

**1. Prerequisites:**
*   Node.js (LTS version recommended)
*   Flutter SDK (stable channel recommended)
*   MySQL Server
*   Git

**2. Backend Setup (Node.js):**

a.  **Clone the repository:**
    ```bash
    git clone https://github.com/rizky28eka/fruit-market.git
    cd fruit-market/fruit_market_node
    ```

b.  **Install dependencies:**
    ```bash
    npm install
    ```

c.  **Database Setup:**
    *   Create a MySQL database (e.g., `fruit_market_db`).
    *   Import the `fruit_market_app.sql` file into your MySQL database. This file contains the necessary table schemas and initial data.
        ```bash
        mysql -u your_username -p fruit_market_db < fruit_market_app.sql
        ```
        (Replace `your_username` and `fruit_market_db` with your actual MySQL username and database name.)
    *   Configure your database connection in `fruit_market_node/config/default.json` (create this file if it doesn't exist, or modify an existing one based on your setup).
        ```json
        {
          "dbConfig": {
            "host": "localhost",
            "user": "your_mysql_user",
            "password": "your_mysql_password",
            "database": "fruit_market_db"
          }
        }
        ```

d.  **Start the backend server:**
    ```bash
    npm start
    ```
    The backend server should now be running, typically on `http://localhost:3000`.

**3. Frontend Setup (Flutter):**

a.  **Navigate to the Flutter project directory:**
    ```bash
    cd ../fruit_market_flutter
    ```

b.  **Get Flutter dependencies:**
    ```bash
    flutter pub get
    ```

c.  **Run the Flutter application:**
    *   Ensure you have an Android emulator, iOS simulator, or a physical device connected.
    *   Run the application:
        ```bash
        flutter run
        ```
    The Flutter application should now launch on your selected device/emulator.

## Credits / Acknowledgments
*   Rizky Eka - Project Lead / Developer
*   (Any other contributors or resources you'd like to acknowledge)