---
title: "Flutter Dark Mode Toggle"
summary: "Implement dark mode in your Flutter app"
date: "2024, 03, 25"
tags: ["flutter", "ui", "dark-mode", "theme"]
difficulty: "beginner"
draft: false
---

## Flutter Dark Mode Toggle

Implementing a dark mode toggle in Flutter allows users to switch between light and dark themes based on their preferences. This guide will show you how to create a smooth and efficient theme switching mechanism in your Flutter application.

## Why Implement Dark Mode?

Dark mode offers several benefits:

- Reduces eye strain
- Saves battery life
- Improves readability
- Modern user experience

## Implementation

1. **Theme Data Setup**

   ```dart
   class AppTheme {
     static ThemeData lightTheme = ThemeData(
       brightness: Brightness.light,
       primaryColor: Colors.blue,
       scaffoldBackgroundColor: Colors.white,
       textTheme: TextTheme(
         bodyLarge: TextStyle(color: Colors.black),
         bodyMedium: TextStyle(color: Colors.black87),
       ),
       // Add more theme properties
     );

     static ThemeData darkTheme = ThemeData(
       brightness: Brightness.dark,
       primaryColor: Colors.blue,
       scaffoldBackgroundColor: Colors.grey[900],
       textTheme: TextTheme(
         bodyLarge: TextStyle(color: Colors.white),
         bodyMedium: TextStyle(color: Colors.white70),
       ),
       // Add more theme properties
     );
   }
   ```

2. **Theme Provider**

   ```dart
   class ThemeProvider extends ChangeNotifier {
     bool _isDarkMode = false;

     bool get isDarkMode => _isDarkMode;

     void toggleTheme() {
       _isDarkMode = !_isDarkMode;
       notifyListeners();
     }
   }
   ```

3. **Main App Setup**

   ```dart
   void main() {
     runApp(
       ChangeNotifierProvider(
         create: (_) => ThemeProvider(),
         child: MyApp(),
       ),
     );
   }

   class MyApp extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Consumer<ThemeProvider>(
         builder: (context, themeProvider, child) {
           return MaterialApp(
             theme: AppTheme.lightTheme,
             darkTheme: AppTheme.darkTheme,
             themeMode: themeProvider.isDarkMode
                 ? ThemeMode.dark
                 : ThemeMode.light,
             home: HomeScreen(),
           );
         },
       );
     }
   }
   ```

4. **Theme Toggle Widget**
   ```dart
   class ThemeToggle extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Consumer<ThemeProvider>(
         builder: (context, themeProvider, child) {
           return Switch(
             value: themeProvider.isDarkMode,
             onChanged: (value) {
               themeProvider.toggleTheme();
             },
             activeColor: Theme.of(context).primaryColor,
           );
         },
       );
     }
   }
   ```

## Advanced Features

1. **System Theme Detection**

   ```dart
   class ThemeProvider extends ChangeNotifier {
     bool _isDarkMode = false;
     bool _isSystemTheme = true;

     bool get isDarkMode => _isSystemTheme
         ? WidgetsBinding.instance.window.platformBrightness == Brightness.dark
         : _isDarkMode;

     void setSystemTheme(bool value) {
       _isSystemTheme = value;
       notifyListeners();
     }
   }
   ```

2. **Theme Persistence**

   ```dart
   class ThemeProvider extends ChangeNotifier {
     static const String _themeKey = 'theme_mode';
     final SharedPreferences _prefs;

     ThemeProvider(this._prefs) {
       _isDarkMode = _prefs.getBool(_themeKey) ?? false;
     }

     Future<void> toggleTheme() async {
       _isDarkMode = !_isDarkMode;
       await _prefs.setBool(_themeKey, _isDarkMode);
       notifyListeners();
     }
   }
   ```

3. **Custom Theme Colors**
   ```dart
   class AppTheme {
     static ThemeData getTheme(bool isDark) {
       return ThemeData(
         brightness: isDark ? Brightness.dark : Brightness.light,
         primaryColor: isDark ? Colors.blue[700] : Colors.blue,
         accentColor: isDark ? Colors.blue[200] : Colors.blue[300],
         // Add more custom colors
       );
     }
   }
   ```

## Best Practices

1. **Theme Consistency**

   - Use consistent color schemes
   - Maintain proper contrast
   - Follow material design guidelines
   - Test on different devices

2. **Performance**

   - Cache theme preferences
   - Optimize theme switching
   - Handle system theme changes
   - Minimize rebuilds

3. **User Experience**
   - Smooth transitions
   - Clear toggle indicators
   - Respect system preferences
   - Provide theme preview

## Common Features

1. **Theme Customization**

   - Custom color schemes
   - Font styles
   - Component themes
   - Animation styles

2. **Theme Management**

   - Theme persistence
   - System theme sync
   - Theme preview
   - Theme reset

3. **Accessibility**
   - High contrast themes
   - Text scaling
   - Color blind support
   - Screen reader support

## Conclusion

Implementing a dark mode toggle in Flutter enhances your app's user experience and accessibility. By following these guidelines and implementing the provided examples, you can create a smooth and efficient theme switching mechanism that respects user preferences and system settings.
