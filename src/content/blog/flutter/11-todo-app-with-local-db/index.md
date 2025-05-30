---
title: "Build a Todo App with Local DB"
summary: "Store tasks in local database"
date: "2024, 03, 26"
tags: ["flutter", "database", "sqlite", "todo"]
difficulty: "medium"
draft: false
---

## Build a Todo App with Local DB

Building a Todo app with local database storage is a great way to learn about data persistence in Flutter. This guide will show you how to create a fully functional Todo app using SQLite database.

## Why Use Local Database?

Local database storage offers several advantages:

- Works offline
- Fast data access
- Persistent storage
- No internet dependency
- Better user privacy

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     sqflite: ^2.3.0
     path: ^1.8.3
     provider: ^6.0.5
   ```

2. **Create Database Helper**

   ```dart
   class DatabaseHelper {
     static Database? _database;
     static final DatabaseHelper instance = DatabaseHelper._();

     Future<Database> get database async {
       if (_database != null) return _database!;
       _database = await _initDatabase();
       return _database!;
     }

     Future<Database> _initDatabase() async {
       String path = join(await getDatabasesPath(), 'todo_database.db');
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
           isCompleted INTEGER
         )
       ''');
     }
   }
   ```

3. **Create Todo Model**

   ```dart
   class Todo {
     final int? id;
     final String title;
     final String description;
     final bool isCompleted;

     Todo({
       this.id,
       required this.title,
       required this.description,
       this.isCompleted = false,
     });

     Map<String, dynamic> toMap() {
       return {
         'id': id,
         'title': title,
         'description': description,
         'isCompleted': isCompleted ? 1 : 0,
       };
     }

     factory Todo.fromMap(Map<String, dynamic> map) {
       return Todo(
         id: map['id'],
         title: map['title'],
         description: map['description'],
         isCompleted: map['isCompleted'] == 1,
       );
     }
   }
   ```

4. **Implement CRUD Operations**

   ```dart
   class TodoProvider extends ChangeNotifier {
     List<Todo> _todos = [];
     final DatabaseHelper _dbHelper = DatabaseHelper.instance;

     List<Todo> get todos => _todos;

     Future<void> loadTodos() async {
       final db = await _dbHelper.database;
       final List<Map<String, dynamic>> maps = await db.query('todos');
       _todos = maps.map((map) => Todo.fromMap(map)).toList();
       notifyListeners();
     }

     Future<void> addTodo(Todo todo) async {
       final db = await _dbHelper.database;
       final id = await db.insert('todos', todo.toMap());
       _todos.add(Todo(
         id: id,
         title: todo.title,
         description: todo.description,
         isCompleted: todo.isCompleted,
       ));
       notifyListeners();
     }

     Future<void> updateTodo(Todo todo) async {
       final db = await _dbHelper.database;
       await db.update(
         'todos',
         todo.toMap(),
         where: 'id = ?',
         whereArgs: [todo.id],
       );
       final index = _todos.indexWhere((t) => t.id == todo.id);
       _todos[index] = todo;
       notifyListeners();
     }

     Future<void> deleteTodo(int id) async {
       final db = await _dbHelper.database;
       await db.delete(
         'todos',
         where: 'id = ?',
         whereArgs: [id],
       );
       _todos.removeWhere((todo) => todo.id == id);
       notifyListeners();
     }
   }
   ```

5. **Create UI Components**

   ```dart
   class TodoListScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(title: Text('Todo List')),
         body: Consumer<TodoProvider>(
           builder: (context, todoProvider, child) {
             return ListView.builder(
               itemCount: todoProvider.todos.length,
               itemBuilder: (context, index) {
                 final todo = todoProvider.todos[index];
                 return ListTile(
                   title: Text(todo.title),
                   subtitle: Text(todo.description),
                   leading: Checkbox(
                     value: todo.isCompleted,
                     onChanged: (value) {
                       todoProvider.updateTodo(
                         Todo(
                           id: todo.id,
                           title: todo.title,
                           description: todo.description,
                           isCompleted: value!,
                         ),
                       );
                     },
                   ),
                   trailing: IconButton(
                     icon: Icon(Icons.delete),
                     onPressed: () => todoProvider.deleteTodo(todo.id!),
                   ),
                 );
               },
             );
           },
         ),
         floatingActionButton: FloatingActionButton(
           onPressed: () => _showAddTodoDialog(context),
           child: Icon(Icons.add),
         ),
       );
     }
   }
   ```

## Best Practices

1. **Database Operations**

   - Use transactions for multiple operations
   - Handle database errors properly
   - Implement proper indexing
   - Regular database maintenance

2. **UI/UX Considerations**

   - Show loading indicators
   - Implement error handling
   - Add confirmation dialogs
   - Provide feedback for actions

3. **Performance Optimization**
   - Use pagination for large lists
   - Implement proper caching
   - Optimize database queries
   - Handle memory efficiently

## Common Features

1. **Todo Management**

   - Add new todos
   - Edit existing todos
   - Delete todos
   - Mark todos as complete

2. **Data Organization**

   - Sort todos by date
   - Filter by completion status
   - Search functionality
   - Categories/tags

3. **User Experience**
   - Swipe actions
   - Drag and drop reordering
   - Due dates
   - Priority levels

## Conclusion

Building a Todo app with local database storage is an excellent way to learn about data persistence in Flutter. By following these guidelines and implementing the provided examples, you can create a robust and user-friendly Todo application that works offline and provides a great user experience.
