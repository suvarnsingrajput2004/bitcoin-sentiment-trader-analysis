# GitHub Profile Analyzer API

A production-ready REST API built with Node.js, Express, and MySQL that retrieves, analyzes, and stores public GitHub profiles and their repository insights.

---

## Features
- **Profile Analysis**: Crawls GitHub user profile metadata and paginates through all repositories to compile deep insights.
- **Repository Metrics**: Automates calculation of total stars, total forks, average stars, most starred repository, and dominant programming language.
- **Persistent Insights**: Caches profile data in MySQL. Re-analyzing updates existing records to prevent duplicates.
- **Security & Safety**: Employs Helmet, CORS, custom express rate limiters, input validation parameters, and centralized standard error middleware.
- **Pagination & Search**: Retrieves stored profiles using query parameters for page, limit, and search filters.

---

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (using connection pool with prepared statements)
- **HTTP Client**: Axios (for external communications)

---

## Project Structure
```
github-profile-analyzer/
├── config/
│   ├── db.js                   # MySQL database connection helper
│   └── config.js               # Application configurations
├── controllers/
│   └── profileController.js    # MVC REST controller methods
├── database/
├── middleware/
│   ├── errorHandler.js         # Centralized error handler
│   ├── rateLimiter.js          # API rate limiter middleware
│   └── validation.js           # Request parameter checking
├── models/
│   └── profileModel.js         # Database CRUD mapping queries
├── routes/
│   └── profileRoutes.js        # API endpoints
├── services/
│   └── githubService.js        # GitHub API crawler & analytics logic
├── .env.example                # Sample environment configuration template
├── package.json                # Project dependencies and run commands
├── README.md                   # Project documentation
├── schema.sql                  # MySQL table setup script
└── server.js                   # Main server entrypoint
```

---

## Installation & Setup

### Prerequisites
- Node.js (version 18 or above recommended)
- MySQL Server running locally or in the cloud

### 1. Clone or Place Project
Extract/clone this project into your workspace directory.

### 2. Install Dependencies
Run the following command inside the `github-profile-analyzer` directory:
```bash
npm install
```

### 3. Setup MySQL Database
Import the database schema using your preferred MySQL CLI client or GUI client (like MySQL Workbench, phpMyAdmin, DBeaver):
```bash
mysql -u root -p < schema.sql
```
*Alternatively, log into your MySQL shell and execute the queries contained inside `schema.sql`.*

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill out your local configurations:
```ini
PORT=5000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=github_analyzer_db

# Optional GITHUB_TOKEN to avoid GitHub public API rate-limiting blocks (60 requests/hr vs 5000 requests/hr)
GITHUB_TOKEN=your_github_personal_access_token
```

### 5. Start the Server
Run in standard mode:
```bash
npm start
```
Run in development mode (using nodemon automatic reloader):
```bash
npm run dev
```

---

## API Documentation

### 1. Analyze GitHub User Profile
- **Endpoint**: `GET /api/analyze/:username`
- **Description**: Fetches the GitHub profile and repository metrics, saves/updates details in MySQL, and returns the result.
- **Example request**: `GET http://localhost:5000/api/analyze/octocat`
- **Response**:
```json
{
  "success": true,
  "message": "GitHub profile for 'octocat' has been successfully analyzed and stored.",
  "data": {
    "id": 1,
    "username": "octocat",
    "name": "The Octocat",
    "bio": "GitHub's mascot",
    "avatar_url": "https://avatars.githubusercontent.com/u/5832347?v=4",
    "profile_url": "https://github.com/octocat",
    "public_repos": 8,
    "followers": 9000,
    "following": 9,
    "created_at": "2011-01-25T18:44:36.000Z",
    "updated_at": "2024-03-22T12:00:00.000Z",
    "account_age_years": 15.37,
    "total_repositories": 8,
    "total_stars": 350,
    "total_forks": 120,
    "most_starred_repository": "Spoon-Knife",
    "most_used_programming_language": "HTML",
    "average_stars_per_repository": 43.75,
    "analyzed_at": "2026-06-08T16:30:00.000Z"
  }
}
```

### 2. Get All Analyzed Profiles
- **Endpoint**: `GET /api/profiles`
- **Query Parameters**:
  - `page` (optional): Current page number (default: `1`)
  - `limit` (optional): Number of records per page (default: `10`, max: `100`)
  - `search` (optional): Search query matching `username` or `name`
- **Example request**: `GET http://localhost:5000/api/profiles?page=1&limit=5&search=octo`
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "octocat",
      "name": "The Octocat",
      ...
    }
  ],
  "pagination": {
    "total_records": 1,
    "current_page": 1,
    "limit": 5,
    "total_pages": 1
  }
}
```

### 3. Get Single Profile by Database ID
- **Endpoint**: `GET /api/profiles/:id`
- **Example request**: `GET http://localhost:5000/api/profiles/1`
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "octocat",
    "name": "The Octocat",
    ...
  }
}
```

### 4. Get Profile by GitHub Username
- **Endpoint**: `GET /api/profiles/username/:username`
- **Example request**: `GET http://localhost:5000/api/profiles/username/octocat`
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "octocat",
    "name": "The Octocat",
    ...
  }
}
```

### 5. Delete Profile by Database ID
- **Endpoint**: `DELETE /api/profiles/:id`
- **Example request**: `DELETE http://localhost:5000/api/profiles/1`
- **Response**:
```json
{
  "success": true,
  "message": "Profile with ID 1 successfully deleted."
}
```

---

## Deployment Instructions

### Deploy to Render

Render supports Node.js web services and Managed MySQL instances (Render PostgreSQL is default, but you can provision standard external MySQL databases, or plug Render into a cloud MySQL provider like Aiven, Clever Cloud, or PlanetScale).

1. **Push your code** to a public or private GitHub repository.
2. Log into the **Render Dashboard**.
3. Create a **New MySQL Web Service** or use an external hosting provider for your DB. Initialize the tables using the `schema.sql` syntax.
4. Create a **New Web Service**:
   - Select your repository.
   - Choose **Node** as the environment runtime.
   - Set **Build Command**: `npm install`
   - Set **Start Command**: `npm start`
5. In the **Environment Variables** configuration tab on Render, add:
   - `PORT` = `10000` (Render binds this port automatically)
   - `DB_HOST` = `<your_database_host>`
   - `DB_USER` = `<your_database_username>`
   - `DB_PASSWORD` = `<your_database_password>`
   - `DB_NAME` = `<your_database_name>`
   - `GITHUB_TOKEN` = `<your_github_token_pat>`
6. Deploy the service.

---

### Deploy to Railway

Railway makes Node.js + MySQL deploys direct and instant.

1. Create a project on the **Railway Dashboard**.
2. Click **New** -> **Database** -> **Add MySQL**. Railway will create and provision an isolated database instance.
3. Import the `schema.sql` definition:
   - Click the MySQL service in your Railway canvas.
   - Open the **Variables** page to retrieve database credentials (`MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`, `MYSQLPORT`).
   - Use a local MySQL client to connect to the provided external connection string and load `schema.sql`.
4. Click **New** -> **GitHub Repo** and connect your repository.
5. In the backend Service settings, map the environment variables to the MySQL instance database variables:
   - Set `DB_HOST` = `${{MySQL.MYSQLHOST}}`
   - Set `DB_USER` = `${{MySQL.MYSQLUSER}}`
   - Set `DB_PASSWORD` = `${{MySQL.MYSQLPASSWORD}}`
   - Set `DB_NAME` = `${{MySQL.MYSQLDATABASE}}`
   - Set `PORT` = `${{PORT}}`
   - Set `GITHUB_TOKEN` = `<your_github_token_pat>`
6. Railway automatically runs `npm install` followed by `npm start`.
