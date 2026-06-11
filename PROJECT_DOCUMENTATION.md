# Ratskie Food and Catering Services Documentation

## Project Overview

Ratskie Food and Catering Services is a full-stack catering service management system built for handling customer event inquiries, booking details, package selections, admin review, event status tracking, receipts, and successful event posts.

The system has two main user areas:

- Customer-facing website: lets visitors browse services, view packages, check approved event dates, and submit an inquiry or booking request.
- Admin portal: lets staff manage inquiries, update booking status, view dashboard statistics, monitor approved events, download receipts, and publish successful event posts.

## Main Process Flow

### 1. Customer Browses the Website

Customers start on the public website where they can view the business branding, catering services, event packages, event calendar, successful events, and business information.

Important public pages include:

- Home page: service overview, package highlights, hero slideshow, and booking call-to-action.
- Booking page: inquiry form for event and package details.
- Successful Events page: gallery of completed events published by the admin.
- About page: business information and contact details.

### 2. Customer Submits an Inquiry

The customer fills out the booking form with the following details:

- Full name
- Contact number
- Email address
- Complete address
- Event type
- Event date and time
- Venue or location
- Guest count
- Food package
- Package inclusions or custom selections
- Decoration theme
- Flower arrangement
- Special requests
- Optional inspiration image upload

The frontend validates required fields, email format, event date, and selected package information before sending the inquiry to the backend.

### 3. Backend Validates and Stores the Inquiry

The backend receives the inquiry through the `/api/inquiries` endpoint. It validates the submitted data again before saving it to the MySQL database.

Validation includes:

- Required customer and event fields
- Valid email format
- Valid event type
- Valid food package
- Valid decoration theme
- Valid flower arrangement
- Positive guest count
- Valid date and time format
- Image upload type and size

If the submission is valid, the system stores the inquiry with a default status of `pending`.

### 4. Customer Receives Confirmation

After a successful submission, the customer sees a confirmation message with their inquiry ID. The backend can also send automatic customer notifications through email and SMS when the required environment settings are configured.

Supported notification channels:

- Email through secure SMTP
- SMS through Semaphore
- SMS through Twilio

### 5. Admin Logs In

The admin accesses the admin portal at `/admin`, enters their username and password, and receives a JWT token after successful authentication.

The token is stored in the browser and used for protected admin API requests. Admin tokens expire after 8 hours.

### 6. Admin Reviews and Manages Inquiries

Inside the admin dashboard, staff can:

- View all inquiries
- Search inquiries
- Filter by status
- View customer and event details
- Update booking status
- Delete inquiry records
- Download inquiry receipts
- Review package inclusions and custom selections
- View uploaded inspiration images

The inquiry status can be changed to:

- `pending`
- `approved`
- `completed`
- `cancelled`

### 7. Approved and Completed Events Appear on Calendars

When an inquiry is marked as `approved` or `completed`, it becomes part of the event calendar data.

There are two calendar views:

- Public calendar: shows approved and completed event dates to customers.
- Admin calendar: shows approved and completed events with more detailed booking information for staff.

### 8. Admin Publishes Successful Event Posts

The admin can create successful event posts after an event is completed. Each post includes:

- Event title
- Caption
- One or more event photos

These posts are displayed publicly on the successful events page and can be deleted by the admin when needed.

## Highlighted Features

### Customer Website

- Responsive public website for catering services.
- Hero image slideshow with navigation controls.
- Service highlights for catering, flowers, decoration, and planning.
- Package display for Silver, Gold, and Aluminum packages.
- Expandable package inclusions.
- Public event calendar for approved and completed bookings.
- Dedicated booking form for event inquiries.
- Successful events gallery.
- Mobile navigation menu.

### Booking and Inquiry Form

- Customer information collection.
- Event information collection.
- Food package selection.
- Editable package inclusion list for preset packages.
- Custom event package builder with multiple selectable options.
- Decoration theme selection.
- Flower arrangement selection.
- Special request notes.
- Optional image upload for event inspiration.
- Frontend form validation.
- Backend form validation.
- Success and error messages after submission.

### Admin Authentication

- Admin login page.
- Password verification with bcrypt.
- JWT-based session handling.
- Protected admin API routes.
- Automatic redirect for logged-in admins.
- Logout support.
- Token expiration handling.

### Admin Dashboard

- Dashboard statistics for total, pending, approved, completed, and cancelled inquiries.
- Recent inquiry display.
- Search and status filtering.
- Paginated inquiry table.
- Inquiry detail modal.
- Status update controls.
- Delete confirmation flow.
- Receipt download as an HTML file.
- New pending booking indicator.
- Admin event calendar.
- Successful event post management.

### Event Calendar

- Public calendar shows approved and completed events.
- Admin calendar gives staff a more detailed schedule view.
- Month navigation.
- Event badges by date.
- Completed events are visually distinguished.
- Admin can mark approved events as completed.

### Successful Events Gallery

- Public successful events display.
- Admin post creation with multiple photo uploads.
- Admin post preview.
- Admin delete function.
- Uploaded images are stored in the frontend uploads folder.

### Notifications

- Customer confirmation message after inquiry submission.
- Optional email notification support.
- Optional SMS notification support.
- Phone number normalization for Philippine mobile formats.
- Notification failures are logged without blocking inquiry submission.

### File Uploads

- Inspiration image upload for inquiries.
- Multiple photo upload for successful event posts.
- Supported image types: JPG, PNG, GIF, WEBP.
- Maximum file size: 5 MB.
- Successful event posts support up to 12 photos.
- Safe generated filenames are used instead of original uploaded filenames.

### Security and Validation

- Admin passwords are stored as bcrypt hashes.
- JWT tokens are required for protected admin routes.
- JWT tokens use the HS256 algorithm and expire after 8 hours.
- Security headers are added by middleware.
- Express disables the `X-Powered-By` header.
- Request body size is limited.
- Inquiry submissions use rate limiting.
- Numeric IDs are validated before database actions.
- Uploaded files are restricted by MIME type.
- Database operations use parameterized SQL queries.
- Production mode requires a custom `JWT_SECRET`.

## User Roles and Functionalities

### Customer

Customers can:

- Browse services and packages.
- View successful event posts.
- View approved or completed event dates.
- Submit a booking inquiry.
- Upload an inspiration image.
- Choose preset packages or custom package options.
- Receive a confirmation message and inquiry ID.

### Admin

Admins can:

- Log in securely.
- View booking statistics.
- Search and filter inquiries.
- Open full inquiry details.
- Update inquiry status.
- Delete inquiries.
- Download receipts.
- View approved and completed bookings in a calendar.
- Create successful event posts.
- Upload successful event photos.
- Delete successful event posts.

## System Modules

### Frontend

The frontend is built with plain HTML, CSS, and JavaScript. It is located in `frontend/public`.

Main files:

- `index.html`: customer homepage.
- `booking.html`: customer booking form.
- `successful-events.html`: public successful events page.
- `about.html`: business information page.
- `admin/index.html`: admin login page.
- `admin/dashboard.html`: admin dashboard.
- `js/main.js`: public site interactions and booking submission logic.
- `css/`: styling files grouped by page and feature.

### Backend

The backend is built with Node.js and Express. It is located in `backend`.

Main files:

- `server.js`: application entry point.
- `config/db.js`: MySQL connection pool.
- `config/env.js`: environment variable loader.
- `controllers/authController.js`: admin login logic.
- `controllers/inquiryController.js`: inquiry creation and management logic.
- `controllers/successfulEventController.js`: successful event post logic.
- `routes/auth.js`: authentication routes.
- `routes/inquiries.js`: inquiry API routes.
- `routes/successfulEvents.js`: successful event API routes.
- `middleware/auth.js`: JWT authentication middleware.
- `middleware/security.js`: security headers, rate limiting, safe IDs, and safe filenames.
- `services/notificationService.js`: email and SMS notification logic.
- `schema.sql`: database schema.

### Database

The database uses MySQL.

Main tables:

- `admins`: stores admin accounts and hashed passwords.
- `inquiries`: stores customer booking inquiries and event details.
- `successful_events`: stores successful event post metadata.
- `successful_event_photos`: stores uploaded photo records for successful event posts.

## API Summary

### Authentication

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Public | Logs in an admin and returns a JWT token. |

### Inquiries

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/inquiries` | Public | Creates a customer inquiry. |
| GET | `/api/inquiries/approved-events` | Public | Gets approved and completed event dates for the public calendar. |
| GET | `/api/inquiries/stats` | Admin | Gets dashboard statistics. |
| GET | `/api/inquiries/calendar` | Admin | Gets approved and completed events for the admin calendar. |
| GET | `/api/inquiries` | Admin | Gets paginated and filterable inquiries. |
| GET | `/api/inquiries/:id` | Admin | Gets one inquiry by ID. |
| PUT | `/api/inquiries/:id` | Admin | Updates a full inquiry record. |
| PATCH | `/api/inquiries/:id/status` | Admin | Updates inquiry status only. |
| DELETE | `/api/inquiries/:id` | Admin | Deletes an inquiry. |

### Successful Events

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/successful-events` | Public | Gets all successful event posts. |
| GET | `/api/successful-events/:id` | Public | Gets one successful event post. |
| POST | `/api/successful-events` | Admin | Creates a successful event post with photos. |
| DELETE | `/api/successful-events/:id` | Admin | Deletes a successful event post. |

## Technology Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MySQL
- Authentication: JSON Web Tokens and bcrypt
- File uploads: Multer
- Notifications: SMTP email, Semaphore SMS, Twilio SMS
- Runtime environment: Node.js
- Static hosting: Express static file serving

## Setup Process

### 1. Create the Database

Run the SQL script in MySQL:

```sql
SOURCE backend/schema.sql;
```

The script creates the database, required tables, and a default admin account.

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` folder.

Example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=catering_db
JWT_SECRET=your_super_secret_key
PORT=3000
```

Optional notification settings can also be added for SMTP, Semaphore, or Twilio.

### 4. Start the Server

For development:

```bash
npm run dev
```

For production:

```bash
npm start
```

### 5. Open the Application

- Customer website: `http://localhost:3000`
- Booking page: `http://localhost:3000/booking.html`
- Admin login: `http://localhost:3000/admin`
- Admin dashboard: `http://localhost:3000/admin/dashboard.html`

## Default Admin Account

The database seed creates this default admin account:

- Username: `admin`
- Password: `password`

For real deployment, change the default password and set a strong `JWT_SECRET`.

## Project Highlights

- Complete customer inquiry and booking workflow.
- Admin dashboard for managing catering event requests.
- Public and admin event calendars.
- Preset and customizable package handling.
- Receipt generation for inquiry summaries.
- Successful events gallery managed by admin.
- Optional automated email and SMS confirmations.
- Secure admin-only routes with JWT authentication.
- MySQL-backed data persistence.
- Image upload support for customer inspiration and event gallery photos.

## Recommended Future Enhancements

- Add payment tracking and deposit records.
- Add printable contract generation.
- Add admin user management.
- Add email notifications for admins when new inquiries arrive.
- Add inquiry edit screens in the admin dashboard.
- Add image compression for uploaded photos.
- Add audit logs for status changes and deletions.
- Add stronger production CORS configuration.
- Add automated tests for API validation and dashboard workflows.
