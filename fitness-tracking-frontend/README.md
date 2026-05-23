# Fitness Tracking Frontend

This is the frontend for the Gym & Fitness Tracking Platform built with React, Vite, and Tailwind CSS.

## Features
- Responsive design with Tailwind CSS
- Client-side routing with React Router
- Authentication flow (login/register)
- Dashboard with workout statistics and progress tracking
- Modular and scalable component architecture
- API integration with backend services

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.vite` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The application will run on `http://localhost:3000`

## Features
- Modern React development with Vite for fast builds
- Tailwind CSS for utility-first styling
- React Router for client-side navigation
- Custom hooks for data fetching and state management
- Reusable UI components
- Responsive layout for mobile and desktop

## Project Structure
```
src/
├── assets/          # Static assets (images, icons)
├── components/      # Reusable UI components
│   ├── ui/          # Primitive components (Button, Input, etc.)
│   ├── layout/      # Layout components (Header, Footer, etc.)
│   └── features/    # Feature-specific components
├── hooks/           # Custom React hooks (useAuth, useWorkouts, etc.)
├── pages/           # Page components (route views)
├── routes/          # Route definitions
├── store/           # State management (if using Redux/Zustand)
├── styles/          # CSS/Tailwind configuration
├── utils/           # Utility functions (API service, helpers, constants)
├── App.jsx          # Main App component
└── main.jsx         # Entry point
```

## Development
- Linting: `npm run lint`
- Formatting: `npm run format`
- Start development server: `npm run dev`
- Build for production: `npm run build`
- Preview production build: `npm run preview`

## Environment Variables
- `VITE_API_URL` - Base URL for API requests to the backend

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier