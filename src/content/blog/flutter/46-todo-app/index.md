---
title: "Build a Todo App"
summary: "Task management with Flutter"
date: "2025, 02, 10"
tags: ["flutter", "todo", "local-storage", "state-management", "ui"]
difficulty: "beginner"
draft: false
---

## Build a Todo App

Creating a Todo app is a great way to learn about state management, local storage, and CRUD operations in Flutter. This tutorial will guide you through building a feature-rich Todo application.

## Features

- Add, edit, and delete tasks
- Mark tasks as complete
- Task categories
- Due dates
- Priority levels
- Search and filter
- Local storage
- Dark/Light theme

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     sqflite: ^2.3.0
     path: ^1.8.3
     intl: ^0.19.0
     provider: ^6.1.1
     uuid: ^4.2.1
   ```

2. **Create Todo Model**

   ```dart
   class Todo {
     final String id;
     final String title;
     final String? description;
     final DateTime? dueDate;
     final String category;
     final int priority;
     final bool isCompleted;
     final DateTime createdAt;
     final DateTime updatedAt;

     Todo({
       required this.id,
       required this.title,
       this.description,
       this.dueDate,
       required this.category,
       required this.priority,
       required this.isCompleted,
       required this.createdAt,
       required this.updatedAt,
     });

     Todo copyWith({
       String? id,
       String? title,
       String? description,
       DateTime? dueDate,
       String? category,
       int? priority,
       bool? isCompleted,
       DateTime? createdAt,
       DateTime? updatedAt,
     }) {
       return Todo(
         id: id ?? this.id,
         title: title ?? this.title,
         description: description ?? this.description,
         dueDate: dueDate ?? this.dueDate,
         category: category ?? this.category,
         priority: priority ?? this.priority,
         isCompleted: isCompleted ?? this.isCompleted,
         createdAt: createdAt ?? this.createdAt,
         updatedAt: updatedAt ?? this.updatedAt,
       );
     }

     Map<String, dynamic> toMap() {
       return {
         'id': id,
         'title': title,
         'description': description,
         'dueDate': dueDate?.millisecondsSinceEpoch,
         'category': category,
         'priority': priority,
         'isCompleted': isCompleted ? 1 : 0,
         'createdAt': createdAt.millisecondsSinceEpoch,
         'updatedAt': updatedAt.millisecondsSinceEpoch,
       };
     }

     factory Todo.fromMap(Map<String, dynamic> map) {
       return Todo(
         id: map['id'],
         title: map['title'],
         description: map['description'],
         dueDate: map['dueDate'] != null
             ? DateTime.fromMillisecondsSinceEpoch(map['dueDate'])
             : null,
         category: map['category'],
         priority: map['priority'],
         isCompleted: map['isCompleted'] == 1,
         createdAt: DateTime.fromMillisecondsSinceEpoch(map['createdAt']),
         updatedAt: DateTime.fromMillisecondsSinceEpoch(map['updatedAt']),
       );
     }
   }
   ```

3. **Create Database Helper**

   ```dart
   class DatabaseHelper {
     static final DatabaseHelper _instance = DatabaseHelper._internal();
     static Database? _database;

     factory DatabaseHelper() => _instance;

     DatabaseHelper._internal();

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
           id TEXT PRIMARY KEY,
           title TEXT NOT NULL,
           description TEXT,
           dueDate INTEGER,
           category TEXT NOT NULL,
           priority INTEGER NOT NULL,
           isCompleted INTEGER NOT NULL,
           createdAt INTEGER NOT NULL,
           updatedAt INTEGER NOT NULL
         )
       ''');
     }

     Future<void> insertTodo(Todo todo) async {
       final db = await database;
       await db.insert(
         'todos',
         todo.toMap(),
         conflictAlgorithm: ConflictAlgorithm.replace,
       );
     }

     Future<void> updateTodo(Todo todo) async {
       final db = await database;
       await db.update(
         'todos',
         todo.toMap(),
         where: 'id = ?',
         whereArgs: [todo.id],
       );
     }

     Future<void> deleteTodo(String id) async {
       final db = await database;
       await db.delete(
         'todos',
         where: 'id = ?',
         whereArgs: [id],
       );
     }

     Future<List<Todo>> getTodos() async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query('todos');
       return List.generate(maps.length, (i) => Todo.fromMap(maps[i]));
     }

     Future<List<Todo>> getTodosByCategory(String category) async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query(
         'todos',
         where: 'category = ?',
         whereArgs: [category],
       );
       return List.generate(maps.length, (i) => Todo.fromMap(maps[i]));
     }

     Future<List<Todo>> searchTodos(String query) async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query(
         'todos',
         where: 'title LIKE ? OR description LIKE ?',
         whereArgs: ['%$query%', '%$query%'],
       );
       return List.generate(maps.length, (i) => Todo.fromMap(maps[i]));
     }
   }
   ```

4. **Create Todo Provider**

   ```dart
   class TodoProvider extends ChangeNotifier {
     final DatabaseHelper _dbHelper = DatabaseHelper();
     List<Todo> _todos = [];
     String _selectedCategory = 'All';
     String _searchQuery = '';
     bool _showCompleted = true;

     List<Todo> get todos => _filterTodos();
     String get selectedCategory => _selectedCategory;
     String get searchQuery => _searchQuery;
     bool get showCompleted => _showCompleted;

     Future<void> loadTodos() async {
       _todos = await _dbHelper.getTodos();
       notifyListeners();
     }

     Future<void> addTodo(Todo todo) async {
       await _dbHelper.insertTodo(todo);
       await loadTodos();
     }

     Future<void> updateTodo(Todo todo) async {
       await _dbHelper.updateTodo(todo);
       await loadTodos();
     }

     Future<void> deleteTodo(String id) async {
       await _dbHelper.deleteTodo(id);
       await loadTodos();
     }

     void setCategory(String category) {
       _selectedCategory = category;
       notifyListeners();
     }

     void setSearchQuery(String query) {
       _searchQuery = query;
       notifyListeners();
     }

     void toggleShowCompleted() {
       _showCompleted = !_showCompleted;
       notifyListeners();
     }

     List<Todo> _filterTodos() {
       return _todos.where((todo) {
         final matchesCategory =
             _selectedCategory == 'All' || todo.category == _selectedCategory;
         final matchesSearch = todo.title
                 .toLowerCase()
                 .contains(_searchQuery.toLowerCase()) ||
             (todo.description?.toLowerCase()
                     .contains(_searchQuery.toLowerCase()) ??
                 false);
         final matchesCompleted = _showCompleted || !todo.isCompleted;
         return matchesCategory && matchesSearch && matchesCompleted;
       }).toList();
     }
   }
   ```

5. **Create Todo Widgets**

   ```dart
   class TodoCard extends StatelessWidget {
     final Todo todo;
     final VoidCallback onTap;
     final VoidCallback onDelete;

     const TodoCard({
       required this.todo,
       required this.onTap,
       required this.onDelete,
     });

     @override
     Widget build(BuildContext context) {
       return Card(
         child: ListTile(
           leading: Checkbox(
             value: todo.isCompleted,
             onChanged: (value) {
               onTap();
             },
           ),
           title: Text(
             todo.title,
             style: TextStyle(
               decoration: todo.isCompleted
                   ? TextDecoration.lineThrough
                   : TextDecoration.none,
             ),
           ),
           subtitle: Column(
             crossAxisAlignment: CrossAxisAlignment.start,
             children: [
               if (todo.description != null)
                 Text(
                   todo.description!,
                   maxLines: 2,
                   overflow: TextOverflow.ellipsis,
                 ),
               if (todo.dueDate != null)
                 Text(
                   'Due: ${DateFormat('MMM d, y').format(todo.dueDate!)}',
                   style: TextStyle(
                     color: todo.dueDate!.isBefore(DateTime.now())
                         ? Colors.red
                         : null,
                   ),
                 ),
             ],
           ),
           trailing: Row(
             mainAxisSize: MainAxisSize.min,
             children: [
               Chip(
                 label: Text(todo.category),
                 backgroundColor: _getCategoryColor(todo.category),
               ),
               IconButton(
                 icon: Icon(Icons.delete),
                 onPressed: onDelete,
               ),
             ],
           ),
         ),
       );
     }

     Color _getCategoryColor(String category) {
       switch (category.toLowerCase()) {
         case 'work':
           return Colors.blue.shade100;
         case 'personal':
           return Colors.green.shade100;
         case 'shopping':
           return Colors.orange.shade100;
         default:
           return Colors.grey.shade100;
       }
     }
   }

   class TodoForm extends StatefulWidget {
     final Todo? todo;
     final Function(Todo) onSubmit;

     const TodoForm({
       this.todo,
       required this.onSubmit,
     });

     @override
     _TodoFormState createState() => _TodoFormState();
   }

   class _TodoFormState extends State<TodoForm> {
     final _formKey = GlobalKey<FormState>();
     late TextEditingController _titleController;
     late TextEditingController _descriptionController;
     late String _category;
     late DateTime? _dueDate;
     late int _priority;

     @override
     void initState() {
       super.initState();
       _titleController = TextEditingController(text: widget.todo?.title);
       _descriptionController =
           TextEditingController(text: widget.todo?.description);
       _category = widget.todo?.category ?? 'Personal';
       _dueDate = widget.todo?.dueDate;
       _priority = widget.todo?.priority ?? 1;
     }

     @override
     Widget build(BuildContext context) {
       return Form(
         key: _formKey,
         child: Column(
           children: [
             TextFormField(
               controller: _titleController,
               decoration: InputDecoration(
                 labelText: 'Title',
                 border: OutlineInputBorder(),
               ),
               validator: (value) {
                 if (value == null || value.isEmpty) {
                   return 'Please enter a title';
                 }
                 return null;
               },
             ),
             SizedBox(height: 16),
             TextFormField(
               controller: _descriptionController,
               decoration: InputDecoration(
                 labelText: 'Description',
                 border: OutlineInputBorder(),
               ),
               maxLines: 3,
             ),
             SizedBox(height: 16),
             DropdownButtonFormField<String>(
               value: _category,
               decoration: InputDecoration(
                 labelText: 'Category',
                 border: OutlineInputBorder(),
               ),
               items: ['Personal', 'Work', 'Shopping']
                   .map((category) => DropdownMenuItem(
                         value: category,
                         child: Text(category),
                       ))
                   .toList(),
               onChanged: (value) {
                 setState(() {
                   _category = value!;
                 });
               },
             ),
             SizedBox(height: 16),
             ListTile(
               title: Text('Due Date'),
               subtitle: Text(_dueDate != null
                   ? DateFormat('MMM d, y').format(_dueDate!)
                   : 'No due date'),
               trailing: IconButton(
                 icon: Icon(Icons.calendar_today),
                 onPressed: () async {
                   final date = await showDatePicker(
                     context: context,
                     initialDate: _dueDate ?? DateTime.now(),
                     firstDate: DateTime.now(),
                     lastDate: DateTime.now().add(Duration(days: 365)),
                   );
                   if (date != null) {
                     setState(() {
                       _dueDate = date;
                     });
                   }
                 },
               ),
             ),
             SizedBox(height: 16),
             ElevatedButton(
               onPressed: _submitForm,
               child: Text(widget.todo == null ? 'Add Todo' : 'Update Todo'),
             ),
           ],
         ),
       );
     }

     void _submitForm() {
       if (_formKey.currentState!.validate()) {
         final todo = Todo(
           id: widget.todo?.id ?? Uuid().v4(),
           title: _titleController.text,
           description: _descriptionController.text,
           dueDate: _dueDate,
           category: _category,
           priority: _priority,
           isCompleted: widget.todo?.isCompleted ?? false,
           createdAt: widget.todo?.createdAt ?? DateTime.now(),
           updatedAt: DateTime.now(),
         );
         widget.onSubmit(todo);
       }
     }

     @override
     void dispose() {
       _titleController.dispose();
       _descriptionController.dispose();
       super.dispose();
     }
   }
   ```

6. **Create Main Todo Screen**

   ```dart
   class TodoScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Todo List'),
           actions: [
             IconButton(
               icon: Icon(Icons.filter_list),
               onPressed: () {
                 showModalBottomSheet(
                   context: context,
                   builder: (context) => FilterSheet(),
                 );
               },
             ),
           ],
         ),
         body: Column(
           children: [
             Padding(
               padding: EdgeInsets.all(16),
               child: TextField(
                 decoration: InputDecoration(
                   labelText: 'Search',
                   prefixIcon: Icon(Icons.search),
                   border: OutlineInputBorder(),
                 ),
                 onChanged: (value) {
                   context.read<TodoProvider>().setSearchQuery(value);
                 },
               ),
             ),
             Expanded(
               child: Consumer<TodoProvider>(
                 builder: (context, todoProvider, child) {
                   if (todoProvider.todos.isEmpty) {
                     return Center(
                       child: Text('No todos yet'),
                     );
                   }

                   return ListView.builder(
                     itemCount: todoProvider.todos.length,
                     itemBuilder: (context, index) {
                       final todo = todoProvider.todos[index];
                       return TodoCard(
                         todo: todo,
                         onTap: () {
                           todoProvider.updateTodo(
                             todo.copyWith(isCompleted: !todo.isCompleted),
                           );
                         },
                         onDelete: () {
                           todoProvider.deleteTodo(todo.id);
                         },
                       );
                     },
                   );
                 },
               ),
             ),
           ],
         ),
         floatingActionButton: FloatingActionButton(
           onPressed: () {
             showModalBottomSheet(
               context: context,
               isScrollControlled: true,
               builder: (context) => Padding(
                 padding: EdgeInsets.only(
                   bottom: MediaQuery.of(context).viewInsets.bottom,
                 ),
                 child: TodoForm(
                   onSubmit: (todo) {
                     context.read<TodoProvider>().addTodo(todo);
                     Navigator.pop(context);
                   },
                 ),
               ),
             );
           },
           child: Icon(Icons.add),
         ),
       );
     }
   }
   ```

## Best Practices

1. **State Management**

   - Use Provider for state management
   - Handle CRUD operations properly
   - Implement proper error handling
   - Cache data when appropriate

2. **Database Operations**

   - Use transactions for multiple operations
   - Handle database errors
   - Implement proper indexing
   - Clean up resources

3. **User Experience**

   - Show loading states
   - Provide error feedback
   - Implement undo/redo
   - Add animations

4. **Performance**
   - Optimize database queries
   - Handle large lists efficiently
   - Implement pagination
   - Cache frequently used data

## Conclusion

This tutorial has shown you how to create a Todo app with features like:

- Task management
- Categories
- Due dates
- Priority levels
- Search and filter
- Local storage

You can extend this app by adding:

- Cloud sync
- Notifications
- Tags
- Subtasks
- Statistics
- Export/Import

Remember to:

- Handle errors gracefully
- Test thoroughly
- Consider accessibility
- Follow platform guidelines
- Optimize performance

This app provides a solid foundation for learning Flutter's state management, local storage, and CRUD operations.
