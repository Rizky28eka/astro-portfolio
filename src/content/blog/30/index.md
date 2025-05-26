---
title: "Modern Rust Development"
summary: "Learn advanced Rust concepts, patterns, and best practices for building robust applications"
date: "2025, 05, 20"
draft: false
tags:
  - Rust
---

# Modern Rust Development

Rust is a systems programming language focused on safety, speed, and concurrency. This guide covers advanced concepts, patterns, and best practices for building robust applications.

## Project Setup

### 1. Creating a New Project

```toml
# Cargo.toml
[package]
name = "myapp"
version = "0.1.0"
edition = "2021"

[dependencies]
tokio = { version = "1.28", features = ["full"] }
axum = "0.6"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
sqlx = { version = "0.7", features = ["runtime-tokio-rustls", "postgres", "uuid", "chrono"] }
tower = "0.4"
tower-http = { version = "0.4", features = ["trace"] }
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
uuid = { version = "1.3", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }
jsonwebtoken = "8.3"
bcrypt = "0.15"
dotenv = "0.15"
config = "0.13"
validator = { version = "0.16", features = ["derive"] }
thiserror = "1.0"
anyhow = "1.0"
```

### 2. Project Structure

```
myapp/
├── src/
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
├── tests/
├── .env
├── .gitignore
└── README.md
```

## Core Features

### 1. HTTP Server

```rust
// src/main.rs
use axum::{
    routing::{get, post},
    Router,
};
use std::net::SocketAddr;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod api;
mod config;
mod domain;
mod service;
mod utils;

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load configuration
    let config = config::load().expect("Failed to load configuration");

    // Build application
    let app = Router::new()
        .route("/health", get(health_check))
        .merge(api::routes::user_routes())
        .layer(TraceLayer::new_for_http());

    // Run server
    let addr = SocketAddr::from(([127, 0, 0, 1], config.server.port));
    tracing::info!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn health_check() -> &'static str {
    "healthy"
}
```

### 2. Domain Models

```rust
// src/domain/models/user.rs
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct User {
    pub id: Uuid,
    #[validate(email)]
    pub email: String,
    #[serde(skip_serializing)]
    pub password: String,
    pub name: String,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateUser {
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 8))]
    pub password: String,
    pub name: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateUser {
    #[validate(email)]
    pub email: Option<String>,
    #[validate(length(min = 8))]
    pub password: Option<String>,
    pub name: Option<String>,
    pub active: Option<bool>,
}
```

### 3. Repository Trait

```rust
// src/domain/repository/user.rs
use async_trait::async_trait;
use uuid::Uuid;

use crate::domain::models::user::{CreateUser, UpdateUser, User};

#[async_trait]
pub trait UserRepository: Send + Sync {
    async fn create(&self, user: CreateUser) -> Result<User, anyhow::Error>;
    async fn find_by_id(&self, id: Uuid) -> Result<Option<User>, anyhow::Error>;
    async fn find_by_email(&self, email: &str) -> Result<Option<User>, anyhow::Error>;
    async fn update(&self, id: Uuid, user: UpdateUser) -> Result<User, anyhow::Error>;
    async fn delete(&self, id: Uuid) -> Result<(), anyhow::Error>;
    async fn list(&self, offset: i64, limit: i64) -> Result<Vec<User>, anyhow::Error>;
}
```

## API Layer

### 1. Handlers

```rust
// src/api/handlers/user.rs
use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;

use crate::{
    domain::models::user::{CreateUser, UpdateUser, User},
    service::user::UserService,
};

pub struct UserHandler {
    user_service: UserService,
}

impl UserHandler {
    pub fn new(user_service: UserService) -> Self {
        Self { user_service }
    }

    pub async fn create(
        State(handler): State<Self>,
        Json(user): Json<CreateUser>,
    ) -> Result<Json<User>, (StatusCode, String)> {
        handler
            .user_service
            .create(user)
            .await
            .map(Json)
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
    }

    pub async fn get_by_id(
        State(handler): State<Self>,
        Path(id): Path<Uuid>,
    ) -> Result<Json<User>, (StatusCode, String)> {
        handler
            .user_service
            .find_by_id(id)
            .await
            .map(Json)
            .map_err(|e| (StatusCode::NOT_FOUND, e.to_string()))
    }

    pub async fn update(
        State(handler): State<Self>,
        Path(id): Path<Uuid>,
        Json(user): Json<UpdateUser>,
    ) -> Result<Json<User>, (StatusCode, String)> {
        handler
            .user_service
            .update(id, user)
            .await
            .map(Json)
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
    }

    pub async fn delete(
        State(handler): State<Self>,
        Path(id): Path<Uuid>,
    ) -> Result<StatusCode, (StatusCode, String)> {
        handler
            .user_service
            .delete(id)
            .await
            .map(|_| StatusCode::NO_CONTENT)
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
    }

    pub async fn list(
        State(handler): State<Self>,
        Path((offset, limit)): Path<(i64, i64)>,
    ) -> Result<Json<Vec<User>>, (StatusCode, String)> {
        handler
            .user_service
            .list(offset, limit)
            .await
            .map(Json)
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
    }
}
```

### 2. Middleware

```rust
// src/api/middleware/auth.rs
use axum::{
    http::{Request, StatusCode},
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use tower::ServiceBuilder;
use tower_http::trace::TraceLayer;

use crate::config::Config;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
}

pub async fn auth<B>(
    State(config): State<Config>,
    req: Request<B>,
    next: Next<B>,
) -> Result<Response, StatusCode> {
    let auth_header = req
        .headers()
        .get("Authorization")
        .and_then(|header| header.to_str().ok())
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let claims = decode::<Claims>(
        token,
        &DecodingKey::from_secret(config.jwt.secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| StatusCode::UNAUTHORIZED)?
    .claims;

    // Add user ID to request extensions
    let mut req = req;
    req.extensions_mut().insert(claims.sub);

    Ok(next.run(req).await)
}

pub fn auth_layer(config: Config) -> TraceLayer<Router> {
    ServiceBuilder::new()
        .layer(TraceLayer::new_for_http())
        .layer(axum::middleware::from_fn_with_state(
            config,
            auth,
        ))
}
```

## Service Layer

### 1. User Service

```rust
// src/service/user.rs
use anyhow::Result;
use bcrypt::{hash, verify, DEFAULT_COST};
use uuid::Uuid;

use crate::{
    domain::{
        models::user::{CreateUser, UpdateUser, User},
        repository::user::UserRepository,
    },
    utils::error::AppError,
};

pub struct UserService<R: UserRepository> {
    user_repo: R,
}

impl<R: UserRepository> UserService<R> {
    pub fn new(user_repo: R) -> Self {
        Self { user_repo }
    }

    pub async fn create(&self, user: CreateUser) -> Result<User> {
        let hashed_password = hash(user.password.as_bytes(), DEFAULT_COST)?;
        let user = CreateUser {
            password: hashed_password,
            ..user
        };
        self.user_repo.create(user).await
    }

    pub async fn find_by_id(&self, id: Uuid) -> Result<User> {
        self.user_repo
            .find_by_id(id)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".into()))
    }

    pub async fn find_by_email(&self, email: &str) -> Result<User> {
        self.user_repo
            .find_by_email(email)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".into()))
    }

    pub async fn update(&self, id: Uuid, user: UpdateUser) -> Result<User> {
        let mut user = user;
        if let Some(password) = user.password {
            user.password = Some(hash(password.as_bytes(), DEFAULT_COST)?);
        }
        self.user_repo.update(id, user).await
    }

    pub async fn delete(&self, id: Uuid) -> Result<()> {
        self.user_repo.delete(id).await
    }

    pub async fn list(&self, offset: i64, limit: i64) -> Result<Vec<User>> {
        self.user_repo.list(offset, limit).await
    }

    pub async fn authenticate(&self, email: &str, password: &str) -> Result<User> {
        let user = self.find_by_email(email).await?;
        if !verify(password, &user.password)? {
            return Err(AppError::Unauthorized("Invalid credentials".into()).into());
        }
        Ok(user)
    }
}
```

## Database Layer

### 1. SQLx Implementation

```rust
// src/infrastructure/database/user.rs
use async_trait::async_trait;
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    domain::{
        models::user::{CreateUser, UpdateUser, User},
        repository::user::UserRepository,
    },
    utils::error::AppError,
};

pub struct PostgresUserRepository {
    pool: PgPool,
}

impl PostgresUserRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl UserRepository for PostgresUserRepository {
    async fn create(&self, user: CreateUser) -> Result<User, anyhow::Error> {
        let user = sqlx::query_as!(
            User,
            r#"
            INSERT INTO users (email, password, name)
            VALUES ($1, $2, $3)
            RETURNING *
            "#,
            user.email,
            user.password,
            user.name
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(user)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<User>, anyhow::Error> {
        let user = sqlx::query_as!(
            User,
            r#"
            SELECT * FROM users WHERE id = $1
            "#,
            id
        )
        .fetch_optional(&self.pool)
        .await?;

        Ok(user)
    }

    async fn find_by_email(&self, email: &str) -> Result<Option<User>, anyhow::Error> {
        let user = sqlx::query_as!(
            User,
            r#"
            SELECT * FROM users WHERE email = $1
            "#,
            email
        )
        .fetch_optional(&self.pool)
        .await?;

        Ok(user)
    }

    async fn update(&self, id: Uuid, user: UpdateUser) -> Result<User, anyhow::Error> {
        let user = sqlx::query_as!(
            User,
            r#"
            UPDATE users
            SET
                email = COALESCE($1, email),
                password = COALESCE($2, password),
                name = COALESCE($3, name),
                active = COALESCE($4, active),
                updated_at = NOW()
            WHERE id = $5
            RETURNING *
            "#,
            user.email,
            user.password,
            user.name,
            user.active,
            id
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(user)
    }

    async fn delete(&self, id: Uuid) -> Result<(), anyhow::Error> {
        sqlx::query!(
            r#"
            DELETE FROM users WHERE id = $1
            "#,
            id
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn list(&self, offset: i64, limit: i64) -> Result<Vec<User>, anyhow::Error> {
        let users = sqlx::query_as!(
            User,
            r#"
            SELECT * FROM users
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
            "#,
            limit,
            offset
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(users)
    }
}
```

## Testing

### 1. Unit Tests

```rust
// src/service/user_test.rs
#[cfg(test)]
mod tests {
    use super::*;
    use mockall::predicate::*;
    use mockall::mock;

    mock! {
        UserRepository {}

        #[async_trait]
        impl UserRepository for UserRepository {
            async fn create(&self, user: CreateUser) -> Result<User, anyhow::Error>;
            async fn find_by_id(&self, id: Uuid) -> Result<Option<User>, anyhow::Error>;
            async fn find_by_email(&self, email: &str) -> Result<Option<User>, anyhow::Error>;
            async fn update(&self, id: Uuid, user: UpdateUser) -> Result<User, anyhow::Error>;
            async fn delete(&self, id: Uuid) -> Result<(), anyhow::Error>;
            async fn list(&self, offset: i64, limit: i64) -> Result<Vec<User>, anyhow::Error>;
        }
    }

    #[tokio::test]
    async fn test_create_user() {
        let mut mock_repo = MockUserRepository::new();
        let service = UserService::new(mock_repo);

        let user = CreateUser {
            email: "test@example.com".to_string(),
            password: "password123".to_string(),
            name: "Test User".to_string(),
        };

        let expected_user = User {
            id: Uuid::new_v4(),
            email: user.email.clone(),
            password: "hashed_password".to_string(),
            name: user.name.clone(),
            active: true,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        mock_repo
            .expect_create()
            .with(eq(user.clone()))
            .returning(move |_| Ok(expected_user.clone()));

        let result = service.create(user).await;
        assert!(result.is_ok());
        let user = result.unwrap();
        assert_eq!(user.email, "test@example.com");
        assert_eq!(user.name, "Test User");
    }

    #[tokio::test]
    async fn test_authenticate_user() {
        let mut mock_repo = MockUserRepository::new();
        let service = UserService::new(mock_repo);

        let hashed_password = hash("password123", DEFAULT_COST).unwrap();
        let user = User {
            id: Uuid::new_v4(),
            email: "test@example.com".to_string(),
            password: hashed_password,
            name: "Test User".to_string(),
            active: true,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        mock_repo
            .expect_find_by_email()
            .with(eq("test@example.com"))
            .returning(move |_| Ok(Some(user.clone())));

        let result = service
            .authenticate("test@example.com", "password123")
            .await;
        assert!(result.is_ok());
        let user = result.unwrap();
        assert_eq!(user.email, "test@example.com");
    }
}
```

### 2. Integration Tests

```rust
// tests/user_test.rs
use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use tower::ServiceExt;
use uuid::Uuid;

use myapp::{
    api::routes::user_routes,
    config::Config,
    domain::models::user::CreateUser,
    infrastructure::database::PostgresUserRepository,
    service::user::UserService,
};

#[tokio::test]
async fn test_create_user() {
    let config = Config::load().unwrap();
    let pool = sqlx::PgPool::connect(&config.database.url)
        .await
        .unwrap();

    let user_repo = PostgresUserRepository::new(pool);
    let user_service = UserService::new(user_repo);
    let app = user_routes(user_service);

    let user = CreateUser {
        email: "test@example.com".to_string(),
        password: "password123".to_string(),
        name: "Test User".to_string(),
    };

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/users")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&user).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::CREATED);

    let body = hyper::body::to_bytes(response.into_body()).await.unwrap();
    let user: User = serde_json::from_slice(&body).unwrap();
    assert_eq!(user.email, "test@example.com");
    assert_eq!(user.name, "Test User");
}

#[tokio::test]
async fn test_get_user() {
    let config = Config::load().unwrap();
    let pool = sqlx::PgPool::connect(&config.database.url)
        .await
        .unwrap();

    let user_repo = PostgresUserRepository::new(pool);
    let user_service = UserService::new(user_repo);
    let app = user_routes(user_service);

    let user = CreateUser {
        email: "test@example.com".to_string(),
        password: "password123".to_string(),
        name: "Test User".to_string(),
    };

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/users")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&user).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    let body = hyper::body::to_bytes(response.into_body()).await.unwrap();
    let user: User = serde_json::from_slice(&body).unwrap();

    let response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri(format!("/users/{}", user.id))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = hyper::body::to_bytes(response.into_body()).await.unwrap();
    let user: User = serde_json::from_slice(&body).unwrap();
    assert_eq!(user.email, "test@example.com");
    assert_eq!(user.name, "Test User");
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

- Use async/await for I/O operations
- Implement proper connection pooling
- Optimize database queries
- Monitor memory usage
- Profile your application regularly

## Conclusion

Rust offers:

- Memory safety without garbage collection
- Thread safety without data races
- Zero-cost abstractions
- Great performance
- Strong type system

Remember to:

- Follow best practices
- Write tests
- Optimize performance
- Handle errors properly
- Keep learning and improving

Happy Rust development!
