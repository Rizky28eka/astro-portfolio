---
title: "Modern Mobile App Architecture Patterns"
summary: "Explore different architecture patterns for mobile applications, including Clean Architecture, MVVM, and MVI with practical examples"
date: "2025, 05, 20"
draft: false
tags:
  - Architecture
  - Mobile Development
  - iOS
  - Android
  - Tutorial
---

# Modern Mobile App Architecture Patterns

Choosing the right architecture pattern is crucial for building maintainable, scalable, and testable mobile applications. This guide explores various architecture patterns and their implementations.

## Clean Architecture

### Domain Layer

```kotlin
// Android (Kotlin)
interface UserRepository {
    suspend fun getUser(id: Int): User
    suspend fun saveUser(user: User)
}

data class User(
    val id: Int,
    val name: String,
    val email: String
)

class GetUserUseCase @Inject constructor(
    private val repository: UserRepository
) {
    suspend operator fun invoke(id: Int): User {
        return repository.getUser(id)
    }
}
```

```swift
// iOS (Swift)
protocol UserRepository {
    func getUser(id: Int) async throws -> User
    func saveUser(_ user: User) async throws
}

struct User {
    let id: Int
    let name: String
    let email: String
}

class GetUserUseCase {
    private let repository: UserRepository

    init(repository: UserRepository) {
        self.repository = repository
    }

    func execute(id: Int) async throws -> User {
        return try await repository.getUser(id: id)
    }
}
```

### Presentation Layer

```kotlin
// Android (Kotlin)
class UserViewModel @Inject constructor(
    private val getUserUseCase: GetUserUseCase
) : ViewModel() {
    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user.asStateFlow()

    fun loadUser(id: Int) {
        viewModelScope.launch {
            try {
                _user.value = getUserUseCase(id)
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}
```

```swift
// iOS (Swift)
class UserViewModel: ObservableObject {
    @Published private(set) var user: User?
    private let getUserUseCase: GetUserUseCase

    init(getUserUseCase: GetUserUseCase) {
        self.getUserUseCase = getUserUseCase
    }

    func loadUser(id: Int) async {
        do {
            user = try await getUserUseCase.execute(id: id)
        } catch {
            // Handle error
        }
    }
}
```

## MVVM Pattern

### ViewModel Implementation

```kotlin
// Android (Kotlin)
class LoginViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {
    private val _loginState = MutableStateFlow<LoginState>(LoginState.Initial)
    val loginState: StateFlow<LoginState> = _loginState.asStateFlow()

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _loginState.value = LoginState.Loading
            try {
                val result = authRepository.login(email, password)
                _loginState.value = LoginState.Success(result)
            } catch (e: Exception) {
                _loginState.value = LoginState.Error(e.message)
            }
        }
    }
}

sealed class LoginState {
    object Initial : LoginState()
    object Loading : LoginState()
    data class Success(val user: User) : LoginState()
    data class Error(val message: String?) : LoginState()
}
```

```swift
// iOS (Swift)
class LoginViewModel: ObservableObject {
    @Published private(set) var state: LoginState = .initial
    private let authRepository: AuthRepository

    init(authRepository: AuthRepository) {
        self.authRepository = authRepository
    }

    func login(email: String, password: String) async {
        state = .loading
        do {
            let user = try await authRepository.login(email: email, password: password)
            state = .success(user)
        } catch {
            state = .error(error.localizedDescription)
        }
    }
}

enum LoginState {
    case initial
    case loading
    case success(User)
    case error(String)
}
```

## MVI Pattern

### Intent and State

```kotlin
// Android (Kotlin)
sealed class UserIntent {
    data class LoadUser(val id: Int) : UserIntent()
    data class UpdateUser(val user: User) : UserIntent()
}

data class UserState(
    val isLoading: Boolean = false,
    val user: User? = null,
    val error: String? = null
)

class UserViewModel @Inject constructor(
    private val getUserUseCase: GetUserUseCase
) : ViewModel() {
    private val _state = MutableStateFlow(UserState())
    val state: StateFlow<UserState> = _state.asStateFlow()

    fun processIntent(intent: UserIntent) {
        when (intent) {
            is UserIntent.LoadUser -> loadUser(intent.id)
            is UserIntent.UpdateUser -> updateUser(intent.user)
        }
    }

    private fun loadUser(id: Int) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            try {
                val user = getUserUseCase(id)
                _state.value = _state.value.copy(
                    isLoading = false,
                    user = user
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    error = e.message
                )
            }
        }
    }
}
```

## Dependency Injection

### Hilt (Android)

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    @Provides
    @Singleton
    fun provideUserRepository(
        api: ApiService,
        db: AppDatabase
    ): UserRepository {
        return UserRepositoryImpl(api, db)
    }

    @Provides
    @Singleton
    fun provideGetUserUseCase(
        repository: UserRepository
    ): GetUserUseCase {
        return GetUserUseCase(repository)
    }
}
```

### SwiftUI (iOS)

```swift
struct AppContainer {
    let userRepository: UserRepository
    let getUserUseCase: GetUserUseCase

    init() {
        self.userRepository = UserRepositoryImpl()
        self.getUserUseCase = GetUserUseCase(repository: userRepository)
    }
}

@main
struct MyApp: App {
    let container = AppContainer()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(container)
        }
    }
}
```

## Best Practices

### 1. Architecture Principles

- Separation of concerns
- Dependency inversion
- Single responsibility
- Interface segregation

### 2. Code Organization

- Feature-based modules
- Clear package structure
- Consistent naming
- Documentation

### 3. Testing Strategy

- Unit tests for business logic
- Integration tests for repositories
- UI tests for views
- Architecture tests

## Conclusion

Modern mobile app architecture should:

- Be maintainable
- Be testable
- Be scalable
- Follow SOLID principles
- Support team collaboration

Remember to:

- Choose the right pattern
- Keep it simple
- Document decisions
- Review and refactor
- Stay updated

Happy architecting!
