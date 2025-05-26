---
title: "Building RESTful APIs with Express.js"
summary: "Learn how to build scalable and maintainable RESTful APIs using Express.js, including middleware, authentication, and database integration"
date: "2025, 05, 20"
draft: false
tags:
  - Express.js
  - Node.js
  - Web Development
  - API
  - Tutorial
---

# Building RESTful APIs with Express.js

Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for building web applications and APIs. This guide explores how to build production-ready RESTful APIs using Express.js.

## Getting Started

### Project Setup

```bash
# Create new project
mkdir express-api
cd express-api
npm init -y

# Install dependencies
npm install express mongoose dotenv cors helmet
npm install -D nodemon typescript @types/express @types/node
```

### Basic Server Setup

```typescript
// src/index.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Project Structure

```
src/
├── config/
│   └── database.ts
├── controllers/
│   └── userController.ts
├── middleware/
│   ├── auth.ts
│   └── errorHandler.ts
├── models/
│   └── User.ts
├── routes/
│   └── userRoutes.ts
├── services/
│   └── userService.ts
└── index.ts
```

## Database Integration

### MongoDB with Mongoose

```typescript
// src/config/database.ts
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
```

### User Model

```typescript
// src/models/User.ts
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export const User = mongoose.model("User", userSchema);
```

## Authentication

### JWT Authentication

```typescript
// src/middleware/auth.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};
```

## Controllers and Services

### User Controller

```typescript
// src/controllers/userController.ts
import { Request, Response } from "express";
import { UserService } from "../services/userService";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async register(req: Request, res: Response) {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { token, user } = await this.userService.loginUser(req.body);
      res.json({ token, user });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }
}
```

## Routes

### User Routes

```typescript
// src/routes/userRoutes.ts
import { Router } from "express";
import { UserController } from "../controllers/userController";
import { auth } from "../middleware/auth";

const router = Router();
const userController = new UserController();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", auth, userController.getProfile);

export default router;
```

## Error Handling

### Global Error Handler

```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};
```

## Testing

### API Testing with Jest

```typescript
// src/__tests__/user.test.ts
import request from "supertest";
import app from "../index";
import { User } from "../models/User";

describe("User API", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it("should register a new user", async () => {
    const res = await request(app).post("/api/users/register").send({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
  });
});
```

## Best Practices

### 1. Security

- Use helmet for security headers
- Implement rate limiting
- Validate input data
- Use environment variables
- Implement proper error handling

### 2. Performance

- Use compression middleware
- Implement caching
- Optimize database queries
- Use proper indexing

### 3. Code Organization

- Follow MVC pattern
- Use dependency injection
- Implement proper logging
- Write clean, maintainable code

## Deployment

### Production Setup

```typescript
// src/index.ts
if (process.env.NODE_ENV === "production") {
  app.use(express.static("public"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "public", "index.html"));
  });
}
```

## Conclusion

Express.js offers:

- Minimal and flexible framework
- Rich middleware ecosystem
- Easy integration with databases
- Great community support
- Excellent documentation

Remember to:

- Follow best practices
- Implement proper security
- Write tests
- Document your API
- Monitor performance

Happy Express.js development!
