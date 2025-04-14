# Maker.io Backend API

A comprehensive RESTful API for Maker.io, a makerspace platform that enables users to access tools, workshops, and learning resources.

## Features

- User authentication and authorization
- Workshop and event management
- Service booking system
- Equipment and tool management
- Learning path tracking
- File upload and management
- Role-based access control
- Real-time notifications
- Payment integration
- Analytics and reporting

## Tech Stack

- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Multer for file uploads
- Joi for input validation
- Nodemailer for email notifications
- Stripe for payment processing

## API Endpoints

### Authentication Routes (`/auth`)

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `PUT /auth/change-password` - Change user password
- `DELETE /auth/delete-account` - Delete user account

### User Management Routes (`/users`)

- `GET /users` - Get all users (admin only)
- `GET /users/:id` - Get a specific user
- `PUT /users/:id` - Update a specific user
- `DELETE /users/:id` - Delete a specific user (admin only)

### Workshop & Event Routes (`/workshops`)

- `GET /workshops` - Get all workshops
- `GET /workshops/upcoming` - Get upcoming workshops
- `GET /workshops/:id` - Get a specific workshop
- `POST /workshops` - Create a new workshop (admin only)
- `PUT /workshops/:id` - Update a specific workshop (admin only)
- `DELETE /workshops/:id` - Delete a specific workshop (admin only)

### Service Routes (`/services`)

- `GET /services` - Get all services
- `GET /services/:id` - Get a specific service
- `POST /services` - Create a new service (admin only)
- `PUT /services/:id` - Update a specific service (admin only)
- `DELETE /services/:id` - Delete a specific service (admin only)

### Equipment Routes (`/equipment`)

- `GET /equipment` - Get all equipment
- `GET /equipment/:id` - Get a specific equipment
- `POST /equipment` - Create new equipment (admin only)
- `PUT /equipment/:id` - Update specific equipment (admin only)
- `DELETE /equipment/:id` - Delete specific equipment (admin only)

### Booking Routes (`/bookings`)

- `GET /bookings` - Get all bookings (filtered by user if not admin)
- `GET /bookings/:id` - Get a specific booking
- `POST /bookings` - Create a new booking
- `PUT /bookings/:id` - Update a specific booking
- `DELETE /bookings/:id` - Delete a specific booking

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. For production:
   ```bash
   npm start
   ```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected routes:

1. Register a user or login to get a token
2. Include the token in the Authorization header:
   ```
   Authorization: Bearer <your_token>
   ```

## Role-Based Access Control

- **Admin Role**: Full access to all endpoints
- **Instructor Role**: Can manage workshops and services
- **User Role**: Can view and book workshops/services

## Workshop Management

### Workshop Structure
```json
{
  "title": "3D Printing Basics",
  "description": "Learn the fundamentals of 3D printing",
  "instructor": "instructor_id",
  "date": "2024-04-15",
  "time": "14:00",
  "duration": "2 hours",
  "maxParticipants": 10,
  "price": 99.99,
  "equipment": ["3d_printer_1", "3d_printer_2"],
  "materials": ["PLA filament", "Support material"],
  "prerequisites": ["Basic computer skills"],
  "attachments": [
    {
      "filename": "workshop-outline.pdf",
      "path": "uploads/workshops/outline.pdf"
    }
  ]
}
```

## Service Management

### Service Structure
```json
{
  "title": "Laser Cutting Service",
  "description": "Professional laser cutting for your projects",
  "price": 50.00,
  "duration": "1 hour",
  "equipment": ["laser_cutter_1"],
  "materials": ["Acrylic", "Wood"],
  "attachments": [
    {
      "filename": "sample-designs.jpg",
      "path": "uploads/services/samples.jpg"
    }
  ]
}
```

## Booking System

### Creating a Booking
```json
{
  "type": "workshop",
  "workshopId": "workshop_id_here",
  "date": "2024-04-15",
  "time": "14:00",
  "participants": 1,
  "paymentMethod": "credit_card",
  "customerDetails": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  },
  "notes": "Special requests"
}
```

## Error Handling

The API uses a centralized error handling middleware:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Response Format

Successful responses follow this format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "metadata": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 