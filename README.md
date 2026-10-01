# TownCare - Township Management System

TownCare is a web-based township management system designed to provide residents with a single platform for accessing township services and communicating with township administration.

## Project Overview

TownCare provides two interfaces:

- Client Interface for residents
- Admin Interface for township administration

The system uses a MySQL database to store and manage residents, notices, visitors, complaints, lost and found records, and bills.

## Features

### Resident / Client

- Resident home dashboard
- Dynamic resident profile information
- Township notice board
- Latest notices displayed on the home dashboard
- Notice attachments and notice details
- Visitor invitation management
- Visitor OTP generation
- Visitor status tracking
- Complaint and service request management
- Maintenance bill tracking
- Current bill and payment history
- Bill status and payment details
- Lost and Found management
- Emergency contact information
- Responsive navigation and page layouts
- Resident login and logout

### Admin

- Admin dashboard
- Resident management
- Resident registration approval and rejection
- Visitor management
- Visitor acceptance and completion status
- Complaint management
- Service-provider assignment by admin
- Bill creation and bill status management
- Notice creation, editing, deletion, and attachments
- Dashboard summaries for complaints, residents, visitors, bills, and notices
- Admin login and logout

## Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js
- REST APIs
- CORS
- Multer for file uploads

### Database

- MySQL

## Project Structure

```text
TownCare/
├── client/
│   ├── html/
│   ├── css/
│   └── js/
├── admin/
│   ├── html/
│   ├── css/
│   └── js/
├── images/
├── uploads/
│   ├── complaints/
│   ├── lost-found/
│   └── notices/
├── server/
│   ├── server.js
│   ├── db.js
│   ├── package.json
│   └── package-lock.json
├── .gitignore
├── README.md
└── LICENSE
```

## Main Client Pages

- Home
- Notice Board
- Visitors
- Complaints & Services
- My Bills
- Lost & Found
- Emergency Numbers
- Profile

## Main Admin Pages

- Dashboard
- Residents
- Visitors
- Complaints & Services
- Bills
- Notice Board

## Visitor Status Flow

Visitor records follow this status flow:

```text
Upcoming -> Inside -> Completed
```

- Upcoming: Visitor invitation has been created and the visitor is expected.
- Inside: Admin has accepted the visitor and the visitor is currently inside the township.
- Completed: Visitor has left the township.

## Database Modules

The MySQL database contains the following main tables:

- `users`
- `complaints`
- `visitors`
- `lost_found`
- `bills`
- `notices`

## Setup Requirements

Make sure the following are installed:

- Node.js
- MySQL
- A modern web browser

## Database Setup

1. Open MySQL or MySQL Workbench.
2. Open the towncare.sql file from the project root.
3. Execute the complete SQL script.
4. The script creates the towncare database and required tables.
5. Verify that the database and tables were created successfully.
6. Configure the MySQL connection details in:

```text
server/db.js
```

The application uses a local MySQL database named `towncare`.

## Backend Setup

Open a terminal inside the `server` directory and run:

```bash
npm install
```

Start the backend server with:

```bash
node server.js
```

The server runs on:

```text
http://localhost:3000
```

## Running the Project

After starting the backend:

1. Open the client login page from the `client/html` directory.
2. Log in as a resident.
3. Use the resident dashboard to access township services.
4. Open the admin login page from the `admin/html` directory to access administrative features.
5. Keep the Node.js server running while using database-backed features.

## File Uploads

TownCare supports attachments for selected modules. Uploaded files are stored in:

```text
uploads/
```

Main upload folders include:

```text
uploads/complaints/
uploads/lost-found/
uploads/notices/
```

## Data Flow

The application follows this general flow:

```text
HTML / CSS / JavaScript
          |
          v
Node.js + Express REST API
          |
          v
MySQL Database
```

Client and admin JavaScript communicate with the Express backend through API endpoints.

## Important Notes

- The application is configured for local development.
- The backend must be running for database-backed features to work.
- Only client and admin interfaces are included.
- Service providers do not have a separate interface; administrators assign service providers to complaints.
- The Emergency Numbers page is display-only for emergency contacts.
- Visitor entry is managed by the admin through visitor status updates.
- The client profile page loads resident-specific information from the logged-in user session.
- Bills and notices shown on client pages are loaded from the backend database rather than being permanently hardcoded.

## Future Improvements

Possible future enhancements include:

- Secure production authentication
- Password hashing and session management
- Role-based authorization middleware
- Email or SMS notifications
- Production deployment
- Improved reporting and analytics
- Automated database backups

## License

This project is provided for educational and project purposes.
