---
title: "Your First Flutter App: Building a Todo List from Scratch"
summary: "A beginner-friendly tutorial that walks through creating a complete todo list application, covering basic widgets, state management, and local storage."
date: "2025, 01, 20"
draft: false
tags:
  - flutter
  - tutorial
---

## Your First Flutter App: Building a Todo List from Scratch

Welcome to this beginner-friendly tutorial where we'll build a complete Todo List application using Flutter. This tutorial will cover essential Flutter concepts, state management, and local storage implementation.

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

## Building the Todo List Screen

Let's create the main screen with a list of todos and a floating action button to add new items:

```dart
class TodoListScreen extends StatefulWidget {
  const TodoListScreen({super.key});

  @override
  State<TodoListScreen> createState() => _TodoListScreenState();
}

class _TodoListScreenState extends State<TodoListScreen> {
  final List<Todo> _todos = [];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Todo List'),
      ),
      body: ListView.builder(
        itemCount: _todos.length,
        itemBuilder: (context, index) {
          return TodoItem(
            todo: _todos[index],
            onToggle: (bool? value) {
              setState(() {
                _todos[index].isCompleted = value ?? false;
              });
            },
            onDelete: () {
              setState(() {
                _todos.removeAt(index);
              });
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addTodo,
        child: const Icon(Icons.add),
      ),
    );
  }

  void _addTodo() {
    showDialog(
      context: context,
      builder: (context) => AddTodoDialog(
        onAdd: (String title) {
          setState(() {
            _todos.add(Todo(title: title));
          });
        },
      ),
    );
  }
}
```

## Creating the Todo Model

Let's define our Todo model:

```dart
class Todo {
  String title;
  bool isCompleted;

  Todo({
    required this.title,
    this.isCompleted = false,
  });
}
```

## Building the Todo Item Widget

Create a reusable widget for displaying individual todo items:

```dart
class TodoItem extends StatelessWidget {
  final Todo todo;
  final Function(bool?) onToggle;
  final VoidCallback onDelete;

  const TodoItem({
    super.key,
    required this.todo,
    required this.onToggle,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Checkbox(
        value: todo.isCompleted,
        onChanged: onToggle,
      ),
      title: Text(
        todo.title,
        style: TextStyle(
          decoration: todo.isCompleted ? TextDecoration.lineThrough : null,
        ),
      ),
      trailing: IconButton(
        icon: const Icon(Icons.delete),
        onPressed: onDelete,
      ),
    );
  }
}
```

## Adding New Todos

Create a dialog for adding new todos:

```dart
class AddTodoDialog extends StatefulWidget {
  final Function(String) onAdd;

  const AddTodoDialog({super.key, required this.onAdd});

  @override
  State<AddTodoDialog> createState() => _AddTodoDialogState();
}

class _AddTodoDialogState extends State<AddTodoDialog> {
  final _controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Todo'),
      content: TextField(
        controller: _controller,
        decoration: const InputDecoration(
          hintText: 'Enter todo title',
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: () {
            if (_controller.text.isNotEmpty) {
              widget.onAdd(_controller.text);
              Navigator.pop(context);
            }
          },
          child: const Text('Add'),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
```

## Adding Local Storage

To persist our todos, we'll use the `shared_preferences` package:

1. Add the dependency to `pubspec.yaml`:

```yaml
dependencies:
  shared_preferences: ^2.2.0
```

2. Implement storage functionality:

```dart
class TodoStorage {
  static const String _key = 'todos';

  static Future<List<Todo>> loadTodos() async {
    final prefs = await SharedPreferences.getInstance();
    final todosJson = prefs.getStringList(_key) ?? [];
    return todosJson.map((json) {
      final map = jsonDecode(json);
      return Todo(
        title: map['title'],
        isCompleted: map['isCompleted'],
      );
    }).toList();
  }

  static Future<void> saveTodos(List<Todo> todos) async {
    final prefs = await SharedPreferences.getInstance();
    final todosJson = todos.map((todo) {
      return jsonEncode({
        'title': todo.title,
        'isCompleted': todo.isCompleted,
      });
    }).toList();
    await prefs.setStringList(_key, todosJson);
  }
}
```

## Conclusion

Congratulations! You've built a fully functional Todo List app with Flutter. This tutorial covered:

1. Basic Flutter widgets and layout
2. State management using setState
3. Custom widgets and dialogs
4. Local storage implementation

To enhance this app further, you could:

- Add categories for todos
- Implement due dates
- Add search functionality
- Implement sorting options
- Add animations for better UX

Remember to test your app thoroughly and consider adding error handling for a more robust application.

Happy coding!
