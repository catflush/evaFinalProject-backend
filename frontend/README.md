# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Maker.io Project

A platform for creating and managing events, workshops, and online courses.

## Backend API Endpoints

### Authentication

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/register` | POST | Register a new user | `{ firstName, lastName, email, password, confirmPassword }` | `{ success, data: { user, token } }` |
| `/login` | POST | Login a user | `{ email, password }` | `{ success, data: { user, token } }` |
| `/auth/logout` | POST | Logout a user | None | `{ success, message }` |
| `/auth/me` | GET | Get current user profile | None | `{ success, data: { user } }` |
| `/auth/updateprofile` | PUT | Update user profile | `{ firstName, lastName, phone, address, bio }` | `{ success, data: { user } }` |
| `/auth/updatepassword` | PUT | Update user password | `{ currentPassword, newPassword }` | `{ success, message }` |

### Events

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/events` | GET | Get all events | None | `{ success, count, data: [events] }` |
| `/events` | POST | Create a new event | `{ title, description, date, time, host, type, level, price }` | `{ success, data: { event } }` |
| `/events/:id` | GET | Get a single event | None | `{ success, data: { event } }` |
| `/events/:id` | PUT | Update an event | `{ title, description, date, time, host, type, level, price }` | `{ success, data: { event } }` |
| `/events/:id` | DELETE | Delete an event | None | `{ success, data: {} }` |

### Event Types

Events can be of the following types:
- `workshop`: Virtual events held online
- `talks`: Virtual events held online
- `networking`: Virtual events held online

### Event Levels

Events can have the following levels of expertise:
- `beginner`: Suitable for newcomers to the topic
- `intermediate`: For those with some experience
- `expert`: Advanced content for experienced practitioners

## Request & Response Examples

### Register a User

**Request:**
```json
POST /register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "60d21b4667d0d8992e610c85",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2023-04-10T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Create an Event

**Request:**
```json
POST /events
{
  "title": "Web Development Workshop",
  "description": "Learn the basics of web development",
  "date": "2023-05-15",
  "time": "14:00",
  "host": "Name of Host",
  "type": "workshop",
  "level": "beginner",
  "price": 49.99
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c86",
    "title": "Web Development Workshop",
    "description": "Learn the basics of web development",
    "date": "2023-05-15T00:00:00.000Z",
    "time": "14:00",
    "host": "Name of Host",
    "type": "workshop",
    "level": "beginner",
    "price": 49.99,
    "createdAt": "2023-04-10T12:00:00.000Z"
  }
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common error status codes:
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `500`: Server Error - Internal server error

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Development

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/makeio
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```
4. Start the server: `npm run dev`

### Scripts

- `npm run dev`: Start the development server with nodemon
- `npm start`: Start the production server
- `npm test`: Run tests
