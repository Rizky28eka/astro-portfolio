---
title: "Building Scalable Backends with Express.js"
summary: "Learn how to build robust and scalable backend applications using Express.js, including middleware, authentication, and database integration"
date: "2025, 05, 20"
draft: false
tags:
  - Express.js
  - Node.js
  - Backend
  - Tutorial
---

# Building Scalable Backends with Express.js

Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for building web applications and APIs. This guide covers essential concepts, best practices, and advanced techniques for building scalable backend applications.

## Project Setup

### 1. Basic Structure

```bash
# Create project
mkdir express-api
cd express-api
npm init -y

# Install dependencies
npm install express mongoose dotenv cors helmet
npm install -D nodemon typescript @types/express @types/node
```

### 2. TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2018",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## Core Application

### 1. Server Setup

```typescript
// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use("/api", routes);

// Error handling
app.use(errorHandler);

export default app;

// src/server.ts
import app from "./app";
import { connectDB } from "./config/database";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
```

### 2. Route Organization

```typescript
// src/routes/index.ts
import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import postRoutes from "./post.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/posts", postRoutes);

export default router;

// src/routes/auth.routes.ts
import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest";
import { authController } from "../controllers/auth.controller";
import { authValidation } from "../validations/auth.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(authValidation.register),
  authController.register
);

router.post(
  "/login",
  validateRequest(authValidation.login),
  authController.login
);

export default router;
```

## Middleware

### 1. Custom Middleware

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError("Invalid token"));
  }
};

// src/middleware/validateRequest.ts
import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";
import { BadRequestError } from "../errors";

export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);

    if (error) {
      throw new BadRequestError(error.details[0].message);
    }

    next();
  };
};
```

### 2. Error Handling

```typescript
// src/errors/index.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(401, message);
  }
}

// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  console.error("Error:", err);
  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};
```

## Controllers

### 1. User Controller

```typescript
// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { catchAsync } from "../utils/catchAsync";

export class UserController {
  constructor(private userService: UserService) {}

  getProfile = catchAsync(async (req: Request, res: Response) => {
    const user = await this.userService.findById(req.user.id);
    res.json({ user });
  });

  updateProfile = catchAsync(async (req: Request, res: Response) => {
    const user = await this.userService.update(req.user.id, req.body);
    res.json({ user });
  });

  deleteProfile = catchAsync(async (req: Request, res: Response) => {
    await this.userService.delete(req.user.id);
    res.status(204).send();
  });
}

// src/utils/catchAsync.ts
import { Request, Response, NextFunction } from "express";

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

### 2. Post Controller

```typescript
// src/controllers/post.controller.ts
import { Request, Response, NextFunction } from "express";
import { PostService } from "../services/post.service";
import { catchAsync } from "../utils/catchAsync";

export class PostController {
  constructor(private postService: PostService) {}

  createPost = catchAsync(async (req: Request, res: Response) => {
    const post = await this.postService.create({
      ...req.body,
      author: req.user.id,
    });
    res.status(201).json({ post });
  });

  getPosts = catchAsync(async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const posts = await this.postService.findAll({
      page: Number(page),
      limit: Number(limit),
    });
    res.json({ posts });
  });

  getPost = catchAsync(async (req: Request, res: Response) => {
    const post = await this.postService.findById(req.params.id);
    res.json({ post });
  });
}
```

## Services

### 1. User Service

```typescript
// src/services/user.service.ts
import { User } from "../models/user.model";
import { NotFoundError } from "../errors";

export class UserService {
  async findById(id: string): Promise<User> {
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await User.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async delete(id: string): Promise<void> {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
  }
}
```

### 2. Post Service

```typescript
// src/services/post.service.ts
import { Post } from "../models/post.model";
import { NotFoundError } from "../errors";

export class PostService {
  async create(data: Partial<Post>): Promise<Post> {
    return Post.create(data);
  }

  async findAll(options: { page: number; limit: number }): Promise<{
    posts: Post[];
    total: number;
  }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("author", "username"),
      Post.countDocuments(),
    ]);

    return { posts, total };
  }

  async findById(id: string): Promise<Post> {
    const post = await Post.findById(id).populate("author", "username");
    if (!post) {
      throw new NotFoundError("Post not found");
    }
    return post;
  }
}
```

## Testing

### 1. Unit Tests

```typescript
// src/__tests__/user.service.test.ts
import { UserService } from "../services/user.service";
import { User } from "../models/user.model";
import { NotFoundError } from "../errors";

jest.mock("../models/user.model");

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe("findById", () => {
    it("should return user if found", async () => {
      const mockUser = { id: "1", username: "test" };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.findById("1");
      expect(result).toEqual(mockUser);
    });

    it("should throw NotFoundError if user not found", async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.findById("1")).rejects.toThrow(NotFoundError);
    });
  });
});
```

### 2. Integration Tests

```typescript
// src/__tests__/auth.test.ts
import request from "supertest";
import app from "../app";
import { User } from "../models/user.model";

describe("Auth Endpoints", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    it("should register new user", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");
    });
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
- Monitor performance

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
