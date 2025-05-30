---
title: "Voice Recorder App in Flutter"
summary: "Record audio and save locally"
date: "2025, 04, 02"
tags: ["flutter", "audio", "recording", "storage", "permissions"]
difficulty: "advanced"
draft: false
---

## Voice Recorder App in Flutter

Creating a voice recorder app in Flutter allows users to record, save, and manage audio recordings. This tutorial will guide you through building a feature-rich voice recorder with various options and controls.

## Features

- Audio recording
- Recording playback
- Recording list
- Recording duration
- Audio visualization
- File management
- Background recording
- Audio format options

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     record: ^5.0.4
     audioplayers: ^5.2.1
     path_provider: ^2.1.2
     permission_handler: ^11.2.0
     provider: ^6.1.1
     intl: ^0.19.0
     just_audio: ^0.9.36
     audio_session: ^0.1.18
   ```

2. **Configure Platform Settings**

   ```xml
   <!-- android/app/src/main/AndroidManifest.xml -->
   <manifest ...>
     <uses-permission android:name="android.permission.RECORD_AUDIO" />
     <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
     <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
   </manifest>
   ```

   ```xml
   <!-- ios/Runner/Info.plist -->
   <dict>
     <key>NSMicrophoneUsageDescription</key>
     <string>This app needs microphone access to record audio</string>
   </dict>
   ```

3. **Create Audio Service**

   ```dart
   class AudioService {
     final Record _record = Record();
     final AudioPlayer _player = AudioPlayer();
     final AudioSession _session = AudioSession();

     Future<void> initialize() async {
       await _session.configure(const AudioSessionConfiguration.speech());
     }

     Future<bool> startRecording() async {
       try {
         if (await _record.hasPermission()) {
           final directory = await getApplicationDocumentsDirectory();
           final path = '${directory.path}/recording_${DateTime.now().millisecondsSinceEpoch}.m4a';
           await _record.start(
             path: path,
             encoder: AudioEncoder.aacLc,
             bitRate: 128000,
             samplingRate: 44100,
           );
           return true;
         }
         return false;
       } catch (e) {
         print('Error starting recording: $e');
         return false;
       }
     }

     Future<String?> stopRecording() async {
       try {
         final path = await _record.stop();
         return path;
       } catch (e) {
         print('Error stopping recording: $e');
         return null;
       }
     }

     Future<void> playRecording(String path) async {
       try {
         await _player.play(DeviceFileSource(path));
       } catch (e) {
         print('Error playing recording: $e');
       }
     }

     Future<void> pauseRecording() async {
       try {
         await _player.pause();
       } catch (e) {
         print('Error pausing recording: $e');
       }
     }

     Future<void> stopPlayback() async {
       try {
         await _player.stop();
       } catch (e) {
         print('Error stopping playback: $e');
       }
     }

     Stream<Duration> get positionStream => _player.positionStream;
     Stream<Duration?> get durationStream => _player.durationStream;
     Stream<PlayerState> get playerStateStream => _player.playerStateStream;

     bool get isRecording => _record.isRecording();
     Future<bool> get hasPermission => _record.hasPermission();

     void dispose() {
       _record.dispose();
       _player.dispose();
     }
   }
   ```

4. **Create Recording Model**

   ```dart
   class Recording {
     final String id;
     final String path;
     final String name;
     final Duration duration;
     final DateTime createdAt;

     Recording({
       required this.id,
       required this.path,
       required this.name,
       required this.duration,
       required this.createdAt,
     });

     factory Recording.fromJson(Map<String, dynamic> json) {
       return Recording(
         id: json['id'],
         path: json['path'],
         name: json['name'],
         duration: Duration(milliseconds: json['duration']),
         createdAt: DateTime.parse(json['createdAt']),
       );
     }

     Map<String, dynamic> toJson() {
       return {
         'id': id,
         'path': path,
         'name': name,
         'duration': duration.inMilliseconds,
         'createdAt': createdAt.toIso8601String(),
       };
     }
   }
   ```

5. **Create Recording Provider**

   ```dart
   class RecordingProvider extends ChangeNotifier {
     final AudioService _audioService;
     final SharedPreferences _prefs;
     List<Recording> _recordings = [];
     Recording? _currentRecording;
     bool _isRecording = false;
     bool _isPlaying = false;
     Duration _recordingDuration = Duration.zero;
     String? _error;

     RecordingProvider({
       required AudioService audioService,
       required SharedPreferences prefs,
     })  : _audioService = audioService,
           _prefs = prefs {
       _loadRecordings();
     }

     List<Recording> get recordings => _recordings;
     Recording? get currentRecording => _currentRecording;
     bool get isRecording => _isRecording;
     bool get isPlaying => _isPlaying;
     Duration get recordingDuration => _recordingDuration;
     String? get error => _error;

     Future<void> startRecording() async {
       _isRecording = true;
       _error = null;
       notifyListeners();

       try {
         final success = await _audioService.startRecording();
         if (!success) {
           _error = 'Failed to start recording';
           _isRecording = false;
           notifyListeners();
           return;
         }

         _startDurationTimer();
       } catch (e) {
         _error = e.toString();
         _isRecording = false;
         notifyListeners();
       }
     }

     Future<void> stopRecording() async {
       try {
         final path = await _audioService.stopRecording();
         if (path != null) {
           final recording = Recording(
             id: DateTime.now().millisecondsSinceEpoch.toString(),
             path: path,
             name: 'Recording ${_recordings.length + 1}',
             duration: _recordingDuration,
             createdAt: DateTime.now(),
           );

           _recordings.add(recording);
           await _saveRecordings();
         }
       } catch (e) {
         _error = e.toString();
       } finally {
         _isRecording = false;
         _recordingDuration = Duration.zero;
         notifyListeners();
       }
     }

     Future<void> playRecording(Recording recording) async {
       _currentRecording = recording;
       _isPlaying = true;
       notifyListeners();

       try {
         await _audioService.playRecording(recording.path);
       } catch (e) {
         _error = e.toString();
         _isPlaying = false;
         notifyListeners();
       }
     }

     Future<void> pausePlayback() async {
       await _audioService.pauseRecording();
       _isPlaying = false;
       notifyListeners();
     }

     Future<void> stopPlayback() async {
       await _audioService.stopPlayback();
       _isPlaying = false;
       _currentRecording = null;
       notifyListeners();
     }

     Future<void> deleteRecording(String id) async {
       _recordings.removeWhere((r) => r.id == id);
       await _saveRecordings();
       notifyListeners();
     }

     Future<void> renameRecording(String id, String newName) async {
       final index = _recordings.indexWhere((r) => r.id == id);
       if (index != -1) {
         final recording = _recordings[index];
         _recordings[index] = Recording(
           id: recording.id,
           path: recording.path,
           name: newName,
           duration: recording.duration,
           createdAt: recording.createdAt,
         );
         await _saveRecordings();
         notifyListeners();
       }
     }

     void _startDurationTimer() {
       Timer.periodic(Duration(seconds: 1), (timer) {
         if (_isRecording) {
           _recordingDuration += Duration(seconds: 1);
           notifyListeners();
         } else {
           timer.cancel();
         }
       });
     }

     Future<void> _loadRecordings() async {
       final recordingsJson = _prefs.getStringList('recordings') ?? [];
       _recordings = recordingsJson
           .map((json) => Recording.fromJson(jsonDecode(json)))
           .toList();
       notifyListeners();
     }

     Future<void> _saveRecordings() async {
       final recordingsJson = _recordings
           .map((r) => jsonEncode(r.toJson()))
           .toList();
       await _prefs.setStringList('recordings', recordingsJson);
     }

     @override
     void dispose() {
       _audioService.dispose();
       super.dispose();
     }
   }
   ```

6. **Create Recording Widgets**

   ```dart
   class RecordingControls extends StatelessWidget {
     final bool isRecording;
     final bool isPlaying;
     final Duration duration;
     final VoidCallback onStart;
     final VoidCallback onStop;
     final VoidCallback onPlay;
     final VoidCallback onPause;

     const RecordingControls({
       required this.isRecording,
       required this.isPlaying,
       required this.duration,
       required this.onStart,
       required this.onStop,
       required this.onPlay,
       required this.onPause,
     });

     @override
     Widget build(BuildContext context) {
       return Column(
         children: [
           Text(
             _formatDuration(duration),
             style: Theme.of(context).textTheme.headlineMedium,
           ),
           SizedBox(height: 16),
           Row(
             mainAxisAlignment: MainAxisAlignment.center,
             children: [
               if (!isRecording && !isPlaying)
                 IconButton(
                   icon: Icon(Icons.mic),
                   onPressed: onStart,
                   color: Colors.red,
                   iconSize: 48,
                 )
               else if (isRecording)
                 IconButton(
                   icon: Icon(Icons.stop),
                   onPressed: onStop,
                   color: Colors.red,
                   iconSize: 48,
                 )
               else
                 IconButton(
                   icon: Icon(isPlaying ? Icons.pause : Icons.play_arrow),
                   onPressed: isPlaying ? onPause : onPlay,
                   color: Colors.blue,
                   iconSize: 48,
                 ),
             ],
           ),
         ],
       );
     }

     String _formatDuration(Duration duration) {
       String twoDigits(int n) => n.toString().padLeft(2, '0');
       final minutes = twoDigits(duration.inMinutes.remainder(60));
       final seconds = twoDigits(duration.inSeconds.remainder(60));
       return '$minutes:$seconds';
     }
   }

   class RecordingList extends StatelessWidget {
     final List<Recording> recordings;
     final Function(Recording) onPlay;
     final Function(String) onDelete;
     final Function(String, String) onRename;

     const RecordingList({
       required this.recordings,
       required this.onPlay,
       required this.onDelete,
       required this.onRename,
     });

     @override
     Widget build(BuildContext context) {
       return ListView.builder(
         itemCount: recordings.length,
         itemBuilder: (context, index) {
           final recording = recordings[index];
           return ListTile(
             leading: Icon(Icons.mic),
             title: Text(recording.name),
             subtitle: Text(
               '${_formatDuration(recording.duration)} - ${_formatDate(recording.createdAt)}',
             ),
             trailing: Row(
               mainAxisSize: MainAxisSize.min,
               children: [
                 IconButton(
                   icon: Icon(Icons.play_arrow),
                   onPressed: () => onPlay(recording),
                 ),
                 IconButton(
                   icon: Icon(Icons.delete),
                   onPressed: () => onDelete(recording.id),
                 ),
               ],
             ),
             onTap: () => _showRenameDialog(context, recording),
           );
         },
       );
     }

     String _formatDuration(Duration duration) {
       String twoDigits(int n) => n.toString().padLeft(2, '0');
       final minutes = twoDigits(duration.inMinutes.remainder(60));
       final seconds = twoDigits(duration.inSeconds.remainder(60));
       return '$minutes:$seconds';
     }

     String _formatDate(DateTime date) {
       return DateFormat.yMMMd().add_jm().format(date);
     }

     Future<void> _showRenameDialog(BuildContext context, Recording recording) async {
       final controller = TextEditingController(text: recording.name);
       return showDialog(
         context: context,
         builder: (context) => AlertDialog(
           title: Text('Rename Recording'),
           content: TextField(
             controller: controller,
             decoration: InputDecoration(
               labelText: 'Name',
               border: OutlineInputBorder(),
             ),
           ),
           actions: [
             TextButton(
               onPressed: () => Navigator.pop(context),
               child: Text('Cancel'),
             ),
             TextButton(
               onPressed: () {
                 onRename(recording.id, controller.text);
                 Navigator.pop(context);
               },
               child: Text('Rename'),
             ),
           ],
         ),
       );
     }
   }
   ```

7. **Create Main Screen**

   ```dart
   class VoiceRecorderScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Voice Recorder'),
         ),
         body: Consumer<RecordingProvider>(
           builder: (context, provider, child) {
             if (provider.error != null) {
               return Center(
                 child: Text(provider.error!),
               );
             }

             return Column(
               children: [
                 Padding(
                   padding: EdgeInsets.all(16),
                   child: RecordingControls(
                     isRecording: provider.isRecording,
                     isPlaying: provider.isPlaying,
                     duration: provider.recordingDuration,
                     onStart: () => provider.startRecording(),
                     onStop: () => provider.stopRecording(),
                     onPlay: () {
                       if (provider.currentRecording != null) {
                         provider.playRecording(provider.currentRecording!);
                       }
                     },
                     onPause: () => provider.pausePlayback(),
                   ),
                 ),
                 Expanded(
                   child: RecordingList(
                     recordings: provider.recordings,
                     onPlay: (recording) => provider.playRecording(recording),
                     onDelete: (id) => provider.deleteRecording(id),
                     onRename: (id, name) => provider.renameRecording(id, name),
                   ),
                 ),
               ],
             );
           },
         ),
       );
     }
   }
   ```

## Best Practices

1. **Performance**

   - Handle audio sessions
   - Manage resources
   - Optimize storage
   - Handle background

2. **User Experience**

   - Show recording status
   - Provide feedback
   - Handle errors
   - Support gestures

3. **Security**

   - Request permissions
   - Validate files
   - Handle sensitive data
   - Secure storage

4. **Testing**
   - Test permissions
   - Verify recording
   - Check playback
   - Test edge cases

## Conclusion

This tutorial has shown you how to implement a voice recorder app in Flutter with features like:

- Audio recording
- Recording playback
- Recording management
- Duration tracking
- File handling

You can extend this implementation by adding:

- Audio effects
- Waveform visualization
- Cloud storage
- Sharing options
- Background recording

Remember to:

- Handle permissions properly
- Test on multiple devices
- Consider performance
- Follow platform guidelines
- Keep dependencies updated

This implementation provides a solid foundation for creating a voice recorder app in Flutter.
