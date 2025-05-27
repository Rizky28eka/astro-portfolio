---
title: "Offline-First Architecture in Flutter: Building Resilient Apps"
summary: "Comprehensive guide on implementing offline-first architecture in Flutter applications, including data synchronization and conflict resolution."
date: "2025, 06, 10"
draft: false
tags:
  - flutter
  - offline-first
  - data-sync
  - local-storage
  - architecture
---

## Offline-First Architecture in Flutter: Building Resilient Apps

This guide covers how to implement offline-first architecture in Flutter applications, ensuring your app works seamlessly without internet connectivity.

## Basic Setup

### Dependencies

```yaml
# pubspec.yaml
dependencies:
  sqflite: ^2.0.0
  path: ^1.8.0
  connectivity_plus: ^4.0.0
  hive: ^2.2.3
  hive_flutter: ^1.1.0
```

### Database Setup

```dart
class DatabaseHelper {
  static Database? _database;
  static final DatabaseHelper instance = DatabaseHelper._();

  DatabaseHelper._();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    String path = join(await getDatabasesPath(), 'app_database.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDb,
    );
  }

  Future<void> _createDb(Database db, int version) async {
    await db.execute('''
      CREATE TABLE todos(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        isCompleted INTEGER,
        syncStatus TEXT,
        lastModified INTEGER
      )
    ''');
  }
}
```

## Data Synchronization

### Local Storage

```dart
class TodoRepository {
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  Future<int> insertTodo(Todo todo) async {
    final db = await _dbHelper.database;
    return await db.insert(
      'todos',
      todo.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<Todo>> getTodos() async {
    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> maps = await db.query('todos');
    return List.generate(maps.length, (i) => Todo.fromMap(maps[i]));
  }

  Future<int> updateTodo(Todo todo) async {
    final db = await _dbHelper.database;
    return await db.update(
      'todos',
      todo.toMap(),
      where: 'id = ?',
      whereArgs: [todo.id],
    );
  }
}
```

### Sync Manager

```dart
class SyncManager {
  final TodoRepository _repository;
  final ApiService _apiService;
  final Connectivity _connectivity = Connectivity();

  SyncManager(this._repository, this._apiService) {
    _setupConnectivityListener();
  }

  void _setupConnectivityListener() {
    _connectivity.onConnectivityChanged.listen((ConnectivityResult result) {
      if (result != ConnectivityResult.none) {
        syncData();
      }
    });
  }

  Future<void> syncData() async {
    try {
      final localTodos = await _repository.getTodos();
      final pendingChanges = localTodos.where((todo) => todo.syncStatus == 'pending');

      for (var todo in pendingChanges) {
        if (todo.id == null) {
          // New todo
          await _apiService.createTodo(todo);
        } else {
          // Updated todo
          await _apiService.updateTodo(todo);
        }
        todo.syncStatus = 'synced';
        await _repository.updateTodo(todo);
      }

      // Fetch remote changes
      final remoteTodos = await _apiService.getTodos();
      await _repository.syncWithRemote(remoteTodos);
    } catch (e) {
      print('Sync failed: $e');
    }
  }
}
```

## Conflict Resolution

### Version Control

```dart
class VersionedTodo {
  final Todo todo;
  final int version;
  final DateTime lastModified;

  VersionedTodo({
    required this.todo,
    required this.version,
    required this.lastModified,
  });

  Map<String, dynamic> toMap() {
    return {
      'todo': todo.toMap(),
      'version': version,
      'lastModified': lastModified.toIso8601String(),
    };
  }

  factory VersionedTodo.fromMap(Map<String, dynamic> map) {
    return VersionedTodo(
      todo: Todo.fromMap(map['todo']),
      version: map['version'],
      lastModified: DateTime.parse(map['lastModified']),
    );
  }
}
```

### Conflict Handler

```dart
class ConflictHandler {
  Future<Todo> resolveConflict(Todo local, Todo remote) async {
    if (local.lastModified.isAfter(remote.lastModified)) {
      return local;
    } else if (remote.lastModified.isAfter(local.lastModified)) {
      return remote;
    } else {
      // Manual resolution needed
      return await _manualResolution(local, remote);
    }
  }

  Future<Todo> _manualResolution(Todo local, Todo remote) async {
    // Implement manual resolution logic
    // This could involve user interaction or business rules
    return local;
  }
}
```

## State Management

### Offline-Aware BLoC

```dart
class TodoBloc extends Bloc<TodoEvent, TodoState> {
  final TodoRepository _repository;
  final SyncManager _syncManager;

  TodoBloc(this._repository, this._syncManager) : super(TodoInitial()) {
    on<LoadTodos>(_onLoadTodos);
    on<AddTodo>(_onAddTodo);
    on<UpdateTodo>(_onUpdateTodo);
  }

  Future<void> _onLoadTodos(LoadTodos event, Emitter<TodoState> emit) async {
    emit(TodoLoading());
    try {
      final todos = await _repository.getTodos();
      emit(TodoLoaded(todos));
    } catch (e) {
      emit(TodoError(e.toString()));
    }
  }

  Future<void> _onAddTodo(AddTodo event, Emitter<TodoState> emit) async {
    try {
      final todo = event.todo;
      todo.syncStatus = 'pending';
      await _repository.insertTodo(todo);
      _syncManager.syncData();
      add(LoadTodos());
    } catch (e) {
      emit(TodoError(e.toString()));
    }
  }
}
```

## Error Handling

```dart
class OfflineError extends Error {
  final String message;
  final dynamic originalError;

  OfflineError(this.message, this.originalError);

  @override
  String toString() => 'OfflineError: $message';
}

class SyncError extends Error {
  final String message;
  final List<Todo> failedItems;

  SyncError(this.message, this.failedItems);

  @override
  String toString() => 'SyncError: $message';
}
```

## Best Practices

1. Implement proper data versioning
2. Handle conflicts gracefully
3. Use efficient sync strategies
4. Implement proper error handling
5. Monitor sync status
6. Optimize local storage
7. Test offline scenarios

## Common Pitfalls

1. Poor conflict resolution
2. Inefficient sync
3. Missing error handling
4. No version control
5. Large data sets

## Conclusion

Implementing offline-first requires:

- Understanding data synchronization
- Following best practices
- Proper conflict resolution
- Efficient local storage
- Performance optimization

Remember:

- Handle conflicts
- Optimize sync
- Monitor performance
- Test offline
- Manage storage

Happy Fluttering!
