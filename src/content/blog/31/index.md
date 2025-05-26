---
title: "Modern TypeScript Development"
summary: "Learn advanced TypeScript concepts, patterns, and best practices for building robust applications"
date: "2025, 05, 20"
draft: false
tags:
  - TypeScript
---

# Modern TypeScript Development

TypeScript is a strongly typed programming language that builds on JavaScript. This guide covers advanced concepts, patterns, and best practices for building robust applications.

## Project Setup

### 1. Creating a New Project

```json
// package.json
{
  "name": "myapp",
  "version": "1.0.0",
  "description": "TypeScript Application",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn src/index.ts",
    "build": "tsc",
    "test": "jest",
    "lint": "eslint . --ext .ts",
    "format": "prettier --write \"src/**/*.ts\""
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5",
    "helmet": "^6.0.1",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.21.4",
    "winston": "^3.8.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^18.15.0",
    "@types/cors": "^2.8.13",
    "@types/jsonwebtoken": "^9.0.1",
    "@types/bcryptjs": "^2.4.2",
    "@types/jest": "^29.5.0",
    "@typescript-eslint/eslint-plugin": "^5.54.0",
    "@typescript-eslint/parser": "^5.54.0",
    "eslint": "^8.35.0",
    "prettier": "^2.8.4",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0"
  }
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 2. Project Structure

```
myapp/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── types/
│   ├── utils/
│   └── index.ts
├── tests/
├── .env
├── .eslintrc.js
├── .prettierrc
├── jest.config.js
└── README.md
```

## Core Features

### 1. Type Definitions

```typescript
// src/types/user.ts
import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({
  id: true,
  active: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateUser = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = CreateUserSchema.partial();

export type UpdateUser = z.infer<typeof UpdateUserSchema>;
```

### 2. Models

```typescript
// src/models/user.model.ts
import mongoose, { Document, Schema } from "mongoose";
import { User } from "../types/user";

export interface UserDocument extends User, Document {}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<UserDocument>("User", userSchema);
```

### 3. Services

```typescript
// src/services/user.service.ts
import { UserModel, UserDocument } from "../models/user.model";
import { CreateUser, UpdateUser, User } from "../types/user";
import { AppError } from "../utils/error";
import bcrypt from "bcryptjs";

export class UserService {
  async create(userData: CreateUser): Promise<User> {
    const existingUser = await UserModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError("Email already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await UserModel.create({
      ...userData,
      password: hashedPassword,
    });

    return this.sanitizeUser(user);
  }

  async findById(id: string): Promise<User> {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return this.sanitizeUser(user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return this.sanitizeUser(user);
  }

  async update(id: string, userData: UpdateUser): Promise<User> {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    Object.assign(user, userData);
    await user.save();

    return this.sanitizeUser(user);
  }

  async delete(id: string): Promise<void> {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    await user.delete();
  }

  async list(offset: number, limit: number): Promise<User[]> {
    const users = await UserModel.find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    return users.map(this.sanitizeUser);
  }

  async authenticate(email: string, password: string): Promise<User> {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError("Invalid credentials", 401);
    }

    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: UserDocument): User {
    const { password, ...sanitizedUser } = user.toObject();
    return sanitizedUser;
  }
}
```

### 4. Controllers

```typescript
// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { CreateUserSchema, UpdateUserSchema } from "../types/user";
import { AppError } from "../utils/error";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = CreateUserSchema.parse(req.body);
      const user = await this.userService.create(userData);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.findById(req.params.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = UpdateUserSchema.parse(req.body);
      const user = await this.userService.update(req.params.id, userData);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.userService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 10;
      const users = await this.userService.list(offset, limit);
      res.json(users);
    } catch (error) {
      next(error);
    }
  };

  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new AppError("Email and password are required", 400);
      }
      const user = await this.userService.authenticate(email, password);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };
}
```

### 5. Middleware

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/error";
import { config } from "../config";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Unauthorized", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError("Unauthorized", 401));
  }
};
```

### 6. Routes

```typescript
// src/routes/user.routes.ts
import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { auth } from "../middleware/auth.middleware";

const router = Router();
const userController = new UserController();

router.post("/", userController.create);
router.post("/authenticate", userController.authenticate);

router.use(auth);

router.get("/", userController.list);
router.get("/:id", userController.getById);
router.put("/:id", userController.update);
router.delete("/:id", userController.delete);

export default router;
```

### 7. Error Handling

```typescript
// src/utils/error.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import { logger } from "../utils/logger";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message,
    });
  }

  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};
```

## Testing

### 1. Unit Tests

```typescript
// src/services/user.service.test.ts
import { UserService } from "./user.service";
import { UserModel } from "../models/user.model";
import { AppError } from "../utils/error";
import bcrypt from "bcryptjs";

jest.mock("../models/user.model");
jest.mock("bcryptjs");

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      const hashedPassword = "hashed_password";
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const mockUser = {
        ...userData,
        password: hashedPassword,
        id: "123",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        toObject: () => ({
          ...userData,
          password: hashedPassword,
          id: "123",
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      (UserModel.create as jest.Mock).mockResolvedValue(mockUser);
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await userService.create(userData);

      expect(result).toEqual({
        email: userData.email,
        name: userData.name,
        id: "123",
        active: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("should throw error if email already exists", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      (UserModel.findOne as jest.Mock).mockResolvedValue({});

      await expect(userService.create(userData)).rejects.toThrow(
        new AppError("Email already exists", 400)
      );
    });
  });
});
```

### 2. Integration Tests

```typescript
// tests/user.test.ts
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../src/app";
import { UserModel } from "../src/models/user.model";
import { config } from "../src/config";

beforeAll(async () => {
  await mongoose.connect(config.mongo.uri);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await UserModel.deleteMany({});
});

describe("User API", () => {
  describe("POST /users", () => {
    it("should create a new user", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      const response = await request(app)
        .post("/users")
        .send(userData)
        .expect(201);

      expect(response.body).toEqual({
        id: expect.any(String),
        email: userData.email,
        name: userData.name,
        active: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      const user = await UserModel.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user?.name).toBe(userData.name);
    });

    it("should return 400 if email already exists", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      await UserModel.create(userData);

      const response = await request(app)
        .post("/users")
        .send(userData)
        .expect(400);

      expect(response.body).toEqual({
        status: "error",
        message: "Email already exists",
      });
    });
  });
});
```

## Best Practices

### 1. Code Organization

- Use TypeScript's type system effectively
- Follow SOLID principles
- Implement proper error handling
- Write clean and maintainable code
- Follow consistent naming conventions

### 2. Performance

- Use proper indexing in databases
- Implement caching where appropriate
- Optimize database queries
- Monitor memory usage
- Profile your application regularly

## Conclusion

TypeScript offers:

- Static type checking
- Better IDE support
- Enhanced code maintainability
- Improved developer experience
- Better error catching at compile time

Remember to:

- Follow best practices
- Write tests
- Optimize performance
- Handle errors properly
- Keep learning and improving

Happy TypeScript development!
