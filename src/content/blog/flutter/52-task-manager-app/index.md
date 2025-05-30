---
title: "Build a Task Manager App"
summary: "Task management with Flutter"
date: "2025, 03, 10"
tags: ["flutter", "task", "local-storage", "state-management", "ui"]
difficulty: "advanced"
draft: false
---

## Build a Task Manager App

Creating a task manager app is a great way to learn about data management, state management, and UI design in Flutter. This tutorial will guide you through building a feature-rich task management application.

## Features

- Create tasks
- Edit tasks
- Delete tasks
- Mark tasks as complete
- Set due dates
- Set priorities
- Add categories
- Add subtasks
- Search tasks
- Filter tasks
- Sort tasks
- Dark/light theme
- Notifications

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     sqflite: ^2.3.2
     path: ^1.8.3
     provider: ^6.1.1
     intl: ^0.19.0
     uuid: ^4.2.2
     shared_preferences: ^2.2.2
     flutter_local_notifications: ^16.3.0
     path_provider: ^2.1.2
     table_calendar: ^3.0.9
   ```

2. **Create Models**

   ```dart
   class Task {
     final String id;
     final String title;
     final String description;
     final DateTime dueDate;
     final Priority priority;
     final String category;
     final List<Subtask> subtasks;
     final bool isCompleted;
     final DateTime createdAt;
     final DateTime updatedAt;

     Task({
       required this.id,
       required this.title,
       required this.description,
       required this.dueDate,
       required this.priority,
       required this.category,
       required this.subtasks,
       this.isCompleted = false,
       required this.createdAt,
       required this.updatedAt,
     });

     Map<String, dynamic> toMap() {
       return {
         'id': id,
         'title': title,
         'description': description,
         'dueDate': dueDate.millisecondsSinceEpoch,
         'priority': priority.index,
         'category': category,
         'subtasks': subtasks.map((s) => s.toMap()).toList(),
         'isCompleted': isCompleted ? 1 : 0,
         'createdAt': createdAt.millisecondsSinceEpoch,
         'updatedAt': updatedAt.millisecondsSinceEpoch,
       };
     }

     factory Task.fromMap(Map<String, dynamic> map) {
       return Task(
         id: map['id'],
         title: map['title'],
         description: map['description'],
         dueDate: DateTime.fromMillisecondsSinceEpoch(map['dueDate']),
         priority: Priority.values[map['priority']],
         category: map['category'],
         subtasks: (map['subtasks'] as List)
             .map((s) => Subtask.fromMap(s))
             .toList(),
         isCompleted: map['isCompleted'] == 1,
         createdAt: DateTime.fromMillisecondsSinceEpoch(map['createdAt']),
         updatedAt: DateTime.fromMillisecondsSinceEpoch(map['updatedAt']),
       );
     }

     Task copyWith({
       String? id,
       String? title,
       String? description,
       DateTime? dueDate,
       Priority? priority,
       String? category,
       List<Subtask>? subtasks,
       bool? isCompleted,
       DateTime? createdAt,
       DateTime? updatedAt,
     }) {
       return Task(
         id: id ?? this.id,
         title: title ?? this.title,
         description: description ?? this.description,
         dueDate: dueDate ?? this.dueDate,
         priority: priority ?? this.priority,
         category: category ?? this.category,
         subtasks: subtasks ?? this.subtasks,
         isCompleted: isCompleted ?? this.isCompleted,
         createdAt: createdAt ?? this.createdAt,
         updatedAt: updatedAt ?? this.updatedAt,
       );
     }
   }

   class Subtask {
     final String id;
     final String title;
     final bool isCompleted;

     Subtask({
       required this.id,
       required this.title,
       this.isCompleted = false,
     });

     Map<String, dynamic> toMap() {
       return {
         'id': id,
         'title': title,
         'isCompleted': isCompleted ? 1 : 0,
       };
     }

     factory Subtask.fromMap(Map<String, dynamic> map) {
       return Subtask(
         id: map['id'],
         title: map['title'],
         isCompleted: map['isCompleted'] == 1,
       );
     }

     Subtask copyWith({
       String? id,
       String? title,
       bool? isCompleted,
     }) {
       return Subtask(
         id: id ?? this.id,
         title: title ?? this.title,
         isCompleted: isCompleted ?? this.isCompleted,
       );
     }
   }

   enum Priority {
     low,
     medium,
     high,
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
       final dbPath = await getDatabasesPath();
       final path = join(dbPath, 'task_manager.db');

       return await openDatabase(
         path,
         version: 1,
         onCreate: (db, version) async {
           await db.execute('''
             CREATE TABLE tasks(
               id TEXT PRIMARY KEY,
               title TEXT NOT NULL,
               description TEXT NOT NULL,
               dueDate INTEGER NOT NULL,
               priority INTEGER NOT NULL,
               category TEXT NOT NULL,
               subtasks TEXT NOT NULL,
               isCompleted INTEGER NOT NULL,
               createdAt INTEGER NOT NULL,
               updatedAt INTEGER NOT NULL
             )
           ''');
         },
       );
     }

     Future<void> insertTask(Task task) async {
       final db = await database;
       await db.insert(
         'tasks',
         task.toMap(),
         conflictAlgorithm: ConflictAlgorithm.replace,
       );
     }

     Future<void> updateTask(Task task) async {
       final db = await database;
       await db.update(
         'tasks',
         task.toMap(),
         where: 'id = ?',
         whereArgs: [task.id],
       );
     }

     Future<void> deleteTask(String id) async {
       final db = await database;
       await db.delete(
         'tasks',
         where: 'id = ?',
         whereArgs: [id],
       );
     }

     Future<List<Task>> getAllTasks() async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query('tasks');
       return List.generate(maps.length, (i) => Task.fromMap(maps[i]));
     }

     Future<List<Task>> getTasksByDate(DateTime date) async {
       final db = await database;
       final startOfDay = DateTime(date.year, date.month, date.day);
       final endOfDay = startOfDay.add(Duration(days: 1));

       final List<Map<String, dynamic>> maps = await db.query(
         'tasks',
         where: 'dueDate BETWEEN ? AND ?',
         whereArgs: [
           startOfDay.millisecondsSinceEpoch,
           endOfDay.millisecondsSinceEpoch,
         ],
       );
       return List.generate(maps.length, (i) => Task.fromMap(maps[i]));
     }

     Future<List<Task>> getTasksByCategory(String category) async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query(
         'tasks',
         where: 'category = ?',
         whereArgs: [category],
       );
       return List.generate(maps.length, (i) => Task.fromMap(maps[i]));
     }

     Future<List<Task>> searchTasks(String query) async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query(
         'tasks',
         where: 'title LIKE ? OR description LIKE ?',
         whereArgs: ['%$query%', '%$query%'],
       );
       return List.generate(maps.length, (i) => Task.fromMap(maps[i]));
     }
   }
   ```

4. **Create Task Provider**

   ```dart
   class TaskProvider extends ChangeNotifier {
     final DatabaseHelper _dbHelper;
     List<Task> _tasks = [];
     String _searchQuery = '';
     String _selectedCategory = 'All';
     DateTime _selectedDate = DateTime.now();

     TaskProvider({required DatabaseHelper dbHelper})
         : _dbHelper = dbHelper {
       loadTasks();
     }

     List<Task> get tasks => _tasks;
     String get searchQuery => _searchQuery;
     String get selectedCategory => _selectedCategory;
     DateTime get selectedDate => _selectedDate;

     Future<void> loadTasks() async {
       _tasks = await _dbHelper.getAllTasks();
       notifyListeners();
     }

     Future<void> addTask(Task task) async {
       await _dbHelper.insertTask(task);
       _tasks.add(task);
       notifyListeners();
     }

     Future<void> updateTask(Task task) async {
       await _dbHelper.updateTask(task);
       final index = _tasks.indexWhere((t) => t.id == task.id);
       if (index != -1) {
         _tasks[index] = task;
       }
       notifyListeners();
     }

     Future<void> deleteTask(String id) async {
       await _dbHelper.deleteTask(id);
       _tasks.removeWhere((t) => t.id == id);
       notifyListeners();
     }

     Future<void> toggleTaskCompletion(Task task) async {
       final updatedTask = task.copyWith(
         isCompleted: !task.isCompleted,
         updatedAt: DateTime.now(),
       );
       await updateTask(updatedTask);
     }

     Future<void> toggleSubtaskCompletion(Task task, Subtask subtask) async {
       final updatedSubtasks = task.subtasks.map((s) {
         if (s.id == subtask.id) {
           return s.copyWith(isCompleted: !s.isCompleted);
         }
         return s;
       }).toList();

       final updatedTask = task.copyWith(
         subtasks: updatedSubtasks,
         updatedAt: DateTime.now(),
       );
       await updateTask(updatedTask);
     }

     Future<void> setSearchQuery(String query) async {
       _searchQuery = query;
       if (query.isEmpty) {
         await loadTasks();
       } else {
         _tasks = await _dbHelper.searchTasks(query);
         notifyListeners();
       }
     }

     Future<void> setCategory(String category) async {
       _selectedCategory = category;
       if (category == 'All') {
         await loadTasks();
       } else {
         _tasks = await _dbHelper.getTasksByCategory(category);
         notifyListeners();
       }
     }

     Future<void> setDate(DateTime date) async {
       _selectedDate = date;
       _tasks = await _dbHelper.getTasksByDate(date);
       notifyListeners();
     }

     List<Task> getTasksByPriority(Priority priority) {
       return _tasks.where((t) => t.priority == priority).toList();
     }

     List<Task> getCompletedTasks() {
       return _tasks.where((t) => t.isCompleted).toList();
     }

     List<Task> getPendingTasks() {
       return _tasks.where((t) => !t.isCompleted).toList();
     }

     List<String> getCategories() {
       return _tasks.map((t) => t.category).toSet().toList();
     }

     Map<DateTime, List<Task>> getTasksByDateRange(
         DateTime start, DateTime end) {
       final tasks = <DateTime, List<Task>>{};
       for (var i = 0; i <= end.difference(start).inDays; i++) {
         final date = start.add(Duration(days: i));
         tasks[date] = _tasks
             .where((t) =>
                 t.dueDate.year == date.year &&
                 t.dueDate.month == date.month &&
                 t.dueDate.day == date.day)
             .toList();
       }
       return tasks;
     }
   }
   ```

5. **Create Task Widgets**

   ```dart
   class TaskCard extends StatelessWidget {
     final Task task;
     final VoidCallback onTap;
     final VoidCallback onDelete;
     final Function(bool) onToggleCompletion;

     const TaskCard({
       required this.task,
       required this.onTap,
       required this.onDelete,
       required this.onToggleCompletion,
     });

     @override
     Widget build(BuildContext context) {
       return Card(
         child: ListTile(
           onTap: onTap,
           leading: Checkbox(
             value: task.isCompleted,
             onChanged: (value) => onToggleCompletion(value!),
           ),
           title: Text(
             task.title,
             style: TextStyle(
               decoration: task.isCompleted ? TextDecoration.lineThrough : null,
             ),
           ),
           subtitle: Column(
             crossAxisAlignment: CrossAxisAlignment.start,
             children: [
               Text(
                 task.description,
                 maxLines: 1,
                 overflow: TextOverflow.ellipsis,
               ),
               SizedBox(height: 4),
               Row(
                 children: [
                   Icon(
                     Icons.calendar_today,
                     size: 12,
                     color: Colors.grey,
                   ),
                   SizedBox(width: 4),
                   Text(
                     DateFormat.yMMMd().format(task.dueDate),
                     style: TextStyle(
                       fontSize: 12,
                       color: Colors.grey,
                     ),
                   ),
                   SizedBox(width: 8),
                   Icon(
                     Icons.category,
                     size: 12,
                     color: Colors.grey,
                   ),
                   SizedBox(width: 4),
                   Text(
                     task.category,
                     style: TextStyle(
                       fontSize: 12,
                       color: Colors.grey,
                     ),
                   ),
                 ],
               ),
             ],
           ),
           trailing: Row(
             mainAxisSize: MainAxisSize.min,
             children: [
               _buildPriorityIndicator(task.priority),
               IconButton(
                 icon: Icon(Icons.delete),
                 onPressed: onDelete,
               ),
             ],
           ),
         ),
       );
     }

     Widget _buildPriorityIndicator(Priority priority) {
       Color color;
       switch (priority) {
         case Priority.low:
           color = Colors.green;
           break;
         case Priority.medium:
           color = Colors.orange;
           break;
         case Priority.high:
           color = Colors.red;
           break;
       }

       return Container(
         width: 12,
         height: 12,
         decoration: BoxDecoration(
           color: color,
           shape: BoxShape.circle,
         ),
       );
     }
   }

   class SubtaskList extends StatelessWidget {
     final List<Subtask> subtasks;
     final Function(Subtask) onToggleCompletion;

     const SubtaskList({
       required this.subtasks,
       required this.onToggleCompletion,
     });

     @override
     Widget build(BuildContext context) {
       return ListView.builder(
         shrinkWrap: true,
         physics: NeverScrollableScrollPhysics(),
         itemCount: subtasks.length,
         itemBuilder: (context, index) {
           final subtask = subtasks[index];
           return CheckboxListTile(
             value: subtask.isCompleted,
             onChanged: (_) => onToggleCompletion(subtask),
             title: Text(
               subtask.title,
               style: TextStyle(
                 decoration:
                     subtask.isCompleted ? TextDecoration.lineThrough : null,
               ),
             ),
           );
         },
       );
     }
   }

   class CategoryChip extends StatelessWidget {
     final String category;
     final bool isSelected;
     final VoidCallback onTap;

     const CategoryChip({
       required this.category,
       required this.isSelected,
       required this.onTap,
     });

     @override
     Widget build(BuildContext context) {
       return FilterChip(
         label: Text(category),
         selected: isSelected,
         onSelected: (_) => onTap(),
       );
     }
   }
   ```

6. **Create Task Detail Screen**

   ```dart
   class TaskDetailScreen extends StatelessWidget {
     final Task task;

     const TaskDetailScreen({required this.task});

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Task Details'),
           actions: [
             IconButton(
               icon: Icon(Icons.edit),
               onPressed: () {
                 Navigator.push(
                   context,
                   MaterialPageRoute(
                     builder: (context) => EditTaskScreen(task: task),
                   ),
                 );
               },
             ),
           ],
         ),
         body: ListView(
           padding: EdgeInsets.all(16),
           children: [
             Card(
               child: Padding(
                 padding: EdgeInsets.all(16),
                 child: Column(
                   crossAxisAlignment: CrossAxisAlignment.start,
                   children: [
                     Row(
                       children: [
                         Expanded(
                           child: Text(
                             task.title,
                             style: Theme.of(context).textTheme.headlineSmall,
                           ),
                         ),
                         Checkbox(
                           value: task.isCompleted,
                           onChanged: (value) {
                             context
                                 .read<TaskProvider>()
                                 .toggleTaskCompletion(task);
                           },
                         ),
                       ],
                     ),
                     SizedBox(height: 8),
                     Text(
                       task.description,
                       style: Theme.of(context).textTheme.bodyLarge,
                     ),
                     SizedBox(height: 16),
                     Row(
                       children: [
                         Icon(Icons.calendar_today, size: 16),
                         SizedBox(width: 8),
                         Text(
                           DateFormat.yMMMd().format(task.dueDate),
                         ),
                         SizedBox(width: 16),
                         Icon(Icons.category, size: 16),
                         SizedBox(width: 8),
                         Text(task.category),
                       ],
                     ),
                     SizedBox(height: 8),
                     Row(
                       children: [
                         Icon(Icons.flag, size: 16),
                         SizedBox(width: 8),
                         Text(
                           'Priority: ${task.priority.toString().split('.').last}',
                         ),
                       ],
                     ),
                   ],
                 ),
               ),
             ),
             if (task.subtasks.isNotEmpty) ...[
               SizedBox(height: 16),
               Text(
                 'Subtasks',
                 style: Theme.of(context).textTheme.titleLarge,
               ),
               SizedBox(height: 8),
               Card(
                 child: SubtaskList(
                   subtasks: task.subtasks,
                   onToggleCompletion: (subtask) {
                     context
                         .read<TaskProvider>()
                         .toggleSubtaskCompletion(task, subtask);
                   },
                 ),
               ),
             ],
           ],
         ),
       );
     }
   }
   ```

7. **Create Main Task Screen**

   ```dart
   class TaskScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return DefaultTabController(
         length: 2,
         child: Scaffold(
           appBar: AppBar(
             title: Text('Task Manager'),
             bottom: TabBar(
               tabs: [
                 Tab(text: 'Tasks'),
                 Tab(text: 'Calendar'),
               ],
             ),
           ),
           body: TabBarView(
             children: [
               _buildTasksTab(context),
               _buildCalendarTab(context),
             ],
           ),
           floatingActionButton: FloatingActionButton(
             onPressed: () {
               Navigator.push(
                 context,
                 MaterialPageRoute(
                   builder: (context) => AddTaskScreen(),
                 ),
               );
             },
             child: Icon(Icons.add),
           ),
         ),
       );
     }

     Widget _buildTasksTab(BuildContext context) {
       return Column(
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
                 context.read<TaskProvider>().setSearchQuery(value);
               },
             ),
           ),
           Container(
             height: 50,
             child: Consumer<TaskProvider>(
               builder: (context, provider, child) {
                 return ListView.builder(
                   scrollDirection: Axis.horizontal,
                   padding: EdgeInsets.symmetric(horizontal: 16),
                   itemCount: provider.getCategories().length + 1,
                   itemBuilder: (context, index) {
                     final category = index == 0
                         ? 'All'
                         : provider.getCategories()[index - 1];
                     return Padding(
                       padding: EdgeInsets.only(right: 8),
                       child: CategoryChip(
                         category: category,
                         isSelected: category == provider.selectedCategory,
                         onTap: () {
                           provider.setCategory(category);
                         },
                       ),
                     );
                   },
                 );
               },
             ),
           ),
           Expanded(
             child: Consumer<TaskProvider>(
               builder: (context, provider, child) {
                 if (provider.tasks.isEmpty) {
                   return Center(
                     child: Text('No tasks found'),
                   );
                 }

                 return ListView.builder(
                   itemCount: provider.tasks.length,
                   itemBuilder: (context, index) {
                     final task = provider.tasks[index];
                     return TaskCard(
                       task: task,
                       onTap: () {
                         Navigator.push(
                           context,
                           MaterialPageRoute(
                             builder: (context) =>
                                 TaskDetailScreen(task: task),
                           ),
                         );
                       },
                       onDelete: () {
                         provider.deleteTask(task.id);
                       },
                       onToggleCompletion: (value) {
                         provider.toggleTaskCompletion(task);
                       },
                     );
                   },
                 );
               },
             ),
           ),
         ],
       );
     }

     Widget _buildCalendarTab(BuildContext context) {
       return Consumer<TaskProvider>(
         builder: (context, provider, child) {
           return TableCalendar(
             firstDay: DateTime.utc(2024, 1, 1),
             lastDay: DateTime.utc(2025, 12, 31),
             focusedDay: provider.selectedDate,
             selectedDayPredicate: (day) {
               return isSameDay(provider.selectedDate, day);
             },
             onDaySelected: (selectedDay, focusedDay) {
               provider.setDate(selectedDay);
             },
             calendarStyle: CalendarStyle(
               selectedDecoration: BoxDecoration(
                 color: Theme.of(context).primaryColor,
                 shape: BoxShape.circle,
               ),
               todayDecoration: BoxDecoration(
                 color: Theme.of(context).primaryColor.withOpacity(0.5),
                 shape: BoxShape.circle,
               ),
             ),
             eventLoader: (day) {
               return provider
                   .getTasksByDateRange(day, day)[day] ?? [];
             },
           );
         },
       );
     }
   }
   ```

## Best Practices

1. **Data Management**

   - Implement proper database structure
   - Handle data persistence
   - Optimize queries
   - Clean up resources

2. **State Management**

   - Use provider pattern
   - Handle state updates
   - Manage side effects
   - Optimize rebuilds

3. **User Experience**

   - Show loading states
   - Provide error feedback
   - Add animations
   - Handle gestures

4. **Performance**
   - Optimize list rendering
   - Handle large datasets
   - Cache data
   - Clean up resources

## Conclusion

This tutorial has shown you how to create a task manager app with features like:

- Task management
- Subtask support
- Priority levels
- Categories
- Calendar view
- Search and filter
- Notifications

You can extend this app by adding:

- Cloud sync
- Task sharing
- Recurring tasks
- Task templates
- Export/import
- Custom themes

Remember to:

- Handle errors gracefully
- Test thoroughly
- Consider accessibility
- Follow platform guidelines
- Optimize performance

This app provides a solid foundation for learning Flutter's data management, state management, and UI design.
