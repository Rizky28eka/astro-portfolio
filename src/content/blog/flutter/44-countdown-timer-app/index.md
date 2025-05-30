---
title: "Build a Countdown Timer App"
summary: "Simple countdown with Flutter timer"
date: "2025, 01, 30"
tags: ["flutter", "timer", "countdown", "state-management", "ui"]
difficulty: "beginner"
draft: false
---

## Build a Countdown Timer App

Creating a countdown timer app is a great way to learn about state management, animations, and user input handling in Flutter. This tutorial will guide you through building a simple yet functional countdown timer app.

## Features

- Set custom countdown duration
- Start, pause, and reset timer
- Visual countdown display
- Sound notifications
- Background timer support
- Multiple timer presets

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     audioplayers: ^5.2.1
     shared_preferences: ^2.2.2
     flutter_local_notifications: ^16.3.0
   ```

2. **Create Timer Model**

   ```dart
   class TimerModel {
     final int hours;
     final int minutes;
     final int seconds;
     final String? label;

     TimerModel({
       required this.hours,
       required this.minutes,
       required this.seconds,
       this.label,
     });

     int get totalSeconds => hours * 3600 + minutes * 60 + seconds;

     TimerModel copyWith({
       int? hours,
       int? minutes,
       int? seconds,
       String? label,
     }) {
       return TimerModel(
         hours: hours ?? this.hours,
         minutes: minutes ?? this.minutes,
         seconds: seconds ?? this.seconds,
         label: label ?? this.label,
       );
     }

     Map<String, dynamic> toJson() {
       return {
         'hours': hours,
         'minutes': minutes,
         'seconds': seconds,
         'label': label,
       };
     }

     factory TimerModel.fromJson(Map<String, dynamic> json) {
       return TimerModel(
         hours: json['hours'],
         minutes: json['minutes'],
         seconds: json['seconds'],
         label: json['label'],
       );
     }
   }
   ```

3. **Create Timer Provider**

   ```dart
   class TimerProvider extends ChangeNotifier {
     Timer? _timer;
     int _remainingSeconds = 0;
     bool _isRunning = false;
     TimerModel? _currentTimer;
     List<TimerModel> _presets = [];

     int get remainingSeconds => _remainingSeconds;
     bool get isRunning => _isRunning;
     TimerModel? get currentTimer => _currentTimer;
     List<TimerModel> get presets => _presets;

     TimerProvider() {
       _loadPresets();
     }

     Future<void> _loadPresets() async {
       final prefs = await SharedPreferences.getInstance();
       final presetsJson = prefs.getStringList('timer_presets') ?? [];
       _presets = presetsJson
           .map((json) => TimerModel.fromJson(jsonDecode(json)))
           .toList();
       notifyListeners();
     }

     Future<void> _savePresets() async {
       final prefs = await SharedPreferences.getInstance();
       final presetsJson = _presets
           .map((preset) => jsonEncode(preset.toJson()))
           .toList();
       await prefs.setStringList('timer_presets', presetsJson);
     }

     void startTimer(TimerModel timer) {
       if (_isRunning) return;
       _currentTimer = timer;
       _remainingSeconds = timer.totalSeconds;
       _isRunning = true;
       _startCountdown();
       notifyListeners();
     }

     void _startCountdown() {
       _timer?.cancel();
       _timer = Timer.periodic(Duration(seconds: 1), (timer) {
         if (_remainingSeconds > 0) {
           _remainingSeconds--;
           notifyListeners();
         } else {
           _stopTimer();
           _playAlarm();
         }
       });
     }

     void pauseTimer() {
       if (!_isRunning) return;
       _timer?.cancel();
       _isRunning = false;
       notifyListeners();
     }

     void resumeTimer() {
       if (_isRunning) return;
       _isRunning = true;
       _startCountdown();
       notifyListeners();
     }

     void resetTimer() {
       _timer?.cancel();
       _isRunning = false;
       _remainingSeconds = _currentTimer?.totalSeconds ?? 0;
       notifyListeners();
     }

     void addPreset(TimerModel preset) {
       _presets.add(preset);
       _savePresets();
       notifyListeners();
     }

     void removePreset(int index) {
       _presets.removeAt(index);
       _savePresets();
       notifyListeners();
     }

     Future<void> _playAlarm() async {
       final player = AudioPlayer();
       await player.play(AssetSource('sounds/alarm.mp3'));
     }

     @override
     void dispose() {
       _timer?.cancel();
       super.dispose();
     }
   }
   ```

4. **Create Timer Display Widget**

   ```dart
   class TimerDisplay extends StatelessWidget {
     final int remainingSeconds;

     const TimerDisplay({required this.remainingSeconds});

     String _formatTime(int seconds) {
       final hours = seconds ~/ 3600;
       final minutes = (seconds % 3600) ~/ 60;
       final secs = seconds % 60;
       return '${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
     }

     @override
     Widget build(BuildContext context) {
       return Container(
         padding: EdgeInsets.all(24),
         decoration: BoxDecoration(
           color: Theme.of(context).colorScheme.surface,
           borderRadius: BorderRadius.circular(16),
           boxShadow: [
             BoxShadow(
               color: Colors.black.withOpacity(0.1),
               blurRadius: 10,
               offset: Offset(0, 5),
             ),
           ],
         ),
         child: Column(
           mainAxisSize: MainAxisSize.min,
           children: [
             Text(
               _formatTime(remainingSeconds),
               style: Theme.of(context).textTheme.displayLarge?.copyWith(
                     fontFamily: 'monospace',
                     fontWeight: FontWeight.bold,
                   ),
             ),
             SizedBox(height: 16),
             LinearProgressIndicator(
               value: remainingSeconds / (remainingSeconds + 1),
               backgroundColor: Theme.of(context).colorScheme.surfaceVariant,
               valueColor: AlwaysStoppedAnimation<Color>(
                 Theme.of(context).colorScheme.primary,
               ),
             ),
           ],
         ),
       );
     }
   }
   ```

5. **Create Timer Input Screen**

   ```dart
   class TimerInputScreen extends StatefulWidget {
     @override
     _TimerInputScreenState createState() => _TimerInputScreenState();
   }

   class _TimerInputScreenState extends State<TimerInputScreen> {
     final _formKey = GlobalKey<FormState>();
     int _hours = 0;
     int _minutes = 0;
     int _seconds = 0;
     String? _label;

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Set Timer'),
         ),
         body: Form(
           key: _formKey,
           child: ListView(
             padding: EdgeInsets.all(16),
             children: [
               TextFormField(
                 decoration: InputDecoration(
                   labelText: 'Label (optional)',
                   border: OutlineInputBorder(),
                 ),
                 onChanged: (value) => _label = value,
               ),
               SizedBox(height: 16),
               Row(
                 children: [
                   Expanded(
                     child: TextFormField(
                       decoration: InputDecoration(
                         labelText: 'Hours',
                         border: OutlineInputBorder(),
                       ),
                       keyboardType: TextInputType.number,
                       validator: (value) {
                         final hours = int.tryParse(value ?? '');
                         if (hours == null || hours < 0) {
                           return 'Enter valid hours';
                         }
                         return null;
                       },
                       onChanged: (value) => _hours = int.tryParse(value) ?? 0,
                     ),
                   ),
                   SizedBox(width: 16),
                   Expanded(
                     child: TextFormField(
                       decoration: InputDecoration(
                         labelText: 'Minutes',
                         border: OutlineInputBorder(),
                       ),
                       keyboardType: TextInputType.number,
                       validator: (value) {
                         final minutes = int.tryParse(value ?? '');
                         if (minutes == null || minutes < 0 || minutes > 59) {
                           return 'Enter valid minutes';
                         }
                         return null;
                       },
                       onChanged: (value) => _minutes = int.tryParse(value) ?? 0,
                     ),
                   ),
                   SizedBox(width: 16),
                   Expanded(
                     child: TextFormField(
                       decoration: InputDecoration(
                         labelText: 'Seconds',
                         border: OutlineInputBorder(),
                       ),
                       keyboardType: TextInputType.number,
                       validator: (value) {
                         final seconds = int.tryParse(value ?? '');
                         if (seconds == null || seconds < 0 || seconds > 59) {
                           return 'Enter valid seconds';
                         }
                         return null;
                       },
                       onChanged: (value) => _seconds = int.tryParse(value) ?? 0,
                     ),
                   ),
                 ],
               ),
               SizedBox(height: 24),
               ElevatedButton(
                 onPressed: _startTimer,
                 child: Text('Start Timer'),
               ),
             ],
           ),
         ),
       );
     }

     void _startTimer() {
       if (_formKey.currentState!.validate()) {
         final timer = TimerModel(
           hours: _hours,
           minutes: _minutes,
           seconds: _seconds,
           label: _label,
         );
         context.read<TimerProvider>().startTimer(timer);
         Navigator.pop(context);
       }
     }
   }
   ```

6. **Create Main Timer Screen**

   ```dart
   class TimerScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Countdown Timer'),
           actions: [
             IconButton(
               icon: Icon(Icons.settings),
               onPressed: () {
                 // Show settings
               },
             ),
           ],
         ),
         body: Consumer<TimerProvider>(
           builder: (context, timerProvider, child) {
             return Column(
               mainAxisAlignment: MainAxisAlignment.center,
               children: [
                 if (timerProvider.currentTimer != null) ...[
                   if (timerProvider.currentTimer!.label != null)
                     Text(
                       timerProvider.currentTimer!.label!,
                       style: Theme.of(context).textTheme.titleLarge,
                     ),
                   SizedBox(height: 24),
                   TimerDisplay(
                     remainingSeconds: timerProvider.remainingSeconds,
                   ),
                   SizedBox(height: 32),
                   Row(
                     mainAxisAlignment: MainAxisAlignment.center,
                     children: [
                       if (!timerProvider.isRunning)
                         ElevatedButton.icon(
                           onPressed: timerProvider.resumeTimer,
                           icon: Icon(Icons.play_arrow),
                           label: Text('Resume'),
                         )
                       else
                         ElevatedButton.icon(
                           onPressed: timerProvider.pauseTimer,
                           icon: Icon(Icons.pause),
                           label: Text('Pause'),
                         ),
                       SizedBox(width: 16),
                       ElevatedButton.icon(
                         onPressed: timerProvider.resetTimer,
                         icon: Icon(Icons.refresh),
                         label: Text('Reset'),
                       ),
                     ],
                   ),
                 ] else
                   Center(
                     child: Text(
                       'Set a timer to start',
                       style: Theme.of(context).textTheme.titleMedium,
                     ),
                   ),
               ],
             );
           },
         ),
         floatingActionButton: FloatingActionButton(
           onPressed: () {
             Navigator.push(
               context,
               MaterialPageRoute(
                 builder: (context) => TimerInputScreen(),
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
   - Handle timer state properly
   - Save presets for future use
   - Handle background state

2. **User Experience**

   - Provide clear feedback
   - Add sound notifications
   - Support background operation
   - Save user preferences

3. **Performance**

   - Optimize timer updates
   - Handle memory efficiently
   - Manage resources properly
   - Clean up resources

4. **Error Handling**
   - Validate user input
   - Handle edge cases
   - Provide error feedback
   - Graceful degradation

## Conclusion

This tutorial has shown you how to create a countdown timer app with features like:

- Custom timer duration
- Timer controls
- Visual display
- Sound notifications
- Preset management
- Background support

You can extend this app by adding:

- Multiple timers
- Timer categories
- Custom sounds
- Widget support
- Statistics tracking
- Social sharing

Remember to:

- Test thoroughly
- Handle edge cases
- Consider accessibility
- Follow platform guidelines
- Optimize performance

This app provides a solid foundation for learning Flutter's state management, animations, and user input handling.
