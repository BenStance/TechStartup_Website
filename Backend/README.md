# Origin Technologies Backend

This is the backend API for Origin Technologies, built with NestJS.

## Project Structure

```
src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
├── config/
├── common/
│   ├── decorators/
│   ├── exceptions/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   ├── utils/
│   └── constants/
├── database/
│   ├── database.module.ts
│   ├── database.service.ts
│   └── sqlite/
│       ├── init.sql
│       └── seed.sql
├── auth/
├── users/
├── roles/
├── projects/
├── notifications/
├── services/
├── shop/
├── dashboard/
├── uploads/
└── logs/
```

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration values.

4. Run the development server:
   ```bash
   npm run start:dev
   ```

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start the application in development mode with hot-reload
- `npm run start:debug` - Start the application in debug mode
- `npm run start:prod` - Start the application in production mode
- `npm run build` - Build the application
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage

## API Endpoints

The API is accessible at `http://localhost:3000/api/`.

### Authentication
- POST `/api/auth/register` - Register a new user. User will receive an OTP via email for verification.
- POST `/api/auth/verify-otp` - Verify user email with OTP received via email. Returns JWT token upon successful verification.
- POST `/api/auth/login` - Login with verified credentials. Returns JWT token for authenticated requests.
- POST `/api/auth/forgot-password` - Request password reset. Sends OTP to user's email.
- POST `/api/auth/reset-password` - Reset password using OTP received via email.

### Users
- GET `/api/users` - Get all users (Admin only)
- GET `/api/users/:id` - Get user by ID (User can access their own profile, Admin can access any profile)
- POST `/api/users` - Create a new user (Public endpoint)
- PUT `/api/users/:id` - Update user details (User can update their own profile, Admin can update any profile)
- DELETE `/api/users/:id` - Delete user (Admin only)

### Projects
- POST `/api/projects` - Create a new project (Clients can create projects for themselves)
- GET `/api/projects` - Get all projects
- GET `/api/projects/:id` - Get project by ID
- PUT `/api/projects/:id` - Update project (Admins and controllers can update projects)
- DELETE `/api/projects/:id` - Delete project (Admin only)
- POST `/api/projects/:id/progress` - Add a progress record to a project (Admins and controllers only)
- GET `/api/projects/:id/progress` - Get all progress records for a specific project
- POST `/api/projects/:id/upload` - Upload a file for a project (Admins, controllers, and the project client)

### Services
- POST `/api/services` - Create a new service (No authentication required)
- GET `/api/services` - Get all services (No authentication required)
- GET `/api/services/:id` - Get service by ID (No authentication required)
- PUT `/api/services/:id` - Update service (No authentication required)
- DELETE `/api/services/:id` - Delete service (No authentication required)

### Shop
- POST `/api/shop` - Create a new product (Requires JWT token)
- GET `/api/shop` - Get all products (Requires JWT token)
- GET `/api/shop/:id` - Get product by ID (Requires JWT token)
- PUT `/api/shop/:id` - Update product (Requires JWT token)
- DELETE `/api/shop/:id` - Delete product (Requires JWT token)
- PUT `/api/shop/:id/stock` - Adjust stock quantity (Requires JWT token)
- PUT `/api/shop/:id/price` - Adjust price (Requires JWT token)

### Notifications
- GET `/api/notifications/:userId` - Get notifications for a specific user (Users can only access their own notifications unless they are admin)
- POST `/api/notifications/:id/read` - Mark a specific notification as read
- POST `/api/notifications/read-all` - Mark all notifications for the current user as read
- POST `/api/notifications` - Create a new notification (Admin only)
- POST `/api/notifications/:id/delete` - Delete a specific notification
- GET `/api/notifications/:userId/unread-count` - Get the count of unread notifications for a specific user

### Dashboard
- GET `/api/dashboard/stats` - Get comprehensive dashboard statistics (Admin only)
- GET `/api/dashboard/recent-projects` - Get the 10 most recent projects (Admin only)
- GET `/api/dashboard/analytics` - Get detailed project analytics (Admin only)
- GET `/api/dashboard/users` - Get all users grouped by role (Admin only)
- GET `/api/dashboard/projects` - Get all projects with detailed information (Admin only)
- GET `/api/dashboard/services` - Get all services offered by the company (Admin only)
- GET `/api/dashboard/controllers` - Get all controllers with their assigned project counts (Admin only)

### Roles
- GET `/api/roles` - Get information about all available roles
- GET `/api/roles/:role` - Get detailed information about a specific role
- GET `/api/roles/:role/permissions` - Get permissions associated with a specific role
- GET `/api/roles/:role/can-access/:targetRole` - Check if one role can access resources of another role

### Uploads
- POST `/api/uploads/file` - Upload a general file (Requires JWT token)
- POST `/api/uploads/project-document` - Upload a project document (Requires JWT token)
- POST `/api/uploads/product-image` - Upload a product image (Requires JWT token)

### Logs
- GET `/api/logs` - Get system logs (Admin only)
- DELETE `/api/logs` - Clear system logs (Admin only)

## Authentication Requirements

Most endpoints require authentication using JWT tokens:

1. **Public Endpoints** (No authentication required):
   - User registration
   - User login
   - OTP verification
   - Forgot password
   - Reset password
   - Get all services
   - Get service by ID
   - Get all roles
   - Get role details
   - Get role permissions
   - Check role access

2. **User Endpoints** (Require valid JWT token):
   - Get user by ID (own profile)
   - Update user details (own profile)
   - Get notifications
   - Mark notifications as read
   - Get unread notification count
   - Create projects (for clients)
   - Get projects
   - Get project by ID
   - Upload project files
   - Get shop products
   - Create shop products
   - Update shop products
   - Delete shop products
   - Adjust stock quantity
   - Adjust prices
   - Upload files
   - Delete notifications

3. **Admin Endpoints** (Require valid JWT token with admin role):
   - Get all users
   - Get user by ID (any user)
   - Update user details (any user)
   - Delete users
   - Delete projects
   - Get dashboard statistics
   - Get recent projects
   - Get project analytics
   - Get all users via dashboard
   - Get all projects via dashboard
   - Get all services via dashboard
   - Get controllers via dashboard
   - Create notifications
   - Get system logs
   - Clear system logs

## Database

This application uses SQLite for development. The database schema is defined in `src/database/sqlite/init.sql`.

To initialize the database, run the SQL scripts in the `src/database/sqlite/` directory.

## License

This project is proprietary to Origin Technologies.