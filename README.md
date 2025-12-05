

## 🌟 About the Project – HealthPal API

**HealthPal** is a comprehensive healthcare backend API designed to support the Palestinian medical ecosystem by connecting patients, doctors, NGOs, volunteers, and donors through one unified digital platform.

The system provides essential healthcare services such as appointment booking, medical history tracking, medical missions, donations, support groups, health alerts, and more — all secured and managed through a scalable RESTful API.

This project empowers communities with reliable access to healthcare resources, improves communication between medical actors, and enables NGOs and donors to efficiently provide support during crises and daily medical needs.




## 📘 Table of Contents
1. [Introduction](#introduction)
2. [Built With](#built-with)
3. [Getting Started](#getting-started)
4. [Main Features](#main-features)
5. [Roles](#roles)
6. [API Documentation](#api-documentation)
7. [Demo](#demo)
7. [Contact](#contact)


## Built With

- **Node.js (Express.js):** A fast and flexible JavaScript runtime used to build scalable RESTful APIs.
- **MySQL (phpMyAdmin):** Relational database system used to store users, medical records, appointments, donations, alerts, and more.
- **JWT Authentication:** Provides secure login and authorization for different user roles (admin, doctor, patient, NGO, volunteer).
- **BCrypt:** Used for hashing and protecting user passwords.
- **Nodemailer:** Enables sending email notifications for account updates or system alerts.
- **Postman:** Used for API testing, validation, and documentation.
- **Git & GitHub:** Version control and collaboration platform used for team development and project management.


## 🚀 Getting Started

### 🔧 Running the project

---

### **1. Clone the Repository:**

```bash
git clone https://github.com/your-repo/HealthPal-Backend.git
```


### **2. Install Dependencies:**

```bash
npm install
```
### **3. Create The Database:**
```sql
CREATE DATABASE healthpal_db;
```
### **4. Configure Environment Variables:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=healthpal_db

JWT_SECRET=your_secret_key
PORT=5000
```
### **5. Run The Application:**
```bash
npm start
```

