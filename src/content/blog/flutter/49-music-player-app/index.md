---
title: "Build a Music Player App"
summary: "Audio playback with Flutter"
date: "2025, 02, 25"
tags: ["flutter", "audio", "music", "state-management", "ui"]
difficulty: "advanced"
draft: false
---

## Build a Music Player App

Creating a music player app is a great way to learn about audio handling, background playback, and state management in Flutter. This tutorial will guide you through building a feature-rich music player application.

## Features

- Play local music files
- Create playlists
- Background playback
- Audio controls
- Equalizer
- Shuffle and repeat
- Mini player
- Search functionality

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     just_audio: ^0.9.36
     audio_session: ^0.1.18
     path_provider: ^2.1.2
     permission_handler: ^11.1.0
     sqflite: ^2.3.2
     path: ^1.8.3
     provider: ^6.1.1
     uuid: ^4.2.2
     intl: ^0.19.0
     flutter_media_metadata: ^1.0.0+1
   ```

2. **Create Music Models**

   ```dart
   class Song {
     final String id;
     final String title;
     final String artist;
     final String album;
     final String path;
     final Duration duration;
     final String? artwork;

     Song({
       required this.id,
       required this.title,
       required this.artist,
       required this.album,
       required this.path,
       required this.duration,
       this.artwork,
     });

     Map<String, dynamic> toMap() {
       return {
         'id': id,
         'title': title,
         'artist': artist,
         'album': album,
         'path': path,
         'duration': duration.inMilliseconds,
         'artwork': artwork,
       };
     }

     factory Song.fromMap(Map<String, dynamic> map) {
       return Song(
         id: map['id'],
         title: map['title'],
         artist: map['artist'],
         album: map['album'],
         path: map['path'],
         duration: Duration(milliseconds: map['duration']),
         artwork: map['artwork'],
       );
     }
   }

   class Playlist {
     final String id;
     final String name;
     final List<String> songIds;
     final DateTime createdAt;

     Playlist({
       required this.id,
       required this.name,
       required this.songIds,
       required this.createdAt,
     });

     Map<String, dynamic> toMap() {
       return {
         'id': id,
         'name': name,
         'songIds': songIds,
         'createdAt': createdAt.millisecondsSinceEpoch,
       };
     }

     factory Playlist.fromMap(Map<String, dynamic> map) {
       return Playlist(
         id: map['id'],
         name: map['name'],
         songIds: List<String>.from(map['songIds']),
         createdAt: DateTime.fromMillisecondsSinceEpoch(map['createdAt']),
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
       final path = join(dbPath, 'music_player.db');

       return await openDatabase(
         path,
         version: 1,
         onCreate: (db, version) async {
           await db.execute('''
             CREATE TABLE songs(
               id TEXT PRIMARY KEY,
               title TEXT NOT NULL,
               artist TEXT NOT NULL,
               album TEXT NOT NULL,
               path TEXT NOT NULL,
               duration INTEGER NOT NULL,
               artwork TEXT
             )
           ''');

           await db.execute('''
             CREATE TABLE playlists(
               id TEXT PRIMARY KEY,
               name TEXT NOT NULL,
               songIds TEXT NOT NULL,
               createdAt INTEGER NOT NULL
             )
           ''');
         },
       );
     }

     Future<void> insertSong(Song song) async {
       final db = await database;
       await db.insert(
         'songs',
         song.toMap(),
         conflictAlgorithm: ConflictAlgorithm.replace,
       );
     }

     Future<void> insertPlaylist(Playlist playlist) async {
       final db = await database;
       await db.insert(
         'playlists',
         playlist.toMap(),
         conflictAlgorithm: ConflictAlgorithm.replace,
       );
     }

     Future<List<Song>> getAllSongs() async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query('songs');
       return List.generate(maps.length, (i) => Song.fromMap(maps[i]));
     }

     Future<List<Playlist>> getAllPlaylists() async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query('playlists');
       return List.generate(maps.length, (i) => Playlist.fromMap(maps[i]));
     }

     Future<void> updatePlaylist(Playlist playlist) async {
       final db = await database;
       await db.update(
         'playlists',
         playlist.toMap(),
         where: 'id = ?',
         whereArgs: [playlist.id],
       );
     }

     Future<void> deletePlaylist(String id) async {
       final db = await database;
       await db.delete(
         'playlists',
         where: 'id = ?',
         whereArgs: [id],
       );
     }
   }
   ```

4. **Create Music Service**

   ```dart
   class MusicService {
     final AudioPlayer _audioPlayer;
     final DatabaseHelper _dbHelper;
     List<Song> _songs = [];
     List<Playlist> _playlists = [];
     Song? _currentSong;
     bool _isShuffled = false;
     RepeatMode _repeatMode = RepeatMode.off;

     MusicService({
       required AudioPlayer audioPlayer,
       required DatabaseHelper dbHelper,
     })  : _audioPlayer = audioPlayer,
           _dbHelper = dbHelper;

     List<Song> get songs => _songs;
     List<Playlist> get playlists => _playlists;
     Song? get currentSong => _currentSong;
     bool get isShuffled => _isShuffled;
     RepeatMode get repeatMode => _repeatMode;

     Future<void> loadSongs() async {
       _songs = await _dbHelper.getAllSongs();
       _playlists = await _dbHelper.getAllPlaylists();
     }

     Future<void> playSong(Song song) async {
       _currentSong = song;
       await _audioPlayer.setFilePath(song.path);
       await _audioPlayer.play();
     }

     Future<void> pause() async {
       await _audioPlayer.pause();
     }

     Future<void> resume() async {
       await _audioPlayer.play();
     }

     Future<void> seekTo(Duration position) async {
       await _audioPlayer.seek(position);
     }

     Future<void> setShuffle(bool value) async {
       _isShuffled = value;
       await _audioPlayer.setShuffleModeEnabled(value);
     }

     Future<void> setRepeatMode(RepeatMode mode) async {
       _repeatMode = mode;
       await _audioPlayer.setLoopMode(mode);
     }

     Future<void> createPlaylist(String name) async {
       final playlist = Playlist(
         id: const Uuid().v4(),
         name: name,
         songIds: [],
         createdAt: DateTime.now(),
       );
       await _dbHelper.insertPlaylist(playlist);
       _playlists.add(playlist);
     }

     Future<void> addToPlaylist(String playlistId, String songId) async {
       final playlist = _playlists.firstWhere((p) => p.id == playlistId);
       final updatedPlaylist = Playlist(
         id: playlist.id,
         name: playlist.name,
         songIds: [...playlist.songIds, songId],
         createdAt: playlist.createdAt,
       );
       await _dbHelper.updatePlaylist(updatedPlaylist);
       final index = _playlists.indexWhere((p) => p.id == playlistId);
       _playlists[index] = updatedPlaylist;
     }

     Future<void> removeFromPlaylist(String playlistId, String songId) async {
       final playlist = _playlists.firstWhere((p) => p.id == playlistId);
       final updatedPlaylist = Playlist(
         id: playlist.id,
         name: playlist.name,
         songIds: playlist.songIds.where((id) => id != songId).toList(),
         createdAt: playlist.createdAt,
       );
       await _dbHelper.updatePlaylist(updatedPlaylist);
       final index = _playlists.indexWhere((p) => p.id == playlistId);
       _playlists[index] = updatedPlaylist;
     }

     Future<void> deletePlaylist(String id) async {
       await _dbHelper.deletePlaylist(id);
       _playlists.removeWhere((p) => p.id == id);
     }

     void dispose() {
       _audioPlayer.dispose();
     }
   }
   ```

5. **Create Music Provider**

   ```dart
   class MusicProvider extends ChangeNotifier {
     final MusicService _musicService;
     bool _isPlaying = false;
     Duration _position = Duration.zero;
     Duration _duration = Duration.zero;

     MusicProvider({required MusicService musicService})
         : _musicService = musicService {
       _init();
     }

     void _init() {
       _musicService._audioPlayer.playerStateStream.listen((state) {
         _isPlaying = state.playing;
         notifyListeners();
       });

       _musicService._audioPlayer.positionStream.listen((position) {
         _position = position;
         notifyListeners();
       });

       _musicService._audioPlayer.durationStream.listen((duration) {
         _duration = duration ?? Duration.zero;
         notifyListeners();
       });
     }

     List<Song> get songs => _musicService.songs;
     List<Playlist> get playlists => _musicService.playlists;
     Song? get currentSong => _musicService.currentSong;
     bool get isPlaying => _isPlaying;
     Duration get position => _position;
     Duration get duration => _duration;
     bool get isShuffled => _musicService.isShuffled;
     RepeatMode get repeatMode => _musicService.repeatMode;

     Future<void> loadSongs() async {
       await _musicService.loadSongs();
       notifyListeners();
     }

     Future<void> playSong(Song song) async {
       await _musicService.playSong(song);
     }

     Future<void> pause() async {
       await _musicService.pause();
     }

     Future<void> resume() async {
       await _musicService.resume();
     }

     Future<void> seekTo(Duration position) async {
       await _musicService.seekTo(position);
     }

     Future<void> setShuffle(bool value) async {
       await _musicService.setShuffle(value);
       notifyListeners();
     }

     Future<void> setRepeatMode(RepeatMode mode) async {
       await _musicService.setRepeatMode(mode);
       notifyListeners();
     }

     Future<void> createPlaylist(String name) async {
       await _musicService.createPlaylist(name);
       notifyListeners();
     }

     Future<void> addToPlaylist(String playlistId, String songId) async {
       await _musicService.addToPlaylist(playlistId, songId);
       notifyListeners();
     }

     Future<void> removeFromPlaylist(String playlistId, String songId) async {
       await _musicService.removeFromPlaylist(playlistId, songId);
       notifyListeners();
     }

     Future<void> deletePlaylist(String id) async {
       await _musicService.deletePlaylist(id);
       notifyListeners();
     }

     @override
     void dispose() {
       _musicService.dispose();
       super.dispose();
     }
   }
   ```

6. **Create Music Widgets**

   ```dart
   class SongListTile extends StatelessWidget {
     final Song song;
     final VoidCallback onTap;
     final VoidCallback? onAddToPlaylist;

     const SongListTile({
       required this.song,
       required this.onTap,
       this.onAddToPlaylist,
     });

     @override
     Widget build(BuildContext context) {
       return ListTile(
         leading: song.artwork != null
             ? ClipRRect(
                 borderRadius: BorderRadius.circular(4),
                 child: Image.file(
                   File(song.artwork!),
                   width: 56,
                   height: 56,
                   fit: BoxFit.cover,
                 ),
               )
             : Container(
                 width: 56,
                 height: 56,
                 decoration: BoxDecoration(
                   color: Colors.grey[300],
                   borderRadius: BorderRadius.circular(4),
                 ),
                 child: Icon(Icons.music_note),
               ),
         title: Text(song.title),
         subtitle: Text(song.artist),
         trailing: onAddToPlaylist != null
             ? IconButton(
                 icon: Icon(Icons.playlist_add),
                 onPressed: onAddToPlaylist,
               )
             : null,
         onTap: onTap,
       );
     }
   }

   class MiniPlayer extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Consumer<MusicProvider>(
         builder: (context, provider, child) {
           if (provider.currentSong == null) return SizedBox.shrink();

           return Container(
             height: 64,
             decoration: BoxDecoration(
               color: Theme.of(context).cardColor,
               boxShadow: [
                 BoxShadow(
                   color: Colors.black12,
                   blurRadius: 4,
                   offset: Offset(0, -2),
                 ),
               ],
             ),
             child: ListTile(
               leading: provider.currentSong!.artwork != null
                   ? ClipRRect(
                       borderRadius: BorderRadius.circular(4),
                       child: Image.file(
                         File(provider.currentSong!.artwork!),
                         width: 48,
                         height: 48,
                         fit: BoxFit.cover,
                       ),
                     )
                   : Container(
                       width: 48,
                       height: 48,
                       decoration: BoxDecoration(
                         color: Colors.grey[300],
                         borderRadius: BorderRadius.circular(4),
                       ),
                       child: Icon(Icons.music_note),
                     ),
               title: Text(
                 provider.currentSong!.title,
                 maxLines: 1,
                 overflow: TextOverflow.ellipsis,
               ),
               subtitle: Text(
                 provider.currentSong!.artist,
                 maxLines: 1,
                 overflow: TextOverflow.ellipsis,
               ),
               trailing: Row(
                 mainAxisSize: MainAxisSize.min,
                 children: [
                   IconButton(
                     icon: Icon(
                       provider.isPlaying
                           ? Icons.pause
                           : Icons.play_arrow,
                     ),
                     onPressed: () {
                       if (provider.isPlaying) {
                         provider.pause();
                       } else {
                         provider.resume();
                       }
                     },
                   ),
                   IconButton(
                     icon: Icon(Icons.skip_next),
                     onPressed: () {
                       // Implement next song logic
                     },
                   ),
                 ],
               ),
               onTap: () {
                 Navigator.push(
                   context,
                   MaterialPageRoute(
                     builder: (context) => NowPlayingScreen(),
                   ),
                 );
               },
             ),
           );
         },
       );
     }
   }
   ```

7. **Create Now Playing Screen**

   ```dart
   class NowPlayingScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Now Playing'),
         ),
         body: Consumer<MusicProvider>(
           builder: (context, provider, child) {
             if (provider.currentSong == null) {
               return Center(child: Text('No song playing'));
             }

             return Column(
               children: [
                 Expanded(
                   child: Column(
                     mainAxisAlignment: MainAxisAlignment.center,
                     children: [
                       if (provider.currentSong!.artwork != null)
                         ClipRRect(
                           borderRadius: BorderRadius.circular(8),
                           child: Image.file(
                             File(provider.currentSong!.artwork!),
                             width: 300,
                             height: 300,
                             fit: BoxFit.cover,
                           ),
                         )
                       else
                         Container(
                           width: 300,
                           height: 300,
                           decoration: BoxDecoration(
                             color: Colors.grey[300],
                             borderRadius: BorderRadius.circular(8),
                           ),
                           child: Icon(
                             Icons.music_note,
                             size: 100,
                             color: Colors.grey[400],
                           ),
                         ),
                       SizedBox(height: 32),
                       Text(
                         provider.currentSong!.title,
                         style: Theme.of(context).textTheme.headlineSmall,
                         textAlign: TextAlign.center,
                       ),
                       SizedBox(height: 8),
                       Text(
                         provider.currentSong!.artist,
                         style: Theme.of(context).textTheme.titleMedium,
                         textAlign: TextAlign.center,
                       ),
                       SizedBox(height: 32),
                       Slider(
                         value: provider.position.inMilliseconds.toDouble(),
                         max: provider.duration.inMilliseconds.toDouble(),
                         onChanged: (value) {
                           provider.seekTo(
                             Duration(milliseconds: value.toInt()),
                           );
                         },
                       ),
                       Padding(
                         padding: EdgeInsets.symmetric(horizontal: 16),
                         child: Row(
                           mainAxisAlignment: MainAxisAlignment.spaceBetween,
                           children: [
                             Text(
                               _formatDuration(provider.position),
                               style: TextStyle(color: Colors.grey),
                             ),
                             Text(
                               _formatDuration(provider.duration),
                               style: TextStyle(color: Colors.grey),
                             ),
                           ],
                         ),
                       ),
                     ],
                   ),
                 ),
                 Container(
                   padding: EdgeInsets.all(16),
                   child: Row(
                     mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                     children: [
                       IconButton(
                         icon: Icon(
                           provider.isShuffled
                               ? Icons.shuffle
                               : Icons.shuffle_outlined,
                         ),
                         onPressed: () {
                           provider.setShuffle(!provider.isShuffled);
                         },
                       ),
                       IconButton(
                         icon: Icon(Icons.skip_previous),
                         onPressed: () {
                           // Implement previous song logic
                         },
                       ),
                       FloatingActionButton(
                         onPressed: () {
                           if (provider.isPlaying) {
                             provider.pause();
                           } else {
                             provider.resume();
                           }
                         },
                         child: Icon(
                           provider.isPlaying
                               ? Icons.pause
                               : Icons.play_arrow,
                         ),
                       ),
                       IconButton(
                         icon: Icon(Icons.skip_next),
                         onPressed: () {
                           // Implement next song logic
                         },
                       ),
                       IconButton(
                         icon: Icon(
                           provider.repeatMode == RepeatMode.off
                               ? Icons.repeat
                               : Icons.repeat_one,
                         ),
                         onPressed: () {
                           final nextMode = provider.repeatMode == RepeatMode.off
                               ? RepeatMode.all
                               : provider.repeatMode == RepeatMode.all
                                   ? RepeatMode.one
                                   : RepeatMode.off;
                           provider.setRepeatMode(nextMode);
                         },
                       ),
                     ],
                   ),
                 ),
               ],
             );
           },
         ),
       );
     }

     String _formatDuration(Duration duration) {
       String twoDigits(int n) => n.toString().padLeft(2, '0');
       final minutes = twoDigits(duration.inMinutes.remainder(60));
       final seconds = twoDigits(duration.inSeconds.remainder(60));
       return '$minutes:$seconds';
     }
   }
   ```

8. **Create Main Music Screen**

   ```dart
   class MusicScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Music'),
           actions: [
             IconButton(
               icon: Icon(Icons.playlist_play),
               onPressed: () {
                 Navigator.push(
                   context,
                   MaterialPageRoute(
                     builder: (context) => PlaylistsScreen(),
                   ),
                 );
               },
             ),
           ],
         ),
         body: Consumer<MusicProvider>(
           builder: (context, provider, child) {
             if (provider.songs.isEmpty) {
               return Center(
                 child: Text('No songs found'),
               );
             }

             return ListView.builder(
               itemCount: provider.songs.length,
               itemBuilder: (context, index) {
                 final song = provider.songs[index];
                 return SongListTile(
                   song: song,
                   onTap: () => provider.playSong(song),
                   onAddToPlaylist: () {
                     showDialog(
                       context: context,
                       builder: (context) => AddToPlaylistDialog(song: song),
                     );
                   },
                 );
               },
             );
           },
         ),
         bottomNavigationBar: MiniPlayer(),
       );
     }
   }
   ```

## Best Practices

1. **Audio Handling**

   - Handle audio focus
   - Manage background playback
   - Handle audio interruptions
   - Implement proper error handling

2. **State Management**

   - Use proper state management
   - Handle player state
   - Manage playlists
   - Handle user preferences

3. **User Experience**

   - Show loading states
   - Provide error feedback
   - Add animations
   - Handle gestures

4. **Performance**
   - Optimize audio loading
   - Handle large playlists
   - Cache metadata
   - Clean up resources

## Conclusion

This tutorial has shown you how to create a music player app with features like:

- Local music playback
- Playlist management
- Background playback
- Audio controls
- Mini player
- Search functionality

You can extend this app by adding:

- Online music streaming
- Equalizer
- Lyrics display
- Sleep timer
- Audio visualization
- Custom themes

Remember to:

- Handle errors gracefully
- Test thoroughly
- Consider accessibility
- Follow platform guidelines
- Optimize performance

This app provides a solid foundation for learning Flutter's audio handling, background playback, and state management.
