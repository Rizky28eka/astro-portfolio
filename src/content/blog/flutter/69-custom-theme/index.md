---
title: "Custom Theme System"
summary: "Create a flexible and dynamic theming solution"
date: "2025, 04, 08"
tags:
  ["flutter", "theming", "design-system", "dynamic-theme", "material-design"]
difficulty: "advanced"
draft: false
---

## Custom Theme System

Creating a custom theme system in Flutter allows for consistent design, dynamic theming, and better user experience. This tutorial will guide you through implementing a custom theme system with features like theme switching, color schemes, and typography.

## Features

- Dynamic theme switching
- Color schemes
- Typography
- Component themes
- Theme persistence
- Dark mode
- Custom themes
- Theme extensions
- Theme animations
- Theme preview

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     flutter:
       sdk: flutter
     shared_preferences: ^2.2.2
     provider: ^6.1.1
     google_fonts: ^6.1.0
   ```

2. **Create Theme Models**

   ```dart
   class AppTheme {
     final String name;
     final ColorScheme colorScheme;
     final TextTheme textTheme;
     final ComponentTheme componentTheme;
     final Map<String, dynamic> customTheme;

     AppTheme({
       required this.name,
       required this.colorScheme,
       required this.textTheme,
       required this.componentTheme,
       this.customTheme = const {},
     });

     ThemeData toThemeData() {
       return ThemeData(
         colorScheme: colorScheme,
         textTheme: textTheme,
         useMaterial3: true,
         extensions: [
           componentTheme,
         ],
       );
     }

     AppTheme copyWith({
       String? name,
       ColorScheme? colorScheme,
       TextTheme? textTheme,
       ComponentTheme? componentTheme,
       Map<String, dynamic>? customTheme,
     }) {
       return AppTheme(
         name: name ?? this.name,
         colorScheme: colorScheme ?? this.colorScheme,
         textTheme: textTheme ?? this.textTheme,
         componentTheme: componentTheme ?? this.componentTheme,
         customTheme: customTheme ?? this.customTheme,
       );
     }
   }

   class ComponentTheme {
     final double borderRadius;
     final double padding;
     final double spacing;
     final Map<String, dynamic> customStyles;

     ComponentTheme({
       required this.borderRadius,
       required this.padding,
       required this.spacing,
       this.customStyles = const {},
     });

     ComponentTheme copyWith({
       double? borderRadius,
       double? padding,
       double? spacing,
       Map<String, dynamic>? customStyles,
     }) {
       return ComponentTheme(
         borderRadius: borderRadius ?? this.borderRadius,
         padding: padding ?? this.padding,
         spacing: spacing ?? this.spacing,
         customStyles: customStyles ?? this.customStyles,
       );
     }
   }
   ```

3. **Create Theme Provider**

   ```dart
   class ThemeProvider extends ChangeNotifier {
     final SharedPreferences _prefs;
     AppTheme _currentTheme;
     bool _isDarkMode;

     ThemeProvider({
       required SharedPreferences prefs,
       required AppTheme initialTheme,
       bool initialDarkMode = false,
     })  : _prefs = prefs,
           _currentTheme = initialTheme,
           _isDarkMode = initialDarkMode {
       _loadTheme();
     }

     AppTheme get currentTheme => _currentTheme;
     bool get isDarkMode => _isDarkMode;

     Future<void> _loadTheme() async {
       final themeName = _prefs.getString('theme_name');
       final isDark = _prefs.getBool('is_dark_mode') ?? false;

       if (themeName != null) {
         _currentTheme = await _getThemeByName(themeName);
       }

       _isDarkMode = isDark;
       _updateTheme();
       notifyListeners();
     }

     Future<AppTheme> _getThemeByName(String name) async {
       // Implement theme loading logic
       return _currentTheme;
     }

     void _updateTheme() {
       if (_isDarkMode) {
         _currentTheme = _currentTheme.copyWith(
           colorScheme: _currentTheme.colorScheme.copyWith(
             brightness: Brightness.dark,
           ),
         );
       } else {
         _currentTheme = _currentTheme.copyWith(
           colorScheme: _currentTheme.colorScheme.copyWith(
             brightness: Brightness.light,
           ),
         );
       }
     }

     Future<void> setTheme(AppTheme theme) async {
       _currentTheme = theme;
       await _prefs.setString('theme_name', theme.name);
       notifyListeners();
     }

     Future<void> toggleDarkMode() async {
       _isDarkMode = !_isDarkMode;
       await _prefs.setBool('is_dark_mode', _isDarkMode);
       _updateTheme();
       notifyListeners();
     }

     Future<void> updateComponentTheme(ComponentTheme theme) async {
       _currentTheme = _currentTheme.copyWith(
         componentTheme: theme,
       );
       notifyListeners();
     }
   }
   ```

4. **Create Theme Extensions**

   ```dart
   class CustomThemeExtension extends ThemeExtension<CustomThemeExtension> {
     final Color customColor;
     final TextStyle customTextStyle;
     final double customSpacing;

     CustomThemeExtension({
       required this.customColor,
       required this.customTextStyle,
       required this.customSpacing,
     });

     @override
     ThemeExtension<CustomThemeExtension> copyWith({
       Color? customColor,
       TextStyle? customTextStyle,
       double? customSpacing,
     }) {
       return CustomThemeExtension(
         customColor: customColor ?? this.customColor,
         customTextStyle: customTextStyle ?? this.customTextStyle,
         customSpacing: customSpacing ?? this.customSpacing,
       );
     }

     @override
     ThemeExtension<CustomThemeExtension> lerp(
       ThemeExtension<CustomThemeExtension>? other,
       double t,
     ) {
       if (other is! CustomThemeExtension) {
         return this;
       }

       return CustomThemeExtension(
         customColor: Color.lerp(customColor, other.customColor, t)!,
         customTextStyle: TextStyle.lerp(
           customTextStyle,
           other.customTextStyle,
           t,
         )!,
         customSpacing: lerpDouble(customSpacing, other.customSpacing, t)!,
       );
     }
   }
   ```

5. **Create Theme Widgets**

   ```dart
   class ThemePreview extends StatelessWidget {
     final AppTheme theme;
     final bool isDarkMode;

     const ThemePreview({
       required this.theme,
       required this.isDarkMode,
     });

     @override
     Widget build(BuildContext context) {
       return Container(
         padding: EdgeInsets.all(16),
         decoration: BoxDecoration(
           color: theme.colorScheme.surface,
           borderRadius: BorderRadius.circular(8),
           border: Border.all(
             color: theme.colorScheme.outline,
           ),
         ),
         child: Column(
           crossAxisAlignment: CrossAxisAlignment.start,
           children: [
             Text(
               'Theme Preview',
               style: theme.textTheme.titleLarge,
             ),
             SizedBox(height: 16),
             _buildColorPreview(theme.colorScheme),
             SizedBox(height: 16),
             _buildTypographyPreview(theme.textTheme),
             SizedBox(height: 16),
             _buildComponentPreview(theme.componentTheme),
           ],
         ),
       );
     }

     Widget _buildColorPreview(ColorScheme colorScheme) {
       return Wrap(
         spacing: 8,
         runSpacing: 8,
         children: [
           _buildColorBox('Primary', colorScheme.primary),
           _buildColorBox('Secondary', colorScheme.secondary),
           _buildColorBox('Surface', colorScheme.surface),
           _buildColorBox('Background', colorScheme.background),
           _buildColorBox('Error', colorScheme.error),
         ],
       );
     }

     Widget _buildColorBox(String name, Color color) {
       return Column(
         children: [
           Container(
             width: 48,
             height: 48,
             decoration: BoxDecoration(
               color: color,
               borderRadius: BorderRadius.circular(4),
               border: Border.all(
                 color: Colors.grey,
               ),
             ),
           ),
           SizedBox(height: 4),
           Text(
             name,
             style: TextStyle(fontSize: 12),
           ),
         ],
       );
     }

     Widget _buildTypographyPreview(TextTheme textTheme) {
       return Column(
         crossAxisAlignment: CrossAxisAlignment.start,
         children: [
           Text('Headline Large', style: textTheme.headlineLarge),
           Text('Headline Medium', style: textTheme.headlineMedium),
           Text('Body Large', style: textTheme.bodyLarge),
           Text('Body Medium', style: textTheme.bodyMedium),
           Text('Label Large', style: textTheme.labelLarge),
         ],
       );
     }

     Widget _buildComponentPreview(ComponentTheme componentTheme) {
       return Column(
         crossAxisAlignment: CrossAxisAlignment.start,
         children: [
           ElevatedButton(
             onPressed: () {},
             child: Text('Button'),
           ),
           SizedBox(height: 8),
           TextField(
             decoration: InputDecoration(
               labelText: 'Text Field',
               border: OutlineInputBorder(
                 borderRadius: BorderRadius.circular(
                   componentTheme.borderRadius,
                 ),
               ),
             ),
           ),
         ],
       );
     }
   }
   ```

6. **Create Main Screen**

   ```dart
   class ThemeDemoScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Theme Demo'),
           actions: [
             IconButton(
               icon: Icon(Icons.brightness_6),
               onPressed: () {
                 context.read<ThemeProvider>().toggleDarkMode();
               },
             ),
           ],
         ),
         body: Consumer<ThemeProvider>(
           builder: (context, provider, child) {
             return SingleChildScrollView(
               padding: EdgeInsets.all(16),
               child: Column(
                 crossAxisAlignment: CrossAxisAlignment.start,
                 children: [
                   Text(
                     'Current Theme: ${provider.currentTheme.name}',
                     style: Theme.of(context).textTheme.headlineMedium,
                   ),
                   SizedBox(height: 16),
                   Text(
                     'Dark Mode: ${provider.isDarkMode ? 'On' : 'Off'}',
                     style: Theme.of(context).textTheme.titleMedium,
                   ),
                   SizedBox(height: 32),
                   ThemePreview(
                     theme: provider.currentTheme,
                     isDarkMode: provider.isDarkMode,
                   ),
                   SizedBox(height: 32),
                   Wrap(
                     spacing: 8,
                     runSpacing: 8,
                     children: [
                       ElevatedButton(
                         onPressed: () {
                           provider.setTheme(AppTheme(
                             name: 'Light',
                             colorScheme: ColorScheme.light(),
                             textTheme: GoogleFonts.robotoTextTheme(),
                             componentTheme: ComponentTheme(
                               borderRadius: 8,
                               padding: 16,
                               spacing: 8,
                             ),
                           ));
                         },
                         child: Text('Light Theme'),
                       ),
                       ElevatedButton(
                         onPressed: () {
                           provider.setTheme(AppTheme(
                             name: 'Dark',
                             colorScheme: ColorScheme.dark(),
                             textTheme: GoogleFonts.robotoTextTheme(
                               ThemeData.dark().textTheme,
                             ),
                             componentTheme: ComponentTheme(
                               borderRadius: 8,
                               padding: 16,
                               spacing: 8,
                             ),
                           ));
                         },
                         child: Text('Dark Theme'),
                       ),
                     ],
                   ),
                 ],
               ),
             );
           },
         ),
       );
     }
   }
   ```

## Best Practices

1. **Theme Design**

   - Use consistent colors
   - Follow guidelines
   - Consider contrast
   - Support accessibility

2. **Performance**

   - Cache themes
   - Optimize switching
   - Handle animations
   - Manage resources

3. **User Experience**

   - Provide previews
   - Support preferences
   - Handle transitions
   - Consider context

4. **Testing**

   - Test themes
   - Verify contrast
   - Check accessibility
   - Test transitions

## Conclusion

This tutorial has shown you how to implement a custom theme system in Flutter with features like:

- Dynamic theme switching
- Color schemes
- Typography
- Component themes

You can extend this implementation by adding:

- More themes
- Custom components
- Theme animations
- Theme sharing

Remember to:

- Follow guidelines
- Test thoroughly
- Consider users
- Handle edge cases
- Keep code clean

This implementation provides a solid foundation for creating a flexible theme system in Flutter.
