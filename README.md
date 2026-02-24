# Support Ticket Management API

A RESTful backend API for a helpdesk system with role-based access control, ticket lifecycle management, and secure authentication.

---

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Core Features](#core-features)
- [Role-Based Access Control](#role-based-access-control)
- [Ticket Lifecycle](#ticket-lifecycle)
- [Database Models](#database-models)
- [Setup Instructions](#setup-instructions)
- [Testing](#testing)
- [HTTP Status Codes](#http-status-codes)

---

## Overview

This project provides a structured helpdesk backend where employees can submit support tickets, support staff manage their assigned work, and managers oversee the full workflow. The system enforces authentication, role-based permissions, input validation, and strict ticket state transitions.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB + Mongoose | Database and ODM |
| JSON Web Token (JWT) | Authentication |
| bcrypt | Password hashing |
| express-validator | Input validation |

---

## Core Features

### Authentication

- Users authenticate via email and password.
- Passwords are hashed using bcrypt before storage.
- A JWT token is returned on successful login.
- All protected routes require a valid `Authorization` header with a Bearer token.

### Ticket Management

| Role | Permissions |
|---|---|
| MANAGER | Create tickets, view all tickets |
| SUPPORT | View tickets assigned to them |
| USER | Create tickets, view their own tickets |

### Comments

Comments can be added to a ticket by:
- Any MANAGER
- A SUPPORT user assigned to the ticket
- The USER who created the ticket

Comments can be edited or deleted by the original author or any MANAGER.

### Assignment Rules

- Tickets may only be assigned to users with the SUPPORT or MANAGER role.
- Tickets cannot be assigned to users with the USER role.

---

## Role-Based Access Control

Three roles are defined and enforced at the API layer:

- `MANAGER` — Full access across all tickets and users.
- `SUPPORT` — Access limited to assigned tickets.
- `USER` — Access limited to self-created tickets.

---

## Ticket Lifecycle

Status transitions are strictly forward-only and enforced by the API:

```
OPEN → IN_PROGRESS → RESOLVED → CLOSED
```

Every status change is recorded in the `TicketStatusLogs` collection, capturing the old status, new status, the user who made the change, and the timestamp.

Invalid transitions return `HTTP 400`.

---

## Validation Rules

- Title must be at least 5 characters.
- Description must be at least 10 characters.
- Status must be one of: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`.
- Priority must be one of: `LOW`, `MEDIUM`, `HIGH`.

---

## Database Models

### Users
| Field | Description |
|---|---|
| name | Full name of the user |
| email | Unique email address |
| password | Bcrypt-hashed password |
| role | One of: MANAGER, SUPPORT, USER |
| createdAt | Timestamp |

### Tickets
| Field | Description |
|---|---|
| title | Short description of the issue |
| description | Detailed explanation |
| status | Current lifecycle status |
| priority | LOW, MEDIUM, or HIGH |
| createdBy | Reference to the creating user |
| assignedTo | Reference to the assigned SUPPORT/MANAGER user |
| createdAt | Timestamp |

### TicketComments
| Field | Description |
|---|---|
| ticket | Reference to the ticket |
| user | Reference to the commenter |
| comment | Comment text |
| createdAt | Timestamp |

### TicketStatusLogs
| Field | Description |
|---|---|
| ticket | Reference to the ticket |
| oldStatus | Previous status |
| newStatus | New status |
| changedBy | Reference to the user who made the change |
| changedAt | Timestamp |

---

## Setup Instructions

**1. Install dependencies**

```bash
npm install
```

**2. Configure environment variables**

Create a `.env` file in the project root:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

**3. Start the server**

```bash
npm start
```

The server will be available at `http://localhost:3000`.

---

## Testing

The API can be tested using Postman or any HTTP client. The recommended testing flow is:

1. Login as MANAGER to obtain a JWT token.
2. Create SUPPORT and USER accounts.
3. Test ticket creation with both USER and MANAGER roles.
4. Test ticket assignment and verify role restrictions are enforced.
5. Test status transitions in sequence and verify invalid transitions are rejected.
6. Test comment permissions for each role.
7. Verify correct HTTP status codes are returned for unauthorized and forbidden operations.

---

## HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request (validation error or invalid transition) |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (insufficient role permissions) |
| 404 | Not Found |

---

Built following REST principles with proper authentication, input validation, and role-based access control enforcement.
