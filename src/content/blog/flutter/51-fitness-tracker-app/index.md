---
title: "Build a Fitness Tracker App"
summary: "Track workouts and progress with Flutter"
date: "2025, 03, 05"
tags: ["flutter", "fitness", "local-storage", "state-management", "ui"]
difficulty: "advanced"
draft: false
---

## Build a Fitness Tracker App

Creating a fitness tracker app is a great way to learn about data visualization, local storage, and state management in Flutter. This tutorial will guide you through building a feature-rich fitness tracking application.

## Features

- Track workouts
- Record exercises
- Set goals
- View progress
- Track metrics
- Create routines
- View statistics
- Export data
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
     fl_chart: ^0.65.0
     intl: ^0.19.0
     uuid: ^4.2.2
     shared_preferences: ^2.2.2
     flutter_local_notifications: ^16.3.0
     path_provider: ^2.1.2
   ```

2. **Create Models**

   ```dart
   class Workout {
     final String id;
     final String name;
     final String description;
     final List<Exercise> exercises;
     final DateTime date;
     final Duration duration;
     final int caloriesBurned;
     final String notes;

     Workout({
       required this.id,
       required this.name,
       required this.description,
       required this.exercises,
       required this.date,
       required this.duration,
       required this.caloriesBurned,
       this.notes = '',
     });

     Map<String, dynamic> toMap() {
       return {
         'id': id,
         'name': name,
         'description': description,
         'exercises': exercises.map((e) => e.toMap()).toList(),
         'date': date.millisecondsSinceEpoch,
         'duration': duration.inMinutes,
         'caloriesBurned': caloriesBurned,
         'notes': notes,
       };
     }

     factory Workout.fromMap(Map<String, dynamic> map) {
       return Workout(
         id: map['id'],
         name: map['name'],
         description: map['description'],
         exercises: (map['exercises'] as List)
             .map((e) => Exercise.fromMap(e))
             .toList(),
         date: DateTime.fromMillisecondsSinceEpoch(map['date']),
         duration: Duration(minutes: map['duration']),
         caloriesBurned: map['caloriesBurned'],
         notes: map['notes'],
       );
     }
   }

   class Exercise {
     final String id;
     final String name;
     final String description;
     final int sets;
     final int reps;
     final double weight;
     final Duration restTime;
     final String notes;

     Exercise({
       required this.id,
       required this.name,
       required this.description,
       required this.sets,
       required this.reps,
       required this.weight,
       required this.restTime,
       this.notes = '',
     });

     Map<String, dynamic> toMap() {
       return {
         'id': id,
         'name': name,
         'description': description,
         'sets': sets,
         'reps': reps,
         'weight': weight,
         'restTime': restTime.inSeconds,
         'notes': notes,
       };
     }

     factory Exercise.fromMap(Map<String, dynamic> map) {
       return Exercise(
         id: map['id'],
         name: map['name'],
         description: map['description'],
         sets: map['sets'],
         reps: map['reps'],
         weight: map['weight'],
         restTime: Duration(seconds: map['restTime']),
         notes: map['notes'],
       );
     }
   }

   class Goal {
     final String id;
     final String name;
     final String description;
     final double target;
     final double current;
     final DateTime startDate;
     final DateTime endDate;
     final String type;
     final bool isCompleted;

     Goal({
       required this.id,
       required this.name,
       required this.description,
       required this.target,
       required this.current,
       required this.startDate,
       required this.endDate,
       required this.type,
       this.isCompleted = false,
     });

     Map<String, dynamic> toMap() {
       return {
         'id': id,
         'name': name,
         'description': description,
         'target': target,
         'current': current,
         'startDate': startDate.millisecondsSinceEpoch,
         'endDate': endDate.millisecondsSinceEpoch,
         'type': type,
         'isCompleted': isCompleted ? 1 : 0,
       };
     }

     factory Goal.fromMap(Map<String, dynamic> map) {
       return Goal(
         id: map['id'],
         name: map['name'],
         description: map['description'],
         target: map['target'],
         current: map['current'],
         startDate: DateTime.fromMillisecondsSinceEpoch(map['startDate']),
         endDate: DateTime.fromMillisecondsSinceEpoch(map['endDate']),
         type: map['type'],
         isCompleted: map['isCompleted'] == 1,
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
       final dbPath = await getDatabasesPath();
       final path = join(dbPath, 'fitness_tracker.db');

       return await openDatabase(
         path,
         version: 1,
         onCreate: (db, version) async {
           await db.execute('''
             CREATE TABLE workouts(
               id TEXT PRIMARY KEY,
               name TEXT NOT NULL,
               description TEXT NOT NULL,
               exercises TEXT NOT NULL,
               date INTEGER NOT NULL,
               duration INTEGER NOT NULL,
               caloriesBurned INTEGER NOT NULL,
               notes TEXT
             )
           ''');

           await db.execute('''
             CREATE TABLE goals(
               id TEXT PRIMARY KEY,
               name TEXT NOT NULL,
               description TEXT NOT NULL,
               target REAL NOT NULL,
               current REAL NOT NULL,
               startDate INTEGER NOT NULL,
               endDate INTEGER NOT NULL,
               type TEXT NOT NULL,
               isCompleted INTEGER NOT NULL
             )
           ''');
         },
       );
     }

     Future<void> insertWorkout(Workout workout) async {
       final db = await database;
       await db.insert(
         'workouts',
         workout.toMap(),
         conflictAlgorithm: ConflictAlgorithm.replace,
       );
     }

     Future<void> updateWorkout(Workout workout) async {
       final db = await database;
       await db.update(
         'workouts',
         workout.toMap(),
         where: 'id = ?',
         whereArgs: [workout.id],
       );
     }

     Future<void> deleteWorkout(String id) async {
       final db = await database;
       await db.delete(
         'workouts',
         where: 'id = ?',
         whereArgs: [id],
       );
     }

     Future<List<Workout>> getAllWorkouts() async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query('workouts');
       return List.generate(maps.length, (i) => Workout.fromMap(maps[i]));
     }

     Future<List<Workout>> getWorkoutsByDateRange(
         DateTime start, DateTime end) async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query(
         'workouts',
         where: 'date BETWEEN ? AND ?',
         whereArgs: [start.millisecondsSinceEpoch, end.millisecondsSinceEpoch],
       );
       return List.generate(maps.length, (i) => Workout.fromMap(maps[i]));
     }

     Future<void> insertGoal(Goal goal) async {
       final db = await database;
       await db.insert(
         'goals',
         goal.toMap(),
         conflictAlgorithm: ConflictAlgorithm.replace,
       );
     }

     Future<void> updateGoal(Goal goal) async {
       final db = await database;
       await db.update(
         'goals',
         goal.toMap(),
         where: 'id = ?',
         whereArgs: [goal.id],
       );
     }

     Future<void> deleteGoal(String id) async {
       final db = await database;
       await db.delete(
         'goals',
         where: 'id = ?',
         whereArgs: [id],
       );
     }

     Future<List<Goal>> getAllGoals() async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query('goals');
       return List.generate(maps.length, (i) => Goal.fromMap(maps[i]));
     }

     Future<List<Goal>> getActiveGoals() async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query(
         'goals',
         where: 'isCompleted = ?',
         whereArgs: [0],
       );
       return List.generate(maps.length, (i) => Goal.fromMap(maps[i]));
     }
   }
   ```

4. **Create Fitness Provider**

   ```dart
   class FitnessProvider extends ChangeNotifier {
     final DatabaseHelper _dbHelper;
     List<Workout> _workouts = [];
     List<Goal> _goals = [];
     List<Goal> _activeGoals = [];

     FitnessProvider({required DatabaseHelper dbHelper})
         : _dbHelper = dbHelper {
       loadWorkouts();
       loadGoals();
     }

     List<Workout> get workouts => _workouts;
     List<Goal> get goals => _goals;
     List<Goal> get activeGoals => _activeGoals;

     Future<void> loadWorkouts() async {
       _workouts = await _dbHelper.getAllWorkouts();
       notifyListeners();
     }

     Future<void> loadGoals() async {
       _goals = await _dbHelper.getAllGoals();
       _activeGoals = await _dbHelper.getActiveGoals();
       notifyListeners();
     }

     Future<void> addWorkout(Workout workout) async {
       await _dbHelper.insertWorkout(workout);
       _workouts.add(workout);
       notifyListeners();
     }

     Future<void> updateWorkout(Workout workout) async {
       await _dbHelper.updateWorkout(workout);
       final index = _workouts.indexWhere((w) => w.id == workout.id);
       if (index != -1) {
         _workouts[index] = workout;
       }
       notifyListeners();
     }

     Future<void> deleteWorkout(String id) async {
       await _dbHelper.deleteWorkout(id);
       _workouts.removeWhere((w) => w.id == id);
       notifyListeners();
     }

     Future<void> addGoal(Goal goal) async {
       await _dbHelper.insertGoal(goal);
       _goals.add(goal);
       if (!goal.isCompleted) {
         _activeGoals.add(goal);
       }
       notifyListeners();
     }

     Future<void> updateGoal(Goal goal) async {
       await _dbHelper.updateGoal(goal);
       final index = _goals.indexWhere((g) => g.id == goal.id);
       if (index != -1) {
         _goals[index] = goal;
       }
       if (goal.isCompleted) {
         _activeGoals.removeWhere((g) => g.id == goal.id);
       } else {
         final activeIndex = _activeGoals.indexWhere((g) => g.id == goal.id);
         if (activeIndex != -1) {
           _activeGoals[activeIndex] = goal;
         } else {
           _activeGoals.add(goal);
         }
       }
       notifyListeners();
     }

     Future<void> deleteGoal(String id) async {
       await _dbHelper.deleteGoal(id);
       _goals.removeWhere((g) => g.id == id);
       _activeGoals.removeWhere((g) => g.id == id);
       notifyListeners();
     }

     List<Workout> getWorkoutsByDateRange(DateTime start, DateTime end) {
       return _workouts.where((w) {
         return w.date.isAfter(start) && w.date.isBefore(end);
       }).toList();
     }

     Map<String, double> getWorkoutStats() {
       if (_workouts.isEmpty) {
         return {
           'totalWorkouts': 0,
           'totalDuration': 0,
           'totalCalories': 0,
           'averageDuration': 0,
         };
       }

       final totalDuration = _workouts.fold<Duration>(
         Duration.zero,
         (prev, workout) => prev + workout.duration,
       );

       final totalCalories = _workouts.fold<int>(
         0,
         (prev, workout) => prev + workout.caloriesBurned,
       );

       return {
         'totalWorkouts': _workouts.length.toDouble(),
         'totalDuration': totalDuration.inMinutes.toDouble(),
         'totalCalories': totalCalories.toDouble(),
         'averageDuration': totalDuration.inMinutes / _workouts.length,
       };
     }

     Map<String, double> getGoalProgress() {
       if (_activeGoals.isEmpty) {
         return {
           'completed': 0,
           'inProgress': 0,
           'notStarted': 0,
         };
       }

       final now = DateTime.now();
       var completed = 0;
       var inProgress = 0;
       var notStarted = 0;

       for (final goal in _activeGoals) {
         if (goal.current >= goal.target) {
           completed++;
         } else if (goal.startDate.isBefore(now)) {
           inProgress++;
         } else {
           notStarted++;
         }
       }

       return {
         'completed': completed.toDouble(),
         'inProgress': inProgress.toDouble(),
         'notStarted': notStarted.toDouble(),
       };
     }
   }
   ```

5. **Create Fitness Widgets**

   ```dart
   class WorkoutCard extends StatelessWidget {
     final Workout workout;
     final VoidCallback onTap;
     final VoidCallback onDelete;

     const WorkoutCard({
       required this.workout,
       required this.onTap,
       required this.onDelete,
     });

     @override
     Widget build(BuildContext context) {
       return Card(
         child: ListTile(
           onTap: onTap,
           title: Text(workout.name),
           subtitle: Column(
             crossAxisAlignment: CrossAxisAlignment.start,
             children: [
               Text(
                 DateFormat.yMMMd().format(workout.date),
                 style: Theme.of(context).textTheme.bodySmall,
               ),
               Text(
                 '${workout.exercises.length} exercises • ${workout.duration.inMinutes} min • ${workout.caloriesBurned} cal',
                 style: Theme.of(context).textTheme.bodySmall,
               ),
             ],
           ),
           trailing: IconButton(
             icon: Icon(Icons.delete),
             onPressed: onDelete,
           ),
         ),
       );
     }
   }

   class GoalCard extends StatelessWidget {
     final Goal goal;
     final VoidCallback onTap;
     final VoidCallback onDelete;

     const GoalCard({
       required this.goal,
       required this.onTap,
       required this.onDelete,
     });

     @override
     Widget build(BuildContext context) {
       final progress = goal.current / goal.target;
       final daysLeft = goal.endDate.difference(DateTime.now()).inDays;

       return Card(
         child: ListTile(
           onTap: onTap,
           title: Text(goal.name),
           subtitle: Column(
             crossAxisAlignment: CrossAxisAlignment.start,
             children: [
               LinearProgressIndicator(
                 value: progress,
                 backgroundColor: Colors.grey[200],
                 valueColor: AlwaysStoppedAnimation<Color>(
                   progress >= 1 ? Colors.green : Theme.of(context).primaryColor,
                 ),
               ),
               SizedBox(height: 4),
               Text(
                 '${(progress * 100).toStringAsFixed(1)}% • $daysLeft days left',
                 style: Theme.of(context).textTheme.bodySmall,
               ),
             ],
           ),
           trailing: IconButton(
             icon: Icon(Icons.delete),
             onPressed: onDelete,
           ),
         ),
       );
     }
   }

   class StatsCard extends StatelessWidget {
     final String title;
     final String value;
     final IconData icon;
     final Color color;

     const StatsCard({
       required this.title,
       required this.value,
       required this.icon,
       required this.color,
     });

     @override
     Widget build(BuildContext context) {
       return Card(
         child: Padding(
           padding: EdgeInsets.all(16),
           child: Column(
             children: [
               Icon(icon, color: color, size: 32),
               SizedBox(height: 8),
               Text(
                 title,
                 style: Theme.of(context).textTheme.titleMedium,
               ),
               SizedBox(height: 4),
               Text(
                 value,
                 style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                       color: color,
                       fontWeight: FontWeight.bold,
                     ),
               ),
             ],
           ),
         ),
       );
     }
   }
   ```

6. **Create Workout Detail Screen**

   ```dart
   class WorkoutDetailScreen extends StatelessWidget {
     final Workout workout;

     const WorkoutDetailScreen({required this.workout});

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text(workout.name),
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
                     Text(
                       'Workout Details',
                       style: Theme.of(context).textTheme.titleLarge,
                     ),
                     SizedBox(height: 16),
                     Row(
                       children: [
                         Icon(Icons.calendar_today, size: 16),
                         SizedBox(width: 8),
                         Text(
                           DateFormat.yMMMd().format(workout.date),
                         ),
                       ],
                     ),
                     SizedBox(height: 8),
                     Row(
                       children: [
                         Icon(Icons.timer, size: 16),
                         SizedBox(width: 8),
                         Text('${workout.duration.inMinutes} minutes'),
                       ],
                     ),
                     SizedBox(height: 8),
                     Row(
                       children: [
                         Icon(Icons.local_fire_department, size: 16),
                         SizedBox(width: 8),
                         Text('${workout.caloriesBurned} calories burned'),
                       ],
                     ),
                   ],
                 ),
               ),
             ),
             SizedBox(height: 16),
             Text(
               'Exercises',
               style: Theme.of(context).textTheme.titleLarge,
             ),
             SizedBox(height: 8),
             ListView.builder(
               shrinkWrap: true,
               physics: NeverScrollableScrollPhysics(),
               itemCount: workout.exercises.length,
               itemBuilder: (context, index) {
                 final exercise = workout.exercises[index];
                 return Card(
                   child: ListTile(
                     title: Text(exercise.name),
                     subtitle: Text(
                       '${exercise.sets} sets × ${exercise.reps} reps • ${exercise.weight} kg',
                     ),
                     trailing: Text(
                       '${exercise.restTime.inSeconds}s rest',
                       style: Theme.of(context).textTheme.bodySmall,
                     ),
                   ),
                 );
               },
             ),
             if (workout.notes.isNotEmpty) ...[
               SizedBox(height: 16),
               Text(
                 'Notes',
                 style: Theme.of(context).textTheme.titleLarge,
               ),
               SizedBox(height: 8),
               Card(
                 child: Padding(
                   padding: EdgeInsets.all(16),
                   child: Text(workout.notes),
                 ),
               ),
             ],
           ],
         ),
       );
     }
   }
   ```

7. **Create Main Fitness Screen**

   ```dart
   class FitnessScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return DefaultTabController(
         length: 3,
         child: Scaffold(
           appBar: AppBar(
             title: Text('Fitness Tracker'),
             bottom: TabBar(
               tabs: [
                 Tab(text: 'Workouts'),
                 Tab(text: 'Goals'),
                 Tab(text: 'Stats'),
               ],
             ),
           ),
           body: TabBarView(
             children: [
               _buildWorkoutsTab(context),
               _buildGoalsTab(context),
               _buildStatsTab(context),
             ],
           ),
           floatingActionButton: FloatingActionButton(
             onPressed: () {
               Navigator.push(
                 context,
                 MaterialPageRoute(
                   builder: (context) => AddWorkoutScreen(),
                 ),
               );
             },
             child: Icon(Icons.add),
           ),
         ),
       );
     }

     Widget _buildWorkoutsTab(BuildContext context) {
       return Consumer<FitnessProvider>(
         builder: (context, provider, child) {
           if (provider.workouts.isEmpty) {
             return Center(
               child: Text('No workouts recorded'),
             );
           }

           return ListView.builder(
             itemCount: provider.workouts.length,
             itemBuilder: (context, index) {
               final workout = provider.workouts[index];
               return WorkoutCard(
                 workout: workout,
                 onTap: () {
                   Navigator.push(
                     context,
                     MaterialPageRoute(
                       builder: (context) =>
                           WorkoutDetailScreen(workout: workout),
                     ),
                   );
                 },
                 onDelete: () {
                   provider.deleteWorkout(workout.id);
                 },
               );
             },
           );
         },
       );
     }

     Widget _buildGoalsTab(BuildContext context) {
       return Consumer<FitnessProvider>(
         builder: (context, provider, child) {
           if (provider.activeGoals.isEmpty) {
             return Center(
               child: Text('No active goals'),
             );
           }

           return ListView.builder(
             itemCount: provider.activeGoals.length,
             itemBuilder: (context, index) {
               final goal = provider.activeGoals[index];
               return GoalCard(
                 goal: goal,
                 onTap: () {
                   Navigator.push(
                     context,
                     MaterialPageRoute(
                       builder: (context) => GoalDetailScreen(goal: goal),
                     ),
                   );
                 },
                 onDelete: () {
                   provider.deleteGoal(goal.id);
                 },
               );
             },
           );
         },
       );
     }

     Widget _buildStatsTab(BuildContext context) {
       return Consumer<FitnessProvider>(
         builder: (context, provider, child) {
           final stats = provider.getWorkoutStats();
           final goalProgress = provider.getGoalProgress();

           return ListView(
             padding: EdgeInsets.all(16),
             children: [
               Text(
                 'Workout Statistics',
                 style: Theme.of(context).textTheme.titleLarge,
               ),
               SizedBox(height: 16),
               GridView.count(
                 shrinkWrap: true,
                 physics: NeverScrollableScrollPhysics(),
                 crossAxisCount: 2,
                 mainAxisSpacing: 16,
                 crossAxisSpacing: 16,
                 children: [
                   StatsCard(
                     title: 'Total Workouts',
                     value: stats['totalWorkouts']!.toStringAsFixed(0),
                     icon: Icons.fitness_center,
                     color: Colors.blue,
                   ),
                   StatsCard(
                     title: 'Total Duration',
                     value: '${stats['totalDuration']!.toStringAsFixed(0)} min',
                     icon: Icons.timer,
                     color: Colors.green,
                   ),
                   StatsCard(
                     title: 'Total Calories',
                     value: '${stats['totalCalories']!.toStringAsFixed(0)} cal',
                     icon: Icons.local_fire_department,
                     color: Colors.orange,
                   ),
                   StatsCard(
                     title: 'Avg Duration',
                     value: '${stats['averageDuration']!.toStringAsFixed(0)} min',
                     icon: Icons.trending_up,
                     color: Colors.purple,
                   ),
                 ],
               ),
               SizedBox(height: 32),
               Text(
                 'Goal Progress',
                 style: Theme.of(context).textTheme.titleLarge,
               ),
               SizedBox(height: 16),
               PieChart(
                 PieChartData(
                   sections: [
                     PieChartSectionData(
                       value: goalProgress['completed']!,
                       title: 'Completed',
                       color: Colors.green,
                     ),
                     PieChartSectionData(
                       value: goalProgress['inProgress']!,
                       title: 'In Progress',
                       color: Colors.orange,
                     ),
                     PieChartSectionData(
                       value: goalProgress['notStarted']!,
                       title: 'Not Started',
                       color: Colors.grey,
                     ),
                   ],
                 ),
               ),
             ],
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

2. **Data Visualization**

   - Use appropriate charts
   - Show meaningful data
   - Update in real-time
   - Handle empty states

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

This tutorial has shown you how to create a fitness tracker app with features like:

- Workout tracking
- Goal setting
- Progress monitoring
- Statistics
- Data visualization

You can extend this app by adding:

- Social features
- Workout sharing
- Custom routines
- Achievement system
- Export/import
- Cloud sync

Remember to:

- Handle errors gracefully
- Test thoroughly
- Consider accessibility
- Follow platform guidelines
- Optimize performance

This app provides a solid foundation for learning Flutter's data management, visualization, and state management.
