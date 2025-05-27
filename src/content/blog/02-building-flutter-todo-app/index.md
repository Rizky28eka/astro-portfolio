---
title: "Your First Flutter App: Building a Todo List from Scratch"
summary: "A beginner-friendly tutorial that walks through creating a complete todo list application, covering basic widgets, state management, and local storage."
pubDate: "2024-03-20"
draft: false
tags: ["flutter", "tutorial"]
---

## Your First Flutter App: Building a Todo List from Scratch

Welcome to this beginner-friendly tutorial where we'll build a complete Todo List application using Flutter. This tutorial will guide you through the essential concepts of Flutter development while creating a practical application.

## Prerequisites

Before we begin, make sure you have:

- Flutter SDK installed
- An IDE (VS Code or Android Studio)
- Basic understanding of Dart syntax

## Project Setup

1. Create a new Flutter project:

```bash
flutter create todo_app
cd todo_app
```

2. Clean up the default `main.dart`:

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(const TodoApp());
}

class TodoApp extends StatelessWidget {
  const TodoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Todo App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: const TodoListScreen(),
    );
  }
}
```

## Creating the Todo Model

First, let's create a Todo model class:

```dart
class Todo {
  String id;
  String title;
  bool isCompleted;

  Todo({
    required this.id,
    required this.title,
    this.isCompleted = false,
  });
}
```

## Building the Todo List Screen

Create the main screen of our application:

```dart
class TodoListScreen extends StatefulWidget {
  const TodoListScreen({super.key});

  @override
  State<TodoListScreen> createState() => _TodoListScreenState();
}

class _TodoListScreenState extends State<TodoListScreen> {
  final List<Todo> _todos = [];
  final _textController = TextEditingController();

  void _addTodo(String title) {
    if (title.isEmpty) return;

    setState(() {
      _todos.add(Todo(
        id: DateTime.now().toString(),
        title: title,
      ));
    });
    _textController.clear();
  }

  void _toggleTodo(String id) {
    setState(() {
      final todo = _todos.firstWhere((todo) => todo.id == id);
      todo.isCompleted = !todo.isCompleted;
    });
  }

  void _deleteTodo(String id) {
    setState(() {
      _todos.removeWhere((todo) => todo.id == id);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Todo List'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _textController,
                    decoration: const InputDecoration(
                      hintText: 'Add a new todo',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                ElevatedButton(
                  onPressed: () => _addTodo(_textController.text),
                  child: const Text('Add'),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: _todos.length,
              itemBuilder: (context, index) {
                final todo = _todos[index];
                return ListTile(
                  leading: Checkbox(
                    value: todo.isCompleted,
                    onChanged: (_) => _toggleTodo(todo.id),
                  ),
                  title: Text(
                    todo.title,
                    style: TextStyle(
                      decoration: todo.isCompleted
                          ? TextDecoration.lineThrough
                          : null,
                    ),
                  ),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete),
                    onPressed: () => _deleteTodo(todo.id),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
```

## Adding Local Storage

To persist our todos, we'll use the `shared_preferences` package:

1. Add the dependency to `pubspec.yaml`:

```yaml
dependencies:
  shared_preferences: ^2.2.2
```

2. Create a storage service:

```dart
import 'dart:convert';
import 'package:shared_preferences.dart';

class TodoStorage {
  static const String _key = 'todos';

  Future<void> saveTodos(List<Todo> todos) async {
    final prefs = await SharedPreferences.getInstance();
    final todosJson = todos.map((todo) => {
      'id': todo.id,
      'title': todo.title,
      'isCompleted': todo.isCompleted,
    }).toList();
    await prefs.setString(_key, jsonEncode(todosJson));
  }

  Future<List<Todo>> loadTodos() async {
    final prefs = await SharedPreferences.getInstance();
    final todosJson = prefs.getString(_key);
    if (todosJson == null) return [];

    final List<dynamic> decoded = jsonDecode(todosJson);
    return decoded.map((item) => Todo(
      id: item['id'],
      title: item['title'],
      isCompleted: item['isCompleted'],
    )).toList();
  }
}
```

## Implementing State Management

Update the `_TodoListScreenState` to use the storage:

```dart
class _TodoListScreenState extends State<TodoListScreen> {
  final List<Todo> _todos = [];
  final _textController = TextEditingController();
  final _storage = TodoStorage();

  @override
  void initState() {
    super.initState();
    _loadTodos();
  }

  Future<void> _loadTodos() async {
    final todos = await _storage.loadTodos();
    setState(() {
      _todos.addAll(todos);
    });
  }

  Future<void> _saveTodos() async {
    await _storage.saveTodos(_todos);
  }

  // Update existing methods to call _saveTodos()
  void _addTodo(String title) {
    if (title.isEmpty) return;

    setState(() {
      _todos.add(Todo(
        id: DateTime.now().toString(),
        title: title,
      ));
    });
    _textController.clear();
    _saveTodos();
  }

  void _toggleTodo(String id) {
    setState(() {
      final todo = _todos.firstWhere((todo) => todo.id == id);
      todo.isCompleted = !todo.isCompleted;
    });
    _saveTodos();
  }

  void _deleteTodo(String id) {
    setState(() {
      _todos.removeWhere((todo) => todo.id == id);
    });
    _saveTodos();
  }
}
```

## Conclusion

Congratulations! You've built a fully functional Todo List application with Flutter. This tutorial covered:

- Basic Flutter widgets and layouts
- State management
- Local storage implementation
- User input handling
- List manipulation

The app includes features like:

- Adding new todos
- Marking todos as complete
- Deleting todos
- Persistent storage

To enhance this app further, you could:

1. Add categories for todos
2. Implement due dates
3. Add search functionality
4. Include animations
5. Add user authentication

Remember to test your app thoroughly and consider adding error handling for a more robust application.
