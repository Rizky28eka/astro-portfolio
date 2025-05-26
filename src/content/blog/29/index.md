---
title: "Modern Go Development"
summary: "Learn advanced Go concepts, patterns, and best practices for building robust applications"
date: "2025, 05, 20"
draft: false
tags:
  - Go
  - Backend
  - Development
  - Tutorial
---

# Modern Go Development

Go is a statically typed, compiled programming language designed for building simple, reliable, and efficient software. This guide covers advanced concepts, patterns, and best practices for building robust applications.

## Project Setup

### 1. Creating a New Project

```go
// go.mod
module github.com/yourusername/myapp

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/go-sql-driver/mysql v1.7.1
    github.com/golang-jwt/jwt/v5 v5.0.0
    github.com/google/uuid v1.3.1
    github.com/joho/godotenv v1.5.1
    github.com/lib/pq v1.10.9
    github.com/spf13/viper v1.16.0
    go.uber.org/zap v1.26.0
    golang.org/x/crypto v0.14.0
    gorm.io/driver/postgres v1.5.2
    gorm.io/gorm v1.25.4
)
```

### 2. Project Structure

```
myapp/
├── cmd/
│   └── api/
│       └── main.go
├── internal/
│   ├── api/
│   │   ├── handlers/
│   │   ├── middleware/
│   │   └── routes/
│   ├── config/
│   ├── domain/
│   │   ├── models/
│   │   └── repository/
│   ├── service/
│   └── utils/
├── pkg/
│   ├── logger/
│   └── validator/
├── scripts/
├── test/
├── .env
├── .gitignore
└── README.md
```

## Core Features

### 1. HTTP Server

```go
// cmd/api/main.go
package main

import (
    "log"
    "net/http"

    "github.com/gin-gonic/gin"
    "github.com/yourusername/myapp/internal/api/handlers"
    "github.com/yourusername/myapp/internal/api/middleware"
    "github.com/yourusername/myapp/internal/api/routes"
    "github.com/yourusername/myapp/internal/config"
    "github.com/yourusername/myapp/pkg/logger"
)

func main() {
    // Initialize logger
    log := logger.NewLogger()

    // Load configuration
    cfg, err := config.Load()
    if err != nil {
        log.Fatal("Failed to load configuration", err)
    }

    // Initialize router
    router := gin.Default()

    // Apply middleware
    router.Use(middleware.Logger(log))
    router.Use(middleware.Recovery(log))
    router.Use(middleware.CORS())

    // Register routes
    routes.RegisterRoutes(router, handlers.NewHandler(cfg, log))

    // Start server
    log.Info("Starting server", "port", cfg.Server.Port)
    if err := http.ListenAndServe(":"+cfg.Server.Port, router); err != nil {
        log.Fatal("Failed to start server", err)
    }
}
```

### 2. Domain Models

```go
// internal/domain/models/user.go
package models

import (
    "time"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type User struct {
    ID        uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`
    Email     string         `gorm:"uniqueIndex;not null" json:"email"`
    Password  string         `gorm:"not null" json:"-"`
    Name      string         `json:"name"`
    Active    bool           `gorm:"default:true" json:"active"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
    if u.ID == uuid.Nil {
        u.ID = uuid.New()
    }
    return nil
}
```

### 3. Repository Interface

```go
// internal/domain/repository/user.go
package repository

import (
    "context"

    "github.com/yourusername/myapp/internal/domain/models"
)

type UserRepository interface {
    Create(ctx context.Context, user *models.User) error
    GetByID(ctx context.Context, id string) (*models.User, error)
    GetByEmail(ctx context.Context, email string) (*models.User, error)
    Update(ctx context.Context, user *models.User) error
    Delete(ctx context.Context, id string) error
    List(ctx context.Context, offset, limit int) ([]*models.User, error)
}
```

## API Layer

### 1. Handlers

```go
// internal/api/handlers/user.go
package handlers

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "github.com/yourusername/myapp/internal/domain/models"
    "github.com/yourusername/myapp/internal/service"
)

type UserHandler struct {
    userService *service.UserService
}

func NewUserHandler(userService *service.UserService) *UserHandler {
    return &UserHandler{
        userService: userService,
    }
}

func (h *UserHandler) Create(c *gin.Context) {
    var user models.User
    if err := c.ShouldBindJSON(&user); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if err := h.userService.Create(c.Request.Context(), &user); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, user)
}

func (h *UserHandler) GetByID(c *gin.Context) {
    id := c.Param("id")
    user, err := h.userService.GetByID(c.Request.Context(), id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }

    c.JSON(http.StatusOK, user)
}

func (h *UserHandler) Update(c *gin.Context) {
    id := c.Param("id")
    var user models.User
    if err := c.ShouldBindJSON(&user); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    user.ID = uuid.MustParse(id)
    if err := h.userService.Update(c.Request.Context(), &user); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, user)
}

func (h *UserHandler) Delete(c *gin.Context) {
    id := c.Param("id")
    if err := h.userService.Delete(c.Request.Context(), id); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.Status(http.StatusNoContent)
}

func (h *UserHandler) List(c *gin.Context) {
    offset := c.DefaultQuery("offset", "0")
    limit := c.DefaultQuery("limit", "10")

    users, err := h.userService.List(c.Request.Context(), offset, limit)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, users)
}
```

### 2. Middleware

```go
// internal/api/middleware/auth.go
package middleware

import (
    "net/http"
    "strings"

    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
    "github.com/yourusername/myapp/internal/config"
)

func Auth(cfg *config.Config) gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
            c.Abort()
            return
        }

        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || parts[0] != "Bearer" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header"})
            c.Abort()
            return
        }

        token, err := jwt.Parse(parts[1], func(token *jwt.Token) (interface{}, error) {
            return []byte(cfg.JWT.Secret), nil
        })

        if err != nil || !token.Valid {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }

        claims, ok := token.Claims.(jwt.MapClaims)
        if !ok {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
            c.Abort()
            return
        }

        c.Set("user_id", claims["sub"])
        c.Next()
    }
}
```

## Service Layer

### 1. User Service

```go
// internal/service/user.go
package service

import (
    "context"
    "errors"

    "github.com/yourusername/myapp/internal/domain/models"
    "github.com/yourusername/myapp/internal/domain/repository"
    "golang.org/x/crypto/bcrypt"
)

type UserService struct {
    userRepo repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) *UserService {
    return &UserService{
        userRepo: userRepo,
    }
}

func (s *UserService) Create(ctx context.Context, user *models.User) error {
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
    if err != nil {
        return err
    }
    user.Password = string(hashedPassword)

    return s.userRepo.Create(ctx, user)
}

func (s *UserService) GetByID(ctx context.Context, id string) (*models.User, error) {
    return s.userRepo.GetByID(ctx, id)
}

func (s *UserService) GetByEmail(ctx context.Context, email string) (*models.User, error) {
    return s.userRepo.GetByEmail(ctx, email)
}

func (s *UserService) Update(ctx context.Context, user *models.User) error {
    if user.Password != "" {
        hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
        if err != nil {
            return err
        }
        user.Password = string(hashedPassword)
    }

    return s.userRepo.Update(ctx, user)
}

func (s *UserService) Delete(ctx context.Context, id string) error {
    return s.userRepo.Delete(ctx, id)
}

func (s *UserService) List(ctx context.Context, offset, limit int) ([]*models.User, error) {
    return s.userRepo.List(ctx, offset, limit)
}

func (s *UserService) Authenticate(ctx context.Context, email, password string) (*models.User, error) {
    user, err := s.userRepo.GetByEmail(ctx, email)
    if err != nil {
        return nil, errors.New("invalid credentials")
    }

    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
        return nil, errors.New("invalid credentials")
    }

    return user, nil
}
```

## Database Layer

### 1. GORM Implementation

```go
// internal/infrastructure/database/user.go
package database

import (
    "context"

    "github.com/yourusername/myapp/internal/domain/models"
    "github.com/yourusername/myapp/internal/domain/repository"
    "gorm.io/gorm"
)

type userRepository struct {
    db *gorm.DB
}

func NewUserRepository(db *gorm.DB) repository.UserRepository {
    return &userRepository{
        db: db,
    }
}

func (r *userRepository) Create(ctx context.Context, user *models.User) error {
    return r.db.WithContext(ctx).Create(user).Error
}

func (r *userRepository) GetByID(ctx context.Context, id string) (*models.User, error) {
    var user models.User
    if err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error; err != nil {
        return nil, err
    }
    return &user, nil
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
    var user models.User
    if err := r.db.WithContext(ctx).First(&user, "email = ?", email).Error; err != nil {
        return nil, err
    }
    return &user, nil
}

func (r *userRepository) Update(ctx context.Context, user *models.User) error {
    return r.db.WithContext(ctx).Save(user).Error
}

func (r *userRepository) Delete(ctx context.Context, id string) error {
    return r.db.WithContext(ctx).Delete(&models.User{}, "id = ?", id).Error
}

func (r *userRepository) List(ctx context.Context, offset, limit int) ([]*models.User, error) {
    var users []*models.User
    if err := r.db.WithContext(ctx).Offset(offset).Limit(limit).Find(&users).Error; err != nil {
        return nil, err
    }
    return users, nil
}
```

## Testing

### 1. Unit Tests

```go
// internal/service/user_test.go
package service

import (
    "context"
    "testing"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
    "github.com/yourusername/myapp/internal/domain/models"
)

type MockUserRepository struct {
    mock.Mock
}

func (m *MockUserRepository) Create(ctx context.Context, user *models.User) error {
    args := m.Called(ctx, user)
    return args.Error(0)
}

func (m *MockUserRepository) GetByID(ctx context.Context, id string) (*models.User, error) {
    args := m.Called(ctx, id)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*models.User), args.Error(1)
}

func TestUserService_Create(t *testing.T) {
    mockRepo := new(MockUserRepository)
    service := NewUserService(mockRepo)

    user := &models.User{
        Email:    "test@example.com",
        Password: "password123",
        Name:     "Test User",
    }

    mockRepo.On("Create", mock.Anything, mock.AnythingOfType("*models.User")).Return(nil)

    err := service.Create(context.Background(), user)
    assert.NoError(t, err)
    assert.NotEmpty(t, user.ID)
    assert.NotEqual(t, "password123", user.Password)
}

func TestUserService_Authenticate(t *testing.T) {
    mockRepo := new(MockUserRepository)
    service := NewUserService(mockRepo)

    hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
    user := &models.User{
        ID:       uuid.New(),
        Email:    "test@example.com",
        Password: string(hashedPassword),
        Name:     "Test User",
    }

    mockRepo.On("GetByEmail", mock.Anything, "test@example.com").Return(user, nil)

    authenticatedUser, err := service.Authenticate(context.Background(), "test@example.com", "password123")
    assert.NoError(t, err)
    assert.Equal(t, user.ID, authenticatedUser.ID)
}
```

### 2. Integration Tests

```go
// test/integration/user_test.go
package integration

import (
    "context"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
    "github.com/yourusername/myapp/internal/api/handlers"
    "github.com/yourusername/myapp/internal/config"
    "github.com/yourusername/myapp/internal/infrastructure/database"
    "github.com/yourusername/myapp/internal/service"
)

func TestUserAPI(t *testing.T) {
    // Setup
    gin.SetMode(gin.TestMode)
    router := gin.New()

    cfg, err := config.Load()
    assert.NoError(t, err)

    db, err := database.NewConnection(cfg.Database)
    assert.NoError(t, err)

    userRepo := database.NewUserRepository(db)
    userService := service.NewUserService(userRepo)
    userHandler := handlers.NewUserHandler(userService)

    router.POST("/users", userHandler.Create)
    router.GET("/users/:id", userHandler.GetByID)

    // Test Create User
    t.Run("Create User", func(t *testing.T) {
        w := httptest.NewRecorder()
        req, _ := http.NewRequest("POST", "/users", strings.NewReader(`{
            "email": "test@example.com",
            "password": "password123",
            "name": "Test User"
        }`))
        req.Header.Set("Content-Type", "application/json")
        router.ServeHTTP(w, req)

        assert.Equal(t, http.StatusCreated, w.Code)
        var response map[string]interface{}
        err := json.Unmarshal(w.Body.Bytes(), &response)
        assert.NoError(t, err)
        assert.NotEmpty(t, response["id"])
        assert.Equal(t, "test@example.com", response["email"])
    })

    // Test Get User
    t.Run("Get User", func(t *testing.T) {
        w := httptest.NewRecorder()
        req, _ := http.NewRequest("GET", "/users/1", nil)
        router.ServeHTTP(w, req)

        assert.Equal(t, http.StatusOK, w.Code)
        var response map[string]interface{}
        err := json.Unmarshal(w.Body.Bytes(), &response)
        assert.NoError(t, err)
        assert.Equal(t, "test@example.com", response["email"])
    })
}
```

## Best Practices

### 1. Code Organization

- Follow clean architecture principles
- Use dependency injection
- Implement proper error handling
- Write clean and maintainable code
- Follow consistent naming conventions

### 2. Performance

- Use goroutines for concurrency
- Implement proper connection pooling
- Optimize database queries
- Monitor memory usage
- Profile your application regularly

## Conclusion

Go offers:

- Simple and efficient syntax
- Built-in concurrency support
- Excellent performance
- Strong standard library
- Great tooling support

Remember to:

- Follow best practices
- Write tests
- Optimize performance
- Handle errors properly
- Keep learning and improving

Happy Go development!
