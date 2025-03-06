# Task Manager Frontend

A modern web application built with SolidJS for managing customer calls and notes. This application provides a clean interface for tracking customer interactions and maintaining important business notes.

## Features

- User Authentication System
- Call Management
  - Create, edit, and delete call records
  - Track customer problems and solutions
  - Search and filter call history
- Note Management
  - Create and manage business notes
  - Track customer contacts and situations
  - Searchable note database
- Role-based Access Control
  - Admin and User roles
  - Different view permissions based on roles
- Responsive Design with DaisyUI

## Tech Stack

- [SolidJS](https://www.solidjs.com/) - Core frontend framework
- [Solid Start](https://start.solidjs.com) - Meta-framework for SolidJS
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [DaisyUI](https://daisyui.com/) - UI Components
- [JWT](https://jwt.io/) - Authentication

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
bun install
```

3. Set up environment variables:

```env
API_URL=http://your-api-url:8080/
```

4. Run the development server:

```bash
bun run dev
```

## Building for Production

Build the application:

```bash
bun run build
```

Start the production server:

```bash
bun start
```

## Docker Deployment

Build the Docker image:

```bash
docker build -t task-manager-frontend .
```

Run the container:

```bash
docker run -p 3000:3000 task-manager-frontend
```

## Environment Variables

- `API_URL` - Backend API URL (default: http://localhost:8080/)
- `NODE_ENV` - Environment mode (development/production)

## Project Structure

- `/src`
  - `/components` - Reusable UI components
  - `/hooks` - Custom hooks for authentication and data fetching
  - `/routes` - Application routes and pages
  - `/shared` - Shared utilities and constants
  - `/utils` - Helper functions
