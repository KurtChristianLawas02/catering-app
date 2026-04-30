# Ratskie Food and Catering Services
## Catering Service Management System – Full-Stack Node.js + MySQL Application

---

## 📁 Project Structure

```
catering-app/
├── backend/
│   ├── config/
│   │   └── db.js              # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js  # Admin login logic
│   │   └── inquiryController.js # CRUD for inquiries
│   ├── middleware/
│   │   └── auth.js            # JWT authentication guard
│   ├── routes/
│   │   ├── auth.js            # POST /api/auth/login
│   │   └── inquiries.js       # Full REST API for inquiries
│   ├── schema.sql             # Database setup script
│   ├── server.js              # Express entry point
│   └── package.json
│
└── frontend/
    └── public/
        ├── index.html          # Customer landing page + booking form
        ├── uploads/            # Uploaded inspiration images
        └── admin/
            ├── index.html      # Admin login page
            └── dashboard.html  # Admin dashboard
```

---

## 🚀 Setup Instructions

### 1. Database Setup
```sql
-- In MySQL / SSMS / phpMyAdmin:
SOURCE schema.sql;
```
Or paste the contents of `backend/schema.sql` directly into your MySQL client.

**Default admin credentials:**
- Username: `admin`
- Password: `password`

> To create a real hashed password, run in Node.js:
> ```js
> const bcrypt = require('bcryptjs');
> console.log(bcrypt.hashSync('yourpassword', 10));
> ```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment
Create a `.env` file in the `backend/` folder:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=catering_db
JWT_SECRET=your_super_secret_key
PORT=3000
```

### 4. Start the Server
```bash
# Development (auto-restart):
npm run dev

# Production:
npm start
```

### 5. Open in Browser
- **Customer Site:** http://localhost:3000
- **Admin Login:** http://localhost:3000/admin
- **Admin Dashboard:** http://localhost:3000/admin/dashboard.html

---

## 🔌 REST API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | Admin login → returns JWT |
| POST | `/api/inquiries` | ❌ | Customer submits booking inquiry |
| GET | `/api/inquiries` | ✅ | Get all inquiries (paginated, filterable) |
| GET | `/api/inquiries/stats` | ✅ | Dashboard statistics |
| GET | `/api/inquiries/:id` | ✅ | Get single inquiry |
| PUT | `/api/inquiries/:id` | ✅ | Update full inquiry |
| PATCH | `/api/inquiries/:id/status` | ✅ | Update status only |
| DELETE | `/api/inquiries/:id` | ✅ | Delete inquiry |

---

## 🛡️ Security Notes
- Admin passwords are stored as bcrypt hashes (never plain text)
- JWT tokens expire after 8 hours
- All admin routes are protected by JWT middleware
- Input validation on both frontend (JS) and backend (Node.js)
- CORS is enabled for development — restrict in production

---

## 📦 Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MySQL 8+ (via mysql2)
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **File Uploads:** Multer
- **Frontend:** Vanilla HTML/CSS/JS (no framework required)
- **Fonts:** Cormorant Garamond + Jost (Google Fonts)
