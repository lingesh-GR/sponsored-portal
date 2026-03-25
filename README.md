# Sponsored Program Portal 🎓

The **Sponsored Program Portal** is a comprehensive web application designed to empower students by centralizing access to government schemes, internship opportunities, and academic events. It features a dual-dashboard system for both **Students** and **Administrators**, featuring real-time tracking, cloud-based document management, and automated notifications.

## 🚀 Phase 3 Features

- **Responsive UX/UI**: Mobile-first design with 3 breakpoints (Desktop, Tablet, Mobile).
- **Advanced Dashboard Logic**: 
  - Client-side pagination for all application tables.
  - Real-time status filtering (Pending, Approved, Rejected).
  - Searchable listings for Schemes, Internships, and Events.
- **Smart Utilities**: Centralized frontend utilities for theme toggling, toasts, and loading states.
- **Cloud Integration**: Document upload support using Cloudinary API.
- **Automated Notifications**: Professional HTML email alerts for application status changes.
- **API Documentation**: Interactive Swagger/OpenAPI 3.0 documentation at `/api-docs`.
- **System Testing**: Automated unit and integration testing suite using Jest and Supertest.

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), Inter Font System, CSS3 Variables, Chart.js.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL.
- **Security**: JWT (JSON Web Tokens), BcryptJS password hashing.
- **Mailing**: Nodemailer with secure Gmail SMTP and template engine.
- **Cloud Storage**: Cloudinary (Multer storage engine).
- **Testing**: Jest, Supertest.

## 📂 Project Structure

```text
/
├── backend/
│   ├── config/          # Database, Cloudinary, and Swagger configurations
│   ├── controllers/     # Business logic for all modules
│   ├── middleware/      # Auth (JWT) and Role-based access control
│   ├── models/          # MySQL database interactions
│   ├── routes/          # API endpoint definitions with Swagger JSDoc
│   ├── tests/           # Automated API test suite
│   └── server.js        # Main entry point
└── frontend/
    ├── css/             # Dashboard and Auth styling
    ├── dashboard/       # Admin and Student dashboard HTML files
    ├── js/              # Client-side logic and core utilities
    └── index.html       # Landing page with Scroll-Reveal
```

## ⚙️ Installation & Setup

1. **Clone the repository** and navigate to the `backend` folder.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Database Configuration**:
   - Create a MySQL database named `sponsored_portal`.
   - Run the script in `backend/database/schema.sql`.
4. **Environment Variables**:
   - Create a `.env` file in the `backend` folder using the following template:
     ```env
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=sponsored_portal
     JWT_SECRET=your_jwt_secret
     EMAIL_USER=your_email@gmail.com
     EMAIL_PASS=your_app_password
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     ```
5. **Run the Server**:
   ```bash
   node server.js
   ```

## 📖 API Documentation
Once the server is running, visit:
`http://localhost:5000/api-docs`

## 🧪 Testing
To run the automated test suite:
```bash
npm test
```

## 📄 License
This project was developed as part of the Academic Web Development Project.
