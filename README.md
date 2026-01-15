# The Origin Technologies - Full-Stack Web Application

## Overview

The Origin Technologies is a comprehensive full-stack web application developed as a solo project by Benedict ACT. This application serves as a technology solutions platform featuring advanced project management, e-commerce capabilities, user authentication, and role-based access control.

The application consists of:
- **Frontend**: Built with React, Vite, and Tailwind CSS for a modern, responsive user interface
- **Backend**: Built with NestJS, TypeScript, and SQLite for robust API services and data management

## Features

### Frontend Features
- **Responsive Design**: Fully responsive UI compatible with desktop, tablet, and mobile devices
- **Dark/Light Theme**: Dynamic theme switching with persistent settings
- **Modern UI/UX**: Beautiful animations using Framer Motion and AOS animations
- **Authentication Flow**: Complete user registration, login, OTP verification, and password reset
- **Multi-role Interface**: Three distinct dashboards for Admin, Controller, and Client users
- **Interactive Elements**: Rich animations, hover effects, and smooth transitions
- **Asset Management**: Comprehensive file upload and management system
- **E-commerce Integration**: Product management, inventory tracking, and sales features

### Backend Features
- **NestJS Architecture**: Modular, scalable, and maintainable codebase
- **JWT Authentication**: Secure token-based authentication system
- **Role-based Access Control**: Fine-grained permissions for Admin, Controller, and Client roles
- **Email Integration**: OTP verification and password reset via email
- **Database Management**: SQLite-based data persistence with migration support
- **RESTful API**: Comprehensive API endpoints for all application features
- **File Upload**: Secure file upload and management capabilities
- **Dashboard Analytics**: Comprehensive statistics and reporting features

## Technology Stack

### Frontend
- **React 18**: Component-based UI library
- **Vite**: Fast build tool and development server
- **TypeScript**: Static typing for improved code quality
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Production-ready animation library
- **Lucide React**: Beautiful, accessible icons
- **Axios**: Promise-based HTTP client
- **React Router**: Declarative routing solution

### Backend
- **NestJS**: Progressive Node.js framework
- **TypeScript**: Strongly typed programming language
- **SQLite**: Lightweight database engine
- **JWT**: Secure token-based authentication
- **Nodemailer**: Email sending capabilities
- **Multer**: File upload handling
- **Class-validator**: Runtime input validation
- **Passport**: Authentication middleware

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Git

### Backend Setup
1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration values

5. Run the development server:
   ```bash
   npm run start:dev
   ```

The backend server will be accessible at `http://localhost:3000`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend application will be accessible at `http://localhost:5578`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/verify-otp` - Verify user email with OTP
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user details
- `DELETE /api/users/:id` - Delete user (Admin only)

### Projects
- `POST /api/projects` - Create a new project
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project (Admin only)
- `POST /api/projects/:id/progress` - Add progress record
- `POST /api/projects/:id/upload` - Upload project file

### Services
- `POST /api/services` - Create a new service
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Shop
- `POST /api/shop` - Create a new product
- `GET /api/shop` - Get all products
- `GET /api/shop/:id` - Get product by ID
- `PUT /api/shop/:id` - Update product
- `DELETE /api/shop/:id` - Delete product
- `PUT /api/shop/:id/stock` - Adjust stock quantity
- `PUT /api/shop/:id/price` - Adjust price

### Notifications
- `GET /api/notifications/:userId` - Get user notifications
- `POST /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/read-all` - Mark all notifications as read
- `POST /api/notifications` - Create notification (Admin only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (Admin only)
- `GET /api/dashboard/recent-projects` - Get recent projects (Admin only)
- `GET /api/dashboard/analytics` - Get project analytics (Admin only)

## Project Structure

### Frontend Structure
```
frontend/
├── src/
│   ├── api/              # API service definitions
│   ├── components/       # Reusable UI components
│   ├── context/          # React Context providers
│   ├── features/         # Feature-based components
│   ├── layouts/          # Layout components
│   ├── pages/            # Route components
│   ├── store/            # State management
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main application component
│   └── main.jsx          # Entry point
├── public/               # Static assets
├── package.json
└── vite.config.js
```

### Backend Structure
```
Backend/
├── src/
│   ├── app.controller.ts # Main application controller
│   ├── app.module.ts     # Main application module
│   ├── app.service.ts    # Main application service
│   ├── main.ts           # Application entry point
│   ├── auth/             # Authentication module
│   ├── users/            # User management module
│   ├── projects/         # Project management module
│   ├── services/         # Service management module
│   ├── shop/             # E-commerce module
│   ├── notifications/    # Notification system
│   ├── dashboard/        # Dashboard module
│   ├── roles/            # Role management
│   ├── uploads/          # File upload handling
│   ├── logs/             # Logging system
│   ├── database/         # Database configuration
│   ├── common/           # Common utilities and decorators
│   └── config/           # Configuration files
├── sql/                  # SQL migration and seed files
├── package.json
└── nest-cli.json
```

## Roles & Permissions

The application implements a sophisticated role-based access control system:

### Admin
- Full system access
- User management
- Project oversight
- Dashboard analytics
- System configuration

### Controller
- Project management
- Client interaction
- Progress tracking
- Report generation

### Client
- Personal project access
- File uploads
- Communication with controllers
- Service requests

## Development

### Available Scripts

#### Backend
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot-reload
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run build` - Build the application
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint the code

## Deployment

### Backend Deployment
1. Ensure all environment variables are configured for production
2. Build the application: `npm run build`
3. Start the application: `npm run start:prod`

### Frontend Deployment
1. Build the application: `npm run build`
2. Serve the `dist/` folder using a web server like Nginx or Apache

## Security Features

- JWT token-based authentication
- Role-based access control
- Input validation and sanitization
- Secure password hashing
- Rate limiting protection
- CORS configuration
- Environment-based configuration

## International Presence

The Origin Technologies operates in multiple countries with locations in:
- South Africa
- Botswana
- Zambia
- Namibia
- Zimbabwe
- Malawi
- Mozambique
- Tanzania

## Contributing

This is a solo-developed project by Benedict ACT. However, contributions and suggestions are welcome through pull requests or issue reports.

## License

This project is proprietary to The Origin Technologies and developed by Benedict ACT.

## Contact

For business inquiries and partnerships, please contact via the application's contact form or visit one of our international locations.

---

Developed with ❤️ by Benedict ACT