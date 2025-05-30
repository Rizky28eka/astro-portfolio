---
title: "Create a Note-Taking App"
summary: "Save and organize user notes"
date: "2025, 01, 15"
tags: ["flutter", "local-storage", "notes", "sqlite", "ui"]
difficulty: "medium"
draft: false
---

## Create a Note-Taking App

Building a note-taking app is a great way to learn Flutter's state management, local storage, and UI design. This tutorial will guide you through creating a fully functional note-taking app with features like creating, editing, deleting, and categorizing notes.

## Features

- Create and edit notes
- Categorize notes with tags
- Search functionality
- Local storage with SQLite
- Beautiful Material Design UI
- Dark mode support

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     sqflite: ^2.3.0
     path: ^1.8.3
     provider: ^6.1.1
     intl: ^0.18.1
   ```

2. **Create Note Model**

   ```dart
   class Note {
     final int? id;
     final String title;
     final String content;
     final String? category;
     final DateTime createdAt;
     final DateTime updatedAt;

     Note({
       this.id,
       required this.title,
       required this.content,
       this.category,
       required this.createdAt,
       required this.updatedAt,
     });

     Map<String, dynamic> toMap() {
       return {
         'id': id,
         'title': title,
         'content': content,
         'category': category,
         'createdAt': createdAt.toIso8601String(),
         'updatedAt': updatedAt.toIso8601String(),
       };
     }

     factory Note.fromMap(Map<String, dynamic> map) {
       return Note(
         id: map['id'],
         title: map['title'],
         content: map['content'],
         category: map['category'],
         createdAt: DateTime.parse(map['createdAt']),
         updatedAt: DateTime.parse(map['updatedAt']),
       );
     }
   }
   ```

3. **Create Database Helper**

   ```dart
   class DatabaseHelper {
     static final DatabaseHelper instance = DatabaseHelper._init();
     static Database? _database;

     DatabaseHelper._init();

     Future<Database> get database async {
       if (_database != null) return _database!;
       _database = await _initDB('notes.db');
       return _database!;
     }

     Future<Database> _initDB(String filePath) async {
       final dbPath = await getDatabasesPath();
       final path = join(dbPath, filePath);

       return await openDatabase(
         path,
         version: 1,
         onCreate: _createDB,
       );
     }

     Future<void> _createDB(Database db, int version) async {
       await db.execute('''
         CREATE TABLE notes (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           title TEXT NOT NULL,
           content TEXT NOT NULL,
           category TEXT,
           createdAt TEXT NOT NULL,
           updatedAt TEXT NOT NULL
         )
       ''');
     }

     Future<int> createNote(Note note) async {
       final db = await database;
       return await db.insert('notes', note.toMap());
     }

     Future<List<Note>> getAllNotes() async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query('notes');
       return List.generate(maps.length, (i) => Note.fromMap(maps[i]));
     }

     Future<int> updateNote(Note note) async {
       final db = await database;
       return await db.update(
         'notes',
         note.toMap(),
         where: 'id = ?',
         whereArgs: [note.id],
       );
     }

     Future<int> deleteNote(int id) async {
       final db = await database;
       return await db.delete(
         'notes',
         where: 'id = ?',
         whereArgs: [id],
       );
     }
   }
   ```

4. **Create Note Provider**

   ```dart
   class NoteProvider extends ChangeNotifier {
     List<Note> _notes = [];
     String _searchQuery = '';
     String? _selectedCategory;

     List<Note> get notes {
       var filteredNotes = _notes;

       if (_searchQuery.isNotEmpty) {
         filteredNotes = filteredNotes.where((note) {
           return note.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                  note.content.toLowerCase().contains(_searchQuery.toLowerCase());
         }).toList();
       }

       if (_selectedCategory != null) {
         filteredNotes = filteredNotes.where((note) {
           return note.category == _selectedCategory;
         }).toList();
       }

       return filteredNotes;
     }

     Future<void> loadNotes() async {
       _notes = await DatabaseHelper.instance.getAllNotes();
       notifyListeners();
     }

     Future<void> addNote(Note note) async {
       final id = await DatabaseHelper.instance.createNote(note);
       _notes.add(Note(
         id: id,
         title: note.title,
         content: note.content,
         category: note.category,
         createdAt: note.createdAt,
         updatedAt: note.updatedAt,
       ));
       notifyListeners();
     }

     Future<void> updateNote(Note note) async {
       await DatabaseHelper.instance.updateNote(note);
       final index = _notes.indexWhere((n) => n.id == note.id);
       _notes[index] = note;
       notifyListeners();
     }

     Future<void> deleteNote(int id) async {
       await DatabaseHelper.instance.deleteNote(id);
       _notes.removeWhere((note) => note.id == id);
       notifyListeners();
     }

     void setSearchQuery(String query) {
       _searchQuery = query;
       notifyListeners();
     }

     void setSelectedCategory(String? category) {
       _selectedCategory = category;
       notifyListeners();
     }
   }
   ```

5. **Create Note List Screen**

   ```dart
   class NoteListScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('My Notes'),
           actions: [
             IconButton(
               icon: Icon(Icons.search),
               onPressed: () {
                 // Show search bar
               },
             ),
           ],
         ),
         body: Consumer<NoteProvider>(
           builder: (context, noteProvider, child) {
             final notes = noteProvider.notes;
             return ListView.builder(
               itemCount: notes.length,
               itemBuilder: (context, index) {
                 final note = notes[index];
                 return NoteCard(note: note);
               },
             );
           },
         ),
         floatingActionButton: FloatingActionButton(
           onPressed: () {
             Navigator.push(
               context,
               MaterialPageRoute(
                 builder: (context) => NoteEditScreen(),
               ),
             );
           },
           child: Icon(Icons.add),
         ),
       );
     }
   }
   ```

6. **Create Note Edit Screen**

   ```dart
   class NoteEditScreen extends StatefulWidget {
     final Note? note;

     const NoteEditScreen({this.note});

     @override
     _NoteEditScreenState createState() => _NoteEditScreenState();
   }

   class _NoteEditScreenState extends State<NoteEditScreen> {
     final _formKey = GlobalKey<FormState>();
     late TextEditingController _titleController;
     late TextEditingController _contentController;
     String? _selectedCategory;

     @override
     void initState() {
       super.initState();
       _titleController = TextEditingController(text: widget.note?.title);
       _contentController = TextEditingController(text: widget.note?.content);
       _selectedCategory = widget.note?.category;
     }

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text(widget.note == null ? 'New Note' : 'Edit Note'),
           actions: [
             IconButton(
               icon: Icon(Icons.save),
               onPressed: _saveNote,
             ),
           ],
         ),
         body: Form(
           key: _formKey,
           child: ListView(
             padding: EdgeInsets.all(16.0),
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
                 controller: _contentController,
                 decoration: InputDecoration(
                   labelText: 'Content',
                   border: OutlineInputBorder(),
                 ),
                 maxLines: 10,
                 validator: (value) {
                   if (value == null || value.isEmpty) {
                     return 'Please enter some content';
                   }
                   return null;
                 },
               ),
               SizedBox(height: 16),
               DropdownButtonFormField<String>(
                 value: _selectedCategory,
                 decoration: InputDecoration(
                   labelText: 'Category',
                   border: OutlineInputBorder(),
                 ),
                 items: [
                   DropdownMenuItem(value: null, child: Text('None')),
                   DropdownMenuItem(value: 'Work', child: Text('Work')),
                   DropdownMenuItem(value: 'Personal', child: Text('Personal')),
                   DropdownMenuItem(value: 'Ideas', child: Text('Ideas')),
                 ],
                 onChanged: (value) {
                   setState(() {
                     _selectedCategory = value;
                   });
                 },
               ),
             ],
           ),
         ),
       );
     }

     void _saveNote() {
       if (_formKey.currentState!.validate()) {
         final noteProvider = Provider.of<NoteProvider>(context, listen: false);
         final now = DateTime.now();

         if (widget.note == null) {
           final newNote = Note(
             title: _titleController.text,
             content: _contentController.text,
             category: _selectedCategory,
             createdAt: now,
             updatedAt: now,
           );
           noteProvider.addNote(newNote);
         } else {
           final updatedNote = Note(
             id: widget.note!.id,
             title: _titleController.text,
             content: _contentController.text,
             category: _selectedCategory,
             createdAt: widget.note!.createdAt,
             updatedAt: now,
           );
           noteProvider.updateNote(updatedNote);
         }

         Navigator.pop(context);
       }
     }

     @override
     void dispose() {
       _titleController.dispose();
       _contentController.dispose();
       super.dispose();
     }
   }
   ```

## Conclusion

This tutorial has shown you how to create a fully functional note-taking app with Flutter. The app includes features like:

- Local storage using SQLite
- State management with Provider
- CRUD operations for notes
- Category management
- Search functionality
- Clean and intuitive UI

You can extend this app by adding features like:

- Note sharing
- Rich text editing
- Image attachments
- Cloud sync
- Note encryption
- Custom categories
- Note reminders

Remember to handle errors appropriately and add loading states for a better user experience. The code structure follows clean architecture principles and is easily maintainable and scalable.
