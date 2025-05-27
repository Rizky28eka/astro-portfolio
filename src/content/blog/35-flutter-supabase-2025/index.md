---
title: "Building Full-Stack Apps with Flutter and Supabase"
summary: "Comprehensive guide on implementing Supabase in Flutter applications, including authentication, real-time database, and storage features."
date: "2025, 06, 30"
draft: false
tags:
  - flutter
  - supabase
  - full-stack
  - backend
  - real-time
---

## Building Full-Stack Apps with Flutter and Supabase

This guide covers how to implement Supabase in Flutter applications, enabling full-stack development with real-time features.

## Basic Setup

### Dependencies

```yaml
# pubspec.yaml
dependencies:
  supabase_flutter: ^1.0.0
  flutter_secure_storage: ^8.0.0
```

### Supabase Configuration

```dart
class SupabaseConfig {
  static const String url = 'YOUR_SUPABASE_URL';
  static const String anonKey = 'YOUR_SUPABASE_ANON_KEY';

  static Future<void> initialize() async {
    await Supabase.initialize(
      url: url,
      anonKey: anonKey,
      authFlowType: AuthFlowType.pkce,
    );
  }

  static SupabaseClient get client => Supabase.instance.client;
}
```

## Authentication

### Auth Service

```dart
class AuthService {
  final SupabaseClient _client = SupabaseConfig.client;

  Future<AuthResponse> signUp({
    required String email,
    required String password,
  }) async {
    try {
      return await _client.auth.signUp(
        email: email,
        password: password,
      );
    } catch (e) {
      throw AuthException(e.toString());
    }
  }

  Future<AuthResponse> signIn({
    required String email,
    required String password,
  }) async {
    try {
      return await _client.auth.signInWithPassword(
        email: email,
        password: password,
      );
    } catch (e) {
      throw AuthException(e.toString());
    }
  }

  Future<void> signOut() async {
    try {
      await _client.auth.signOut();
    } catch (e) {
      throw AuthException(e.toString());
    }
  }

  Stream<AuthState> get authStateChanges => _client.auth.onAuthStateChange;
}
```

## Database Operations

### Database Service

```dart
class DatabaseService {
  final SupabaseClient _client = SupabaseConfig.client;

  Future<List<Map<String, dynamic>>> getData(String table) async {
    try {
      final response = await _client
          .from(table)
          .select()
          .order('created_at', ascending: false);
      return response;
    } catch (e) {
      throw DatabaseException(e.toString());
    }
  }

  Future<Map<String, dynamic>> insertData(
    String table,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _client
          .from(table)
          .insert(data)
          .select()
          .single();
      return response;
    } catch (e) {
      throw DatabaseException(e.toString());
    }
  }

  Future<Map<String, dynamic>> updateData(
    String table,
    String id,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _client
          .from(table)
          .update(data)
          .eq('id', id)
          .select()
          .single();
      return response;
    } catch (e) {
      throw DatabaseException(e.toString());
    }
  }

  Future<void> deleteData(String table, String id) async {
    try {
      await _client
          .from(table)
          .delete()
          .eq('id', id);
    } catch (e) {
      throw DatabaseException(e.toString());
    }
  }
}
```

## Real-time Subscriptions

### Realtime Service

```dart
class RealtimeService {
  final SupabaseClient _client = SupabaseConfig.client;

  Stream<List<Map<String, dynamic>>> subscribeToTable(String table) {
    return _client
        .from(table)
        .stream(primaryKey: ['id'])
        .map((events) => events);
  }

  Stream<Map<String, dynamic>> subscribeToRow(
    String table,
    String id,
  ) {
    return _client
        .from(table)
        .stream(primaryKey: ['id'])
        .eq('id', id)
        .map((events) => events.first);
  }
}
```

## Storage

### Storage Service

```dart
class StorageService {
  final SupabaseClient _client = SupabaseConfig.client;

  Future<String> uploadFile(
    String bucket,
    String path,
    File file,
  ) async {
    try {
      final response = await _client
          .storage
          .from(bucket)
          .upload(path, file);
      return response;
    } catch (e) {
      throw StorageException(e.toString());
    }
  }

  Future<String> getPublicUrl(
    String bucket,
    String path,
  ) async {
    try {
      final response = await _client
          .storage
          .from(bucket)
          .getPublicUrl(path);
      return response;
    } catch (e) {
      throw StorageException(e.toString());
    }
  }

  Future<void> deleteFile(
    String bucket,
    String path,
  ) async {
    try {
      await _client
          .storage
          .from(bucket)
          .remove([path]);
    } catch (e) {
      throw StorageException(e.toString());
    }
  }
}
```

## State Management

### Supabase BLoC

```dart
class SupabaseBloc extends Bloc<SupabaseEvent, SupabaseState> {
  final AuthService _authService;
  final DatabaseService _dbService;
  final RealtimeService _realtimeService;

  SupabaseBloc(
    this._authService,
    this._dbService,
    this._realtimeService,
  ) : super(SupabaseInitial()) {
    on<SignIn>(_onSignIn);
    on<SignUp>(_onSignUp);
    on<SignOut>(_onSignOut);
    on<FetchData>(_onFetchData);
    on<SubscribeToChanges>(_onSubscribeToChanges);
  }

  Future<void> _onSignIn(
    SignIn event,
    Emitter<SupabaseState> emit,
  ) async {
    emit(SupabaseLoading());
    try {
      await _authService.signIn(
        email: event.email,
        password: event.password,
      );
      emit(SupabaseAuthenticated());
    } catch (e) {
      emit(SupabaseError(e.toString()));
    }
  }

  Future<void> _onFetchData(
    FetchData event,
    Emitter<SupabaseState> emit,
  ) async {
    emit(SupabaseLoading());
    try {
      final data = await _dbService.getData(event.table);
      emit(SupabaseDataLoaded(data));
    } catch (e) {
      emit(SupabaseError(e.toString()));
    }
  }
}
```

## Error Handling

```dart
class SupabaseException implements Exception {
  final String message;

  SupabaseException(this.message);

  @override
  String toString() => 'SupabaseException: $message';
}

class AuthException extends SupabaseException {
  AuthException(String message) : super(message);
}

class DatabaseException extends SupabaseException {
  DatabaseException(String message) : super(message);
}

class StorageException extends SupabaseException {
  StorageException(String message) : super(message);
}
```

## Best Practices

1. Implement proper error handling
2. Use real-time subscriptions efficiently
3. Handle authentication properly
4. Implement proper data validation
5. Use storage efficiently
6. Monitor performance
7. Test all features

## Common Pitfalls

1. Poor error handling
2. Inefficient real-time usage
3. Missing authentication
4. No data validation
5. Storage mismanagement

## Conclusion

Implementing Supabase requires:

- Understanding Supabase features
- Following best practices
- Proper error handling
- Efficient data management
- Performance optimization

Remember:

- Handle errors
- Manage data
- Use real-time
- Monitor performance
- Test thoroughly

Happy Fluttering!
