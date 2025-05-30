---
title: "Build a Notes App"
summary: "Note-taking with Flutter"
date: "2025, 03, 15"
tags: ["flutter", "notes", "local-storage", "state-management", "ui"]
difficulty: "advanced"
draft: false
---

## Build a Notes App

Creating a notes app is a great way to learn about data management, state management, and UI design in Flutter. This tutorial will guide you through building a feature-rich note-taking application.

## Features

- Create notes
- Edit notes
- Delete notes
- Add categories
- Add tags
- Search notes
- Filter notes
- Sort notes
- Rich text editing
- Image attachments
- Dark/light theme
- Export notes

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
     path_provider: ^2.1.2
     image_picker: ^1.0.7
     flutter_quill: ^9.2.10
     share_plus: ^7.2.1
     file_picker: ^6.1.1
   ```

2. **Create Models**

   ```dart
   class Note {
     final String id;
     final String title;
     final String content;
     final String category;
     final List<String> tags;
     final List<String> imageUrls;
     final DateTime createdAt;
     final DateTime updatedAt;

     Note({
       required this.id,
       required this.title,
       required this.content,
       required this.category,
       required this.tags,
       required this.imageUrls,
       required this.createdAt,
       required this.updatedAt,
     });

     Map<String, dynamic> toMap() {
       return {
         'id': id,
         'title': title,
         'content': content,
         'category': category,
         'tags': tags.join(','),
         'imageUrls': imageUrls.join(','),
         'createdAt': createdAt.millisecondsSinceEpoch,
         'updatedAt': updatedAt.millisecondsSinceEpoch,
       };
     }

     factory Note.fromMap(Map<String, dynamic> map) {
       return Note(
         id: map['id'],
         title: map['title'],
         content: map['content'],
         category: map['category'],
         tags: map['tags'].split(','),
         imageUrls: map['imageUrls'].split(','),
         createdAt: DateTime.fromMillisecondsSinceEpoch(map['createdAt']),
         updatedAt: DateTime.fromMillisecondsSinceEpoch(map['updatedAt']),
       );
     }

     Note copyWith({
       String? id,
       String? title,
       String? content,
       String? category,
       List<String>? tags,
       List<String>? imageUrls,
       DateTime? createdAt,
       DateTime? updatedAt,
     }) {
       return Note(
         id: id ?? this.id,
         title: title ?? this.title,
         content: content ?? this.content,
         category: category ?? this.category,
         tags: tags ?? this.tags,
         imageUrls: imageUrls ?? this.imageUrls,
         createdAt: createdAt ?? this.createdAt,
         updatedAt: updatedAt ?? this.updatedAt,
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
       final path = join(dbPath, 'notes.db');

       return await openDatabase(
         path,
         version: 1,
         onCreate: (db, version) async {
           await db.execute('''
             CREATE TABLE notes(
               id TEXT PRIMARY KEY,
               title TEXT NOT NULL,
               content TEXT NOT NULL,
               category TEXT NOT NULL,
               tags TEXT NOT NULL,
               imageUrls TEXT NOT NULL,
               createdAt INTEGER NOT NULL,
               updatedAt INTEGER NOT NULL
             )
           ''');
         },
       );
     }

     Future<void> insertNote(Note note) async {
       final db = await database;
       await db.insert(
         'notes',
         note.toMap(),
         conflictAlgorithm: ConflictAlgorithm.replace,
       );
     }

     Future<void> updateNote(Note note) async {
       final db = await database;
       await db.update(
         'notes',
         note.toMap(),
         where: 'id = ?',
         whereArgs: [note.id],
       );
     }

     Future<void> deleteNote(String id) async {
       final db = await database;
       await db.delete(
         'notes',
         where: 'id = ?',
         whereArgs: [id],
       );
     }

     Future<List<Note>> getAllNotes() async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query('notes');
       return List.generate(maps.length, (i) => Note.fromMap(maps[i]));
     }

     Future<List<Note>> getNotesByCategory(String category) async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query(
         'notes',
         where: 'category = ?',
         whereArgs: [category],
       );
       return List.generate(maps.length, (i) => Note.fromMap(maps[i]));
     }

     Future<List<Note>> getNotesByTag(String tag) async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query('notes');
       return List.generate(maps.length, (i) {
         final note = Note.fromMap(maps[i]);
         return note.tags.contains(tag) ? note : null;
       }).whereType<Note>().toList();
     }

     Future<List<Note>> searchNotes(String query) async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query(
         'notes',
         where: 'title LIKE ? OR content LIKE ?',
         whereArgs: ['%$query%', '%$query%'],
       );
       return List.generate(maps.length, (i) => Note.fromMap(maps[i]));
     }
   }
   ```

4. **Create Notes Provider**

   ```dart
   class NotesProvider extends ChangeNotifier {
     final DatabaseHelper _dbHelper;
     List<Note> _notes = [];
     String _searchQuery = '';
     String _selectedCategory = 'All';
     String _selectedTag = '';

     NotesProvider({required DatabaseHelper dbHelper})
         : _dbHelper = dbHelper {
       loadNotes();
     }

     List<Note> get notes => _notes;
     String get searchQuery => _searchQuery;
     String get selectedCategory => _selectedCategory;
     String get selectedTag => _selectedTag;

     Future<void> loadNotes() async {
       _notes = await _dbHelper.getAllNotes();
       notifyListeners();
     }

     Future<void> addNote(Note note) async {
       await _dbHelper.insertNote(note);
       _notes.add(note);
       notifyListeners();
     }

     Future<void> updateNote(Note note) async {
       await _dbHelper.updateNote(note);
       final index = _notes.indexWhere((n) => n.id == note.id);
       if (index != -1) {
         _notes[index] = note;
       }
       notifyListeners();
     }

     Future<void> deleteNote(String id) async {
       await _dbHelper.deleteNote(id);
       _notes.removeWhere((n) => n.id == id);
       notifyListeners();
     }

     Future<void> setSearchQuery(String query) async {
       _searchQuery = query;
       if (query.isEmpty) {
         await loadNotes();
       } else {
         _notes = await _dbHelper.searchNotes(query);
         notifyListeners();
       }
     }

     Future<void> setCategory(String category) async {
       _selectedCategory = category;
       if (category == 'All') {
         await loadNotes();
       } else {
         _notes = await _dbHelper.getNotesByCategory(category);
         notifyListeners();
       }
     }

     Future<void> setTag(String tag) async {
       _selectedTag = tag;
       if (tag.isEmpty) {
         await loadNotes();
       } else {
         _notes = await _dbHelper.getNotesByTag(tag);
         notifyListeners();
       }
     }

     List<String> getCategories() {
       return _notes.map((n) => n.category).toSet().toList();
     }

     List<String> getAllTags() {
       return _notes
           .expand((n) => n.tags)
           .toSet()
           .toList();
     }

     List<Note> getNotesByDateRange(DateTime start, DateTime end) {
       return _notes.where((note) {
         return note.createdAt.isAfter(start) &&
             note.createdAt.isBefore(end);
       }).toList();
     }
   }
   ```

5. **Create Notes Widgets**

   ```dart
   class NoteCard extends StatelessWidget {
     final Note note;
     final VoidCallback onTap;
     final VoidCallback onDelete;
     final VoidCallback onShare;

     const NoteCard({
       required this.note,
       required this.onTap,
       required this.onDelete,
       required this.onShare,
     });

     @override
     Widget build(BuildContext context) {
       return Card(
         child: ListTile(
           onTap: onTap,
           title: Text(
             note.title,
             maxLines: 1,
             overflow: TextOverflow.ellipsis,
           ),
           subtitle: Column(
             crossAxisAlignment: CrossAxisAlignment.start,
             children: [
               Text(
                 note.content,
                 maxLines: 2,
                 overflow: TextOverflow.ellipsis,
               ),
               SizedBox(height: 4),
               Row(
                 children: [
                   Icon(
                     Icons.category,
                     size: 12,
                     color: Colors.grey,
                   ),
                   SizedBox(width: 4),
                   Text(
                     note.category,
                     style: TextStyle(
                       fontSize: 12,
                       color: Colors.grey,
                     ),
                   ),
                   SizedBox(width: 8),
                   Icon(
                     Icons.tag,
                     size: 12,
                     color: Colors.grey,
                   ),
                   SizedBox(width: 4),
                   Text(
                     note.tags.join(', '),
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
               IconButton(
                 icon: Icon(Icons.share),
                 onPressed: onShare,
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

   class TagChip extends StatelessWidget {
     final String tag;
     final bool isSelected;
     final VoidCallback onTap;

     const TagChip({
       required this.tag,
       required this.isSelected,
       required this.onTap,
     });

     @override
     Widget build(BuildContext context) {
       return ActionChip(
         label: Text(tag),
         backgroundColor: isSelected
             ? Theme.of(context).primaryColor.withOpacity(0.2)
             : null,
         onPressed: onTap,
       );
     }
   }
   ```

6. **Create Note Detail Screen**

   ```dart
   class NoteDetailScreen extends StatelessWidget {
     final Note note;

     const NoteDetailScreen({required this.note});

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Note Details'),
           actions: [
             IconButton(
               icon: Icon(Icons.edit),
               onPressed: () {
                 Navigator.push(
                   context,
                   MaterialPageRoute(
                     builder: (context) => EditNoteScreen(note: note),
                   ),
                 );
               },
             ),
             IconButton(
               icon: Icon(Icons.share),
               onPressed: () {
                 Share.share(
                   '${note.title}\n\n${note.content}',
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
                     Text(
                       note.title,
                       style: Theme.of(context).textTheme.headlineSmall,
                     ),
                     SizedBox(height: 8),
                     Text(
                       note.content,
                       style: Theme.of(context).textTheme.bodyLarge,
                     ),
                     SizedBox(height: 16),
                     Row(
                       children: [
                         Icon(Icons.category, size: 16),
                         SizedBox(width: 8),
                         Text(note.category),
                         SizedBox(width: 16),
                         Icon(Icons.tag, size: 16),
                         SizedBox(width: 8),
                         Text(note.tags.join(', ')),
                       ],
                     ),
                     if (note.imageUrls.isNotEmpty) ...[
                       SizedBox(height: 16),
                       Text(
                         'Images',
                         style: Theme.of(context).textTheme.titleLarge,
                       ),
                       SizedBox(height: 8),
                       GridView.builder(
                         shrinkWrap: true,
                         physics: NeverScrollableScrollPhysics(),
                         gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                           crossAxisCount: 3,
                           crossAxisSpacing: 8,
                           mainAxisSpacing: 8,
                         ),
                         itemCount: note.imageUrls.length,
                         itemBuilder: (context, index) {
                           return Image.network(
                             note.imageUrls[index],
                             fit: BoxFit.cover,
                           );
                         },
                       ),
                     ],
                   ],
                 ),
               ),
             ),
           ],
         ),
       );
     }
   }
   ```

7. **Create Main Notes Screen**

   ```dart
   class NotesScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Notes'),
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
                   context.read<NotesProvider>().setSearchQuery(value);
                 },
               ),
             ),
             Container(
               height: 50,
               child: Consumer<NotesProvider>(
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
             Container(
               height: 50,
               child: Consumer<NotesProvider>(
                 builder: (context, provider, child) {
                   return ListView.builder(
                     scrollDirection: Axis.horizontal,
                     padding: EdgeInsets.symmetric(horizontal: 16),
                     itemCount: provider.getAllTags().length + 1,
                     itemBuilder: (context, index) {
                       final tag = index == 0
                           ? ''
                           : provider.getAllTags()[index - 1];
                       return Padding(
                         padding: EdgeInsets.only(right: 8),
                         child: TagChip(
                           tag: tag.isEmpty ? 'All Tags' : tag,
                           isSelected: tag == provider.selectedTag,
                           onTap: () {
                             provider.setTag(tag);
                           },
                         ),
                       );
                     },
                   );
                 },
               ),
             ),
             Expanded(
               child: Consumer<NotesProvider>(
                 builder: (context, provider, child) {
                   if (provider.notes.isEmpty) {
                     return Center(
                       child: Text('No notes found'),
                     );
                   }

                   return ListView.builder(
                     itemCount: provider.notes.length,
                     itemBuilder: (context, index) {
                       final note = provider.notes[index];
                       return NoteCard(
                         note: note,
                         onTap: () {
                           Navigator.push(
                             context,
                             MaterialPageRoute(
                               builder: (context) =>
                                   NoteDetailScreen(note: note),
                             ),
                           );
                         },
                         onDelete: () {
                           provider.deleteNote(note.id);
                         },
                         onShare: () {
                           Share.share(
                             '${note.title}\n\n${note.content}',
                           );
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
             Navigator.push(
               context,
               MaterialPageRoute(
                 builder: (context) => AddNoteScreen(),
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

This tutorial has shown you how to create a notes app with features like:

- Note management
- Rich text editing
- Image attachments
- Categories and tags
- Search and filter
- Sharing notes

You can extend this app by adding:

- Cloud sync
- Note sharing
- Note templates
- Export/import
- Custom themes
- Collaboration

Remember to:

- Handle errors gracefully
- Test thoroughly
- Consider accessibility
- Follow platform guidelines
- Optimize performance

This app provides a solid foundation for learning Flutter's data management, state management, and UI design.
