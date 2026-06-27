# Polytechnic Library API

A secure RESTful API for managing library operations with Microsoft SQL Server, JWT authentication, and role-based authorization.

## Features

- 🔐 **JWT Authentication** - Secure login with token-based authentication
- 👤 **User Registration** - Register as member or librarian with password hashing
- 📚 **Book Management** - View books with availability status
- 🔑 **Role-Based Authorization** - Member and Librarian role permissions
- 💾 **MSSQL Database** - Microsoft SQL Server with stored procedures
- 🛡️ **Security** - Password hashing, JWT tokens, helmet security headers

## Role Permissions

| Feature | Member | Librarian |
|---------|--------|-----------|
| Register Account | ✅ | ✅ |
| Login | ✅ | ✅ |
| View Books | ✅ | ✅ |
| View Book Details | ✅ | ✅ |
| Update Book Availability | ❌ | ✅ |
| Create New Book | ❌ | ✅ |

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Microsoft SQL Server
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Security**: Helmet, CORS
- **Other**: dotenv, mssql

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Microsoft SQL Server (2017 or higher)
- SQL Server Management Studio (optional)

## Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd PolytechnicLibraryAPI
