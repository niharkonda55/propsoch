# Splitwise MVP - API Documentation

A complete Splitwise MVP implementation with user management, expense tracking, balance management, and activity logging.

## Project Structure

```
splitwise-mvp/
├── config/
│   └── database.js              # Database configuration
├── models/
│   ├── User.js                  # User model with password hashing
│   ├── Expense.js               # Expense model
│   ├── ExpenseMember.js         # Expense member model (tracks shares)
│   ├── Balance.js               # Balance model (tracks debts)
│   ├── ActivityLog.js           # Activity log model
│   └── index.js                 # Model initialization
├── controllers/
│   ├── UserController.js        # User management logic
│   ├── ExpenseController.js     # Expense management logic
│   ├── BalanceController.js     # Balance management logic
│   └── ActivityLogController.js # Activity log logic
├── routes/
│   ├── users.js                 # User routes
│   ├── expenses.js              # Expense routes
│   ├── balances.js              # Balance routes
│   └── activityLogs.js          # Activity log routes
├── middleware/
│   └── validation.js            # Request validation
├── services/
│   └── EmailService.js          # Email service for reports
├── migrations/                  # Database migrations
├── seeders/                     # Database seeders
├── .env.example                 # Environment variables template
├── .sequelizerc                 # Sequelize configuration
├── package.json                 # Dependencies
└── server.js                    # Main server file
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SQLite3 (or MySQL/PostgreSQL)

### Installation

1. **Clone/Download the project**

```bash
cd splitwise-mvp
```

2. **Install dependencies**

```bash
npm install
```

3. **Create .env file**

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
NODE_ENV=development
PORT=3000
```

4. **Run database migrations**

```bash
npm run db:migrate
```

5. **Seed sample data (optional)**

```bash
npm run db:seed
```

6. **Start the server**

```bash
npm run dev
```

Server will be running on `http://localhost:3000`

## API Endpoints

### Base URL

```
http://localhost:3000/api
```

### Required Headers

All requests (except registration) must include:

```
x-user-id: <integer>
```

---

## User Management

### 1. Register User

**POST** `/users/register`

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "currency": "USD"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "currency": "USD"
  }
}
```

---

### 2. Get User Profile

**GET** `/users/:userId`

Retrieve user profile information.

**Headers:**

```
x-user-id: 1
```

**Response (200):**

```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "currency": "USD",
    "profilePicture": null,
    "phone": "+1234567890",
    "createdAt": "2026-02-24T00:00:00.000Z"
  }
}
```

---

### 3. Update User Profile

**PUT** `/users/:userId`

Update user profile information (email, name, currency, phone, etc.).

**Headers:**

```
x-user-id: 1
```

**Request Body:**

```json
{
  "name": "Jane Doe",
  "currency": "EUR",
  "phone": "+9876543210"
}
```

**Response (200):**

```json
{
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "Jane Doe",
    "currency": "EUR",
    "phone": "+9876543210"
  }
}
```

---

### 4. Change Password

**POST** `/users/:userId/change-password`

Change user password.

**Headers:**

```
x-user-id: 1
```

**Request Body:**

```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response (200):**

```json
{
  "message": "Password changed successfully"
}
```

---

### 5. Delete User Account

**DELETE** `/users/:userId`

Delete (soft delete) user account.

**Headers:**

```
x-user-id: 1
```

**Response (200):**

```json
{
  "message": "Account deleted successfully"
}
```

---

## Expenses

### 1. Create Expense

**POST** `/expenses`

Create a new expense with members.

**Headers:**

```
x-user-id: 1
```

**Request Body:**

```json
{
  "name": "Dinner",
  "amount": 120.5,
  "currency": "USD",
  "description": "Dinner with friends",
  "category": "Food",
  "expenseDate": "2026-02-24",
  "members": [
    {
      "userId": 1,
      "shareAmount": 40.17,
      "shareType": "amount"
    },
    {
      "userId": 2,
      "shareAmount": 40.17,
      "shareType": "amount"
    },
    {
      "userId": 3,
      "shareAmount": 40.16,
      "shareType": "amount"
    }
  ]
}
```

### 2. Get All Expenses

**GET** `/expenses?limit=10&offset=0&category=Food&startDate=2026-01-01&endDate=2026-02-24`

Get expenses for authenticated user with filtering.

**Headers:**

```
x-user-id: 1
```

**Query Parameters:**

- `limit` (optional): Number of records (default: 10)
- `offset` (optional): Pagination offset (default: 0)
- `category` (optional): Filter by category
- `startDate` (optional): Filter by start date (ISO format)
- `endDate` (optional): Filter by end date (ISO format)

---

### 3. Get Expense Details

**GET** `/expenses/:expenseId`

Get detailed information about a specific expense.

**Headers:**

```
x-user-id: 1
```

---

### 4. Update Expense

**PUT** `/expenses/:expenseId`

Update an expense (only creator can update).

**Headers:**

```
x-user-id: 1
```

**Request Body:**

```json
{
  "name": "Dinner Updated",
  "amount": 130.0,
  "members": [
    {
      "userId": 1,
      "shareAmount": 65
    },
    {
      "userId": 2,
      "shareAmount": 65
    }
  ]
}
```

### 5. Delete Expense

**DELETE** `/expenses/:expenseId`

Delete an expense (soft delete, only creator can delete).

**Headers:**

```
x-user-id: 1
```

## Balances

### 1. Get All Balances

**GET** `/balances`

Get all balances for the authenticated user.

**Headers:**

```
x-user-id: 1
```

### 2. Get Balance with Specific User

**GET** `/balances/:otherUserId`

Get balance details between two users.

**Headers:**

```
x-user-id: 1
```

### 3. Get Settlements Needed

**GET** `/balances/settlements/all`

Get all non-zero balances (settlements needed).

**Headers:**

```
x-user-id: 1
```

### 4. Settle Balance

**POST** `/balances/settle`

Mark a portion of balance as settled/paid.

**Headers:**

```
x-user-id: 1
```

**Request Body:**

```json
{
  "otherUserId": 2,
  "amount": 40.17
}
```

**Response (200):**

## Activity Logs

### 1. Get Activity Logs (Grouped)

**GET** `/activity-logs?groupBy=month&startDate=2026-01-01&endDate=2026-12-31`

Get activity logs with grouping by month, week, or date.

**Headers:**

```
x-user-id: 1
```

**Query Parameters:**

- `groupBy` (optional): "month", "week", "date" or leave empty for all (default: "month")
- `startDate` (optional): ISO date format
- `endDate` (optional): ISO date format

### 2. Get Current Month Logs

**GET** `/activity-logs/current-month`

Get activity logs for the current month.

**Headers:**

```
x-user-id: 1
```

**Response (200):**

---

### 3. Get Last Month Logs

**GET** `/activity-logs/last-month`

Get activity logs for the previous month.

**Headers:**

```
x-user-id: 1
```

**Response (200):**

---

### 4. Get Custom Period Logs

**GET** `/activity-logs/custom?startDate=2026-01-01&endDate=2026-02-24`

Get activity logs for a custom date range.

**Headers:**

```
x-user-id: 1
```

**Query Parameters:**

- `startDate` (required): ISO date format
- `endDate` (required): ISO date format
