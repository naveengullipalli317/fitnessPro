# Fitness Tracking Backend

This is the backend for the Gym & Fitness Tracking Platform built with Node.js, Express.js, and MongoDB.

## Features
- RESTful API for user authentication, workouts, exercises, goals, and routines
- JWT-based authentication
- Input validation and sanitization
- Error handling and logging
- MongoDB integration with Mongoose

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fitness_tracking
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=7d
   BCRYPT_SALT_ROUNDS=12
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The server will run on `http://localhost:5000`

## API Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `GET /api/users/:id/workouts` - Get user's workouts (protected)
- `POST /api/users/:id/workouts` - Create new workout (protected)
- And more... see routes folder for details

## Project Structure
```
src/
├── controllers/   # Request handlers
├── middleware/    # Custom middleware (auth, validation, error, logging)
├── models/        # Mongoose models
├── routes/        # API route definitions
├── services/      # Business logic layer
├── utils/         # Utility functions
├── config/        # Configuration (database, etc.)
├── app.js         # Express app setup
└── server.js      # Server entry point
```

## Development
- Linting: `npm run lint`
- Formatting: `npm run format`
- Start server: `npm run dev`
- Start server in production: `npm start`

## Environment Variables
- `NODE_ENV` - Environment (development/production)
- `PORT` - Port to run the server on
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for signing JWT tokens
- `JWT_EXPIRES_IN` - JWT expiration time
- `BCRYPT_SALT_ROUNDS` - Salt rounds for bcrypt password hashing