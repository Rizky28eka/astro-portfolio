---
title: "Mocking and Stubbing in Flutter Tests"
summary: "Tutorial on creating effective mocks and stubs for Flutter testing, including dependency injection and test isolation."
date: "2025, 08, 15"
draft: false
tags:
  - flutter
  - mocking
  - stubbing
  - testing
  - dependency-injection
---

## Mocking and Stubbing in Flutter Tests

This guide covers how to create effective mocks and stubs for Flutter testing.

## Basic Mocking

### Using Mockito

```dart
// user_repository.dart
abstract class UserRepository {
  Future<User> getUser(String id);
  Future<List<User>> getUsers();
  Future<void> saveUser(User user);
}

// user_repository_test.dart
@GenerateMocks([UserRepository])
void main() {
  late MockUserRepository mockRepository;
  late UserService userService;

  setUp(() {
    mockRepository = MockUserRepository();
    userService = UserService(mockRepository);
  });

  test('fetches user successfully', () async {
    // Arrange
    final user = User(id: '1', name: 'Test User');
    when(mockRepository.getUser('1'))
        .thenAnswer((_) async => user);

    // Act
    final result = await userService.getUser('1');

    // Assert
    expect(result, equals(user));
    verify(mockRepository.getUser('1')).called(1);
  });
}
```

### Custom Mocks

```dart
class MockHttpClient extends Mock implements HttpClient {
  @override
  Future<HttpClientResponse> get(String url) async {
    if (url.contains('error')) {
      throw HttpException('Network error');
    }
    return MockHttpClientResponse();
  }
}

class MockHttpClientResponse extends Mock implements HttpClientResponse {
  @override
  Future<String> readAsString() async {
    return '{"id": "1", "name": "Test User"}';
  }
}
```

## Stubbing

### Basic Stubs

```dart
class StubUserRepository implements UserRepository {
  @override
  Future<User> getUser(String id) async {
    return User(id: id, name: 'Stub User');
  }

  @override
  Future<List<User>> getUsers() async {
    return [
      User(id: '1', name: 'User 1'),
      User(id: '2', name: 'User 2'),
    ];
  }

  @override
  Future<void> saveUser(User user) async {
    // Do nothing
  }
}
```

### Dynamic Stubs

```dart
class DynamicStubUserRepository implements UserRepository {
  final Map<String, User> _users = {};
  bool _shouldThrow = false;

  void setShouldThrow(bool value) {
    _shouldThrow = value;
  }

  @override
  Future<User> getUser(String id) async {
    if (_shouldThrow) {
      throw Exception('Stub error');
    }
    return _users[id] ?? User(id: id, name: 'Default User');
  }

  @override
  Future<List<User>> getUsers() async {
    if (_shouldThrow) {
      throw Exception('Stub error');
    }
    return _users.values.toList();
  }

  @override
  Future<void> saveUser(User user) async {
    if (_shouldThrow) {
      throw Exception('Stub error');
    }
    _users[user.id] = user;
  }
}
```

## Dependency Injection

### Constructor Injection

```dart
class UserService {
  final UserRepository _repository;
  final CacheService _cache;

  UserService(this._repository, this._cache);

  Future<User> getUser(String id) async {
    final cachedUser = await _cache.getUser(id);
    if (cachedUser != null) {
      return cachedUser;
    }

    final user = await _repository.getUser(id);
    await _cache.saveUser(user);
    return user;
  }
}

// Test
void main() {
  late MockUserRepository mockRepository;
  late MockCacheService mockCache;
  late UserService userService;

  setUp(() {
    mockRepository = MockUserRepository();
    mockCache = MockCacheService();
    userService = UserService(mockRepository, mockCache);
  });

  test('gets user from cache if available', () async {
    final user = User(id: '1', name: 'Test User');
    when(mockCache.getUser('1')).thenAnswer((_) async => user);

    final result = await userService.getUser('1');

    expect(result, equals(user));
    verify(mockCache.getUser('1')).called(1);
    verifyNever(mockRepository.getUser(any));
  });
}
```

### Service Locator

```dart
class ServiceLocator {
  static final _instance = ServiceLocator._();
  final _services = <Type, dynamic>{};

  factory ServiceLocator() => _instance;
  ServiceLocator._();

  void register<T>(T instance) {
    _services[T] = instance;
  }

  T get<T>() {
    return _services[T] as T;
  }
}

// Test setup
void setUpTestDependencies() {
  final mockRepository = MockUserRepository();
  final mockCache = MockCacheService();

  ServiceLocator().register<UserRepository>(mockRepository);
  ServiceLocator().register<CacheService>(mockCache);
}
```

## Test Isolation

### Isolated Tests

```dart
void main() {
  group('UserService', () {
    late MockUserRepository mockRepository;
    late UserService userService;

    setUp(() {
      mockRepository = MockUserRepository();
      userService = UserService(mockRepository);
    });

    test('creates user successfully', () async {
      final user = User(id: '1', name: 'Test User');
      when(mockRepository.saveUser(any))
          .thenAnswer((_) async => user);

      final result = await userService.createUser('Test User');

      expect(result, equals(user));
      verify(mockRepository.saveUser(any)).called(1);
    });

    test('handles repository error', () async {
      when(mockRepository.saveUser(any))
          .thenThrow(Exception('Repository error'));

      expect(
        () => userService.createUser('Test User'),
        throwsA(isA<Exception>()),
      );
    });
  });
}
```

## Best Practices

1. Use meaningful mock names
2. Keep mocks simple
3. Verify mock interactions
4. Isolate tests
5. Use dependency injection
6. Document mock behavior
7. Test error cases

## Common Pitfalls

1. Over-mocking
2. Complex mock setup
3. Missing verifications
4. Test interdependence
5. Unclear mock behavior

## Conclusion

Effective mocking requires:

- Understanding test isolation
- Following best practices
- Proper dependency injection
- Clear mock behavior
- Regular test maintenance

Remember:

- Mock wisely
- Keep it simple
- Verify interactions
- Isolate tests
- Document behavior

Happy Testing!
