# TaskMaster Pro

**Tagline: Master Your Day, Master Your Tasks**

TaskMaster Pro is a full-stack web application designed to help users efficiently manage their daily tasks. It features robust user authentication, a personalized dashboard, and the ability to create, update, and delete tasks.

## Features

*   **User Authentication**: Secure signup and login system using JWT.
*   **Personalized Dashboard**: A central hub to view task summaries and quick actions.
*   **Task Management**: Create, view, edit, and delete tasks with titles, descriptions, due dates, and status.
*   **User Profiles**: View and update personal information.
*   **Responsive Design**: Optimized for seamless experience across various devices (mobile, tablet, desktop).
*   **Modern UI**: Clean and intuitive interface with consistent branding.

## Technologies Used

**Frontend:**
*   HTML5
*   CSS3 (Flexbox, Grid, CSS Variables, Mobile-first approach)
*   Vanilla JavaScript
*   Font Awesome (for icons)

**Backend:**
*   Node.js
*   Express.js (Web Framework)
*   MongoDB (NoSQL Database)
*   Mongoose (ODM for MongoDB)
*   JWT (JSON Web Tokens for authentication)
*   Bcrypt.js (for password hashing)
*   Joi (for input validation)
*   CORS & Helmet (for security)
*   Dotenv (for environment variables)

## Project Structure


## Getting Started

Follow these instructions to get TaskMaster Pro up and running on your local machine.

### Prerequisites

*   Node.js (LTS version recommended)
*   npm (comes with Node.js)
*   MongoDB Atlas account or a local MongoDB instance

### Installation

1.  **Clone the repository:**

2.  **Install backend dependencies:**

3.  **Configure Environment Variables:**
    *   Create a `.env` file in the `backend/` directory.
    *   Copy the contents from `.env.example` into your new `.env` file.
    *   Replace the placeholder values:
        *   `MONGO_URI`: Your MongoDB connection string (e.g., from MongoDB Atlas).
        *   `JWT_SECRET`: A strong, random string for JWT signing.

4.  **Run the backend server:**
    The backend server should start on `http://localhost:5000`.

5.  **Open the frontend:**
    Navigate to the `public/` directory in your file system and open `index.html` in your web browser. Or, use a simple local web server extension (like Live Server for VS Code) to serve the `public/` folder.

    *   For the frontend JavaScript (e.g., `public/js/auth.js`, `app/js/dashboard.js`) to communicate with the backend API, ensure the `API_BASE` constant is set correctly: `http://localhost:5000/api`. This is already configured.

## API Endpoints

All API endpoints are prefixed with `/api`. Responses are in JSON format.

### Authentication (`/api/auth`)

*   `POST /api/auth/signup`
    *   **Description**: Register a new user.
    *   **Request Body**: `{ "name": "...", "email": "...", "password": "..." }`
    *   **Response**: `{ "success": true, "message": "...", "data": { "token": "..." } }`
*   `POST /api/auth/login`
    *   **Description**: Authenticate user and get a JWT token.
    *   **Request Body**: `{ "email": "...", "password": "..." }`
    *   **Response**: `{ "success": true, "message": "...", "data": { "token": "..." } }`
*   `GET /api/auth/me`
    *   **Description**: Get the profile of the current authenticated user.
    *   **Headers**: `Authorization: Bearer <token>`
    *   **Response**: `{ "success": true, "message": "...", "data": { "user": { "_id": "...", "name": "...", "email": "..." } } }`

### Users (`/api/users`) & Tasks (`/api/users/me/tasks`)

*   `PUT /api/users/:id`
    *   **Description**: Update the authenticated user's profile (e.g., name).
    *   **Headers**: `Authorization: Bearer <token>`
    *   **Request Body**: `{ "name": "..." }`
    *   **Response**: `{ "success": true, "message": "...", "data": { "user": { ... } } }`
*   `PUT /api/users/:id/password`
    *   **Description**: Change the authenticated user's password.
    *   **Headers**: `Authorization: Bearer <token>`
    *   **Request Body**: `{ "currentPassword": "...", "newPassword": "..." }`
    *   **Response**: `{ "success": true, "message": "..." }`
*   `DELETE /api/users/:id`
    *   **Description**: Delete the authenticated user's account. **This action is irreversible.**
    *   **Headers**: `Authorization: Bearer <token>`
    *   **Response**: `{ "success": true, "message": "..." }`
*   `GET /api/users/me/tasks`
    *   **Description**: Get all tasks for the authenticated user.
    *   **Headers**: `Authorization: Bearer <token>`
    *   **Response**: `{ "success": true, "message": "...", "data": { "tasks": [{ ...task1 }, { ...task2 }] } }`
*   `POST /api/users/me/tasks`
    *   **Description**: Create a new task for the authenticated user.
    *   **Headers**: `Authorization: Bearer <token>`
    *   **Request Body**: `{ "title": "...", "description": "...", "dueDate": "YYYY-MM-DD", "status": "pending" }`
    *   **Response**: `{ "success": true, "message": "...", "data": { "task": { ...newTask } } }`
*   `PUT /api/users/me/tasks/:task_id`
    *   **Description**: Update a specific task for the authenticated user.
    *   **Headers**: `Authorization: Bearer <token>`
    *   **Request Body**: `{ "title": "...", "description": "...", "dueDate": "YYYY-MM-DD", "status": "completed" }` (partial updates allowed)
    *   **Response**: `{ "success": true, "message": "...", "data": { "task": { ...updatedTask } } }`
*   `DELETE /api/users/me/tasks/:task_id`
    *   **Description**: Delete a specific task for the authenticated user.
    *   **Headers**: `Authorization: Bearer <token>`
    *   **Response**: `{ "success": true, "message": "..." }`

## License

This project is licensed under the ISC License.