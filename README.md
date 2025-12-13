

## 🌟 About the Project – HealthPal API

**HealthPal** is a comprehensive healthcare backend API designed to support the Palestinian medical ecosystem by connecting patients, doctors, NGOs, volunteers, and donors through one unified digital platform.

The system provides essential healthcare services such as appointment booking, medical history tracking, medical missions, donations, support groups, health alerts, and more — all secured and managed through a scalable RESTful API.

This project empowers communities with reliable access to healthcare resources, improves communication between medical actors, and enables NGOs and donors to efficiently provide support during crises and daily medical needs.



## 🔧Built With

- **Node.js (Express.js):** A fast and flexible JavaScript runtime used to build scalable RESTful APIs.
- **MySQL (phpMyAdmin):** Relational database system used to store users, medical records, appointments, donations, alerts, and more.
- **JWT Authentication:** Provides secure login and authorization for different user roles (admin, doctor, patient, NGO, volunteer).
- **BCrypt:** Used for hashing and protecting user passwords.
- **Postman:** Used for API testing, validation, and documentation.
- **Git & GitHub:** Version control and collaboration platform used for team development and project management.


## 🚀 Getting Started

### 🔧 Running the project



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

## 👥 Roles

 🧑‍⚕️ **Doctor**
Manages medical profiles, reviews cases, handles appointments, and provides diagnoses for patients.

 👤 **Patient**
Creates an account, books appointments, requests medical assistance, and views personal medical history.

 🏥 **NGO**
Manages medical missions, distributes medical aid, oversees patient cases, and coordinates with doctors.

 💰 **Donor**
Provides financial or medical donations, views campaigns, and monitors donation impact and receipts.

 🛠️ **Admin**
Has full system control, manages users, cases, appointments, donations, alerts, and overall platform operations.


## ⭐ Main Features

• 📅 **Appointment Management**  
Patients can book, update, and cancel appointments with doctors.

• 🩺 **Medical Records**  
Doctors can create and update diagnoses, medical notes, and patient history.

• 🎗️ **Patient Cases Management**  
Patients can submit medical cases, and doctors/NGOs can review and update them.

• 💊 **Medical Aid Requests**  
Patients request medical aid (equipment or medicine), and NGOs manage and deliver them.

• ⚕️ **Drug & Medication Tracking**  
Medication availability and requests are managed through the drug and inventory modules.

• 📦 **Inventory Management**  
NGOs can manage medical supplies, track stock levels, and update item availability.

• 🙌 **Sponsorship System**  
Sponsors can support patient cases financially or medically.

• 💰 **Donations Management**  
Donors can submit donations, track their contributions, and receive receipts.

• 📄 **Reports & Transparency**  
Admins and NGOs can generate transparency reports related to donations and missions.

• 🏥 **NGO Operations**  
NGOs can manage missions, volunteers, support patient cases, and coordinate treatments.

• 🚑 **Medical Missions**  
NGOs create missions, assign doctors, and follow up on mission progress.

• 💬 **Messaging System**  
Secure communication between patients, doctors, NGOs, and volunteers.

• 👥 **Support Groups**  
Users can join support groups to share experiences and get emotional/medical support.

• 🧑‍🏫 **Workshops**  
NGOs or admins can create workshops related to health or community support.

• ⭐ **Posts & Community Updates**  
Admins or NGOs can publish posts and updates for all system users.

• 📝 **Feedback System**  
Users can submit feedback or complaints about services.

• 🔔 **Notifications System**  
The system sends reminders, updates, and alerts to users in real time.

• 🛎️ **Scheduled Reminders (Cron Jobs)**  
Automatic tasks that send reminders for appointments, missions, or deadlines.

• 🌍 **Health Alerts**  
Admins can publish health warnings or alerts for emergency situations.

• 📚 **Health Guides**  
Educational medical content to raise awareness among users.

• 🌐 **Anonymous Sessions**  
Users can access limited features without creating an account.

• 🧩 **Authentication & Roles**  
Secure login, JWT-based access, and role-based authorization.

• 🛡️ **Admin Control Panel**  
Admin can manage all users, missions, medical cases, donations, alerts, guides, and system content.

• 🌐 **Translation Utility**  
A translation service to support multilingual communication (utils/translate.js).

• 📡 **WebSocket Real-Time Updates**  
Instant communication and live updates using socketService.js.


## 📝 API Documentation

You can access the full API documentation for HealthPal through our Postman public collection:

👉 **Postman Documentation:**  
[Click here to view the HealthPal API Documentation](https://documenter.getpostman.com/view/49378300/2sB3dPSqYe)



## 🎥 Demo
[Click here to view the demo](https://drive.google.com/drive/folders/1_xUnpkVqOWkdRebhPdOGfcqcLBzjyTM4)


## 📩 Contact


-  **Tasneem Ratrout** – 
 tasneemratrout999@gmail.com  

-  **Shahd  Rawajbeh** – 
  s12114152@stu.najah.edu

-  **Nareeman Hatem Jomaa** –
S12112343@stu.najah.edu
-  **nuha hamad** – 
nuha123hamad@gmail.com
