---
title: "Modern Python Development"
summary: "Learn advanced Python concepts, patterns, and best practices for building robust applications"
date: "2025, 05, 20"
draft: false
tags:
  - Python
---

# Modern Python Development

Python is a versatile and powerful programming language. This guide covers advanced concepts, patterns, and best practices for building robust applications.

## Project Setup

### 1. Creating a New Project

```python
# pyproject.toml
[tool.poetry]
name = "myapp"
version = "0.1.0"
description = "A modern Python application"
authors = ["Your Name <your.email@example.com>"]

[tool.poetry.dependencies]
python = "^3.9"
fastapi = "^0.100.0"
uvicorn = "^0.22.0"
sqlalchemy = "^2.0.0"
pydantic = "^2.0.0"
alembic = "^1.11.0"
pytest = "^7.4.0"
black = "^23.7.0"
isort = "^5.12.0"
mypy = "^1.5.0"

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"
```

### 2. Project Structure

```
myapp/
├── src/
│   ├── myapp/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes/
│   │   │   └── dependencies.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   └── session.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── user.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── user.py
│   │   └── services/
│   │       ├── __init__.py
│   │       └── user.py
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py
│       └── test_api/
└── alembic/
    ├── versions/
    └── env.py
```

## Core Features

### 1. FastAPI Application

```python
# src/myapp/api/app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from myapp.api.routes import router as api_router
from myapp.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### 2. Database Models

```python
# src/myapp/models/user.py
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from myapp.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    posts = relationship("Post", back_populates="author")
```

### 3. Pydantic Schemas

```python
# src/myapp/schemas/user.py
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str
```

## API Layer

### 1. Routes

```python
# src/myapp/api/routes/users.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from myapp.api.dependencies import get_current_user, get_db
from myapp.schemas.user import User, UserCreate, UserUpdate
from myapp.services.user import user_service

router = APIRouter()

@router.get("/", response_model=List[User])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve users.
    """
    users = user_service.get_multi(db, skip=skip, limit=limit)
    return users

@router.post("/", response_model=User)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate
):
    """
    Create new user.
    """
    user = user_service.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system."
        )
    user = user_service.create(db, obj_in=user_in)
    return user

@router.put("/me", response_model=User)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update own user.
    """
    user = user_service.update(db, db_obj=current_user, obj_in=user_in)
    return user

@router.get("/me", response_model=User)
def read_user_me(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user.
    """
    return current_user
```

### 2. Dependencies

```python
# src/myapp/api/dependencies.py
from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from myapp.core.config import settings
from myapp.core.security import ALGORITHM
from myapp.db.session import SessionLocal
from myapp.schemas.user import User
from myapp.services.user import user_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/login/access-token")

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[ALGORITHM]
        )
        token_data = payload.get("sub")
        if token_data is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Could not validate credentials",
            )
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = user_service.get(db, id=token_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

## Service Layer

### 1. User Service

```python
# src/myapp/services/user.py
from typing import Any, Dict, Optional, Union

from sqlalchemy.orm import Session

from myapp.core.security import get_password_hash, verify_password
from myapp.models.user import User
from myapp.schemas.user import UserCreate, UserUpdate

class UserService:
    def get(self, db: Session, id: int) -> Optional[User]:
        return db.query(User).filter(User.id == id).first()

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> list[User]:
        return db.query(User).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        db_obj = User(
            email=obj_in.email,
            hashed_password=get_password_hash(obj_in.password),
            full_name=obj_in.full_name,
            is_active=obj_in.is_active,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: User,
        obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        if update_data.get("password"):
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
        for field in update_data:
            setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

user_service = UserService()
```

## Database Layer

### 1. Database Configuration

```python
# src/myapp/db/base.py
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# src/myapp/db/session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from myapp.core.config import settings

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

### 2. Migrations

```python
# alembic/env.py
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

from myapp.core.config import settings
from myapp.db.base import Base

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def get_url():
    return settings.SQLALCHEMY_DATABASE_URI

def run_migrations_offline() -> None:
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = get_url()
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

## Testing

### 1. Unit Tests

```python
# src/tests/test_api/test_users.py
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from myapp.core.config import settings
from myapp.tests.utils.user import create_random_user
from myapp.tests.utils.utils import random_email, random_lower_string

def test_create_user(
    client: TestClient, superuser_token_headers: dict, db: Session
) -> None:
    data = {"email": random_email(), "password": random_lower_string()}
    response = client.post(
        f"{settings.API_V1_STR}/users/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["email"] == data["email"]
    assert "id" in content

def test_read_users(
    client: TestClient, superuser_token_headers: dict, db: Session
) -> None:
    user = create_random_user(db)
    response = client.get(
        f"{settings.API_V1_STR}/users/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content) > 0
    assert content[0]["email"] == user.email
```

### 2. Integration Tests

```python
# src/tests/test_api/test_login.py
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from myapp.core.config import settings
from myapp.tests.utils.user import create_random_user
from myapp.tests.utils.utils import random_email, random_lower_string

def test_get_access_token(
    client: TestClient, db: Session
) -> None:
    login_data = {
        "username": random_email(),
        "password": random_lower_string(),
    }
    user = create_random_user(db)
    login_data["username"] = user.email
    response = client.post(
        f"{settings.API_V1_STR}/login/access-token",
        data=login_data,
    )
    tokens = response.json()
    assert response.status_code == 200
    assert "access_token" in tokens
    assert tokens["token_type"] == "bearer"

def test_use_access_token(
    client: TestClient, superuser_token_headers: dict, db: Session
) -> None:
    response = client.post(
        f"{settings.API_V1_STR}/login/test-token",
        headers=superuser_token_headers,
    )
    result = response.json()
    assert response.status_code == 200
    assert "email" in result
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
- Implement proper caching
- Optimize database queries
- Monitor memory usage
- Profile your application regularly

## Conclusion

Python offers:

- Simple and readable syntax
- Rich ecosystem of libraries
- Great community support
- Excellent documentation
- Cross-platform compatibility

Remember to:

- Follow best practices
- Write tests
- Optimize performance
- Handle errors properly
- Keep learning and improving

Happy Python development!
