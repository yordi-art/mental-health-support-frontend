# Mental Health Support System - Backend

A comprehensive backend API for a mental health support platform built with Node.js, Express, and MongoDB.

## Features

- **User Authentication & Authorization** (JWT-based)
- **Role-based Access Control** (Client, Therapist, Admin)
- **Mental Health Assessments** (PHQ-9, GAD-7)
- **Appointment Booking & Management**
- **Payment Processing** (Telebirr, CBE Birr, Bank Transfer, Card)
- **Therapist License Verification** (Automated system)
- **Review & Rating System**
- **Notification System**
- **Admin Dashboard & Analytics**

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

## Project Structure

```
backend/
├── config/           # Database configuration
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # Business logic services
├── utils/           # Utility functions
├── validations/     # Input validations
├── server.js        # Application entry point
├── .env            # Environment variables
└── package.json    # Dependencies
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mental-health-support-frontend/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env` file and update the values
   - Ensure MongoDB is running locally or update MONGODB_URI

4. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Client Routes
- `GET /api/client/dashboard` - Client dashboard
- `GET /api/client/therapists` - List therapists
- `POST /api/client/appointments` - Book appointment
- `POST /api/client/assessment` - Submit assessment
- `POST /api/client/payments` - Process payment

### Therapist Routes
- `GET /api/therapist/dashboard` - Therapist dashboard
- `GET /api/therapist/appointments` - Therapist appointments
- `PUT /api/therapist/availability` - Update availability
- `GET /api/therapist/verification-status` - Check verification

### Admin Routes
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - Manage users
- `GET /api/admin/appointments` - View appointments
- `GET /api/admin/analytics` - System analytics

## Database Models

### User
- Basic user information
- Role-based (client, therapist, admin)
- Authentication data

### Therapist
- Extended therapist profile
- License verification data
- Specialization and experience

### Assessment
- PHQ-9 and GAD-7 results
- Scoring and categorization

### Appointment
- Booking management
- Status tracking
- Payment integration

### Payment
- Multiple payment methods
- Transaction tracking
- Status management

## License Verification

The system includes an automated therapist license verification service that:

1. Validates license number format
2. Checks expiry dates
3. Simulates verification process
4. Updates verification status

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- Error handling middleware

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Code Style

- Use async/await for asynchronous operations
- Proper error handling
- Consistent naming conventions
- Modular code structure

## API Documentation

For detailed API documentation, see the individual route files and controller methods.

## License

This project is part of a final year academic project.