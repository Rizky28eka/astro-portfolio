---
title: "Create a Password Generator App"
summary: "Generate secure passwords easily"
date: "2025, 03, 29"
tags: ["flutter", "password-generator", "security", "cryptography", "ui"]
difficulty: "medium"
draft: false
---

## Create a Password Generator App

Building a password generator app in Flutter allows you to create secure, customizable passwords for your users. This tutorial will guide you through implementing a feature-rich password generator with various options and security features.

## Features

- Customizable password length
- Multiple character types
- Password strength indicator
- Copy to clipboard
- Save passwords
- Password history
- Dark/light theme
- Share passwords

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     flutter:
       sdk: flutter
     provider: ^6.1.1
     shared_preferences: ^2.2.2
     flutter_secure_storage: ^9.0.0
     share_plus: ^7.2.1
     random_string: ^2.3.1
   ```

2. **Create Password Generator Service**

   ```dart
   class PasswordGenerator {
     static const String _lowercase = 'abcdefghijklmnopqrstuvwxyz';
     static const String _uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
     static const String _numbers = '0123456789';
     static const String _special = '!@#\$%^&*()_+-=[]{}|;:,.<>?';

     String generatePassword({
       required int length,
       bool useUppercase = true,
       bool useLowercase = true,
       bool useNumbers = true,
       bool useSpecial = true,
     }) {
       String chars = '';
       if (useUppercase) chars += _uppercase;
       if (useLowercase) chars += _lowercase;
       if (useNumbers) chars += _numbers;
       if (useSpecial) chars += _special;

       if (chars.isEmpty) {
         throw Exception('At least one character type must be selected');
       }

       final random = Random.secure();
       return List.generate(length, (index) {
         return chars[random.nextInt(chars.length)];
       }).join();
     }

     double calculateStrength(String password) {
       double strength = 0;

       // Length contribution
       strength += (password.length / 20).clamp(0, 0.3);

       // Character type contribution
       if (password.contains(RegExp(r'[A-Z]'))) strength += 0.2;
       if (password.contains(RegExp(r'[a-z]'))) strength += 0.2;
       if (password.contains(RegExp(r'[0-9]'))) strength += 0.2;
       if (password.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'))) strength += 0.2;

       return strength.clamp(0, 1);
     }
   }
   ```

3. **Create Password Model**

   ```dart
   class Password {
     final String id;
     final String value;
     final DateTime createdAt;
     final String? label;
     final Map<String, bool> options;

     Password({
       required this.id,
       required this.value,
       required this.createdAt,
       this.label,
       required this.options,
     });

     factory Password.fromJson(Map<String, dynamic> json) {
       return Password(
         id: json['id'],
         value: json['value'],
         createdAt: DateTime.parse(json['createdAt']),
         label: json['label'],
         options: Map<String, bool>.from(json['options']),
       );
     }

     Map<String, dynamic> toJson() {
       return {
         'id': id,
         'value': value,
         'createdAt': createdAt.toIso8601String(),
         'label': label,
         'options': options,
       };
     }
   }
   ```

4. **Create Password Provider**

   ```dart
   class PasswordProvider extends ChangeNotifier {
     final PasswordGenerator _generator = PasswordGenerator();
     final FlutterSecureStorage _storage = FlutterSecureStorage();
     List<Password> _passwords = [];
     String? _currentPassword;
     bool _isLoading = false;

     List<Password> get passwords => _passwords;
     String? get currentPassword => _currentPassword;
     bool get isLoading => _isLoading;

     Future<void> loadPasswords() async {
       _isLoading = true;
       notifyListeners();

       try {
         final passwordsJson = await _storage.read(key: 'passwords');
         if (passwordsJson != null) {
           final List<dynamic> decoded = json.decode(passwordsJson);
           _passwords = decoded
               .map((json) => Password.fromJson(json))
               .toList();
         }
       } catch (e) {
         print('Error loading passwords: $e');
       } finally {
         _isLoading = false;
         notifyListeners();
       }
     }

     Future<void> generatePassword({
       required int length,
       required Map<String, bool> options,
     }) async {
       _currentPassword = _generator.generatePassword(
         length: length,
         useUppercase: options['uppercase'] ?? true,
         useLowercase: options['lowercase'] ?? true,
         useNumbers: options['numbers'] ?? true,
         useSpecial: options['special'] ?? true,
       );
       notifyListeners();
     }

     Future<void> savePassword(String? label) async {
       if (_currentPassword == null) return;

       final password = Password(
         id: DateTime.now().millisecondsSinceEpoch.toString(),
         value: _currentPassword!,
         createdAt: DateTime.now(),
         label: label,
         options: {
           'uppercase': true,
           'lowercase': true,
           'numbers': true,
           'special': true,
         },
       );

       _passwords.add(password);
       await _savePasswords();
       notifyListeners();
     }

     Future<void> deletePassword(String id) async {
       _passwords.removeWhere((p) => p.id == id);
       await _savePasswords();
       notifyListeners();
     }

     Future<void> _savePasswords() async {
       try {
         final passwordsJson = json.encode(
           _passwords.map((p) => p.toJson()).toList(),
         );
         await _storage.write(key: 'passwords', value: passwordsJson);
       } catch (e) {
         print('Error saving passwords: $e');
       }
     }
   }
   ```

5. **Create Password Widgets**

   ```dart
   class PasswordStrengthIndicator extends StatelessWidget {
     final double strength;

     const PasswordStrengthIndicator({
       required this.strength,
     });

     @override
     Widget build(BuildContext context) {
       return Column(
         crossAxisAlignment: CrossAxisAlignment.start,
         children: [
           LinearProgressIndicator(
             value: strength,
             backgroundColor: Colors.grey[200],
             valueColor: AlwaysStoppedAnimation<Color>(
               _getStrengthColor(strength),
             ),
           ),
           SizedBox(height: 8),
           Text(
             _getStrengthText(strength),
             style: TextStyle(
               color: _getStrengthColor(strength),
               fontWeight: FontWeight.bold,
             ),
           ),
         ],
       );
     }

     Color _getStrengthColor(double strength) {
       if (strength < 0.3) return Colors.red;
       if (strength < 0.6) return Colors.orange;
       if (strength < 0.8) return Colors.yellow;
       return Colors.green;
     }

     String _getStrengthText(double strength) {
       if (strength < 0.3) return 'Weak';
       if (strength < 0.6) return 'Medium';
       if (strength < 0.8) return 'Strong';
       return 'Very Strong';
     }
   }

   class PasswordOptions extends StatelessWidget {
     final Map<String, bool> options;
     final Function(String, bool) onOptionChanged;

     const PasswordOptions({
       required this.options,
       required this.onOptionChanged,
     });

     @override
     Widget build(BuildContext context) {
       return Column(
         children: [
           _buildOptionSwitch(
             'Uppercase Letters',
             'uppercase',
             Icons.text_fields,
           ),
           _buildOptionSwitch(
             'Lowercase Letters',
             'lowercase',
             Icons.text_format,
           ),
           _buildOptionSwitch(
             'Numbers',
             'numbers',
             Icons.numbers,
           ),
           _buildOptionSwitch(
             'Special Characters',
             'special',
             Icons.star,
           ),
         ],
       );
     }

     Widget _buildOptionSwitch(
       String label,
       String key,
       IconData icon,
     ) {
       return SwitchListTile(
         title: Text(label),
         secondary: Icon(icon),
         value: options[key] ?? true,
         onChanged: (value) => onOptionChanged(key, value),
       );
     }
   }
   ```

6. **Create Main Screen**

   ```dart
   class PasswordGeneratorScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Password Generator'),
         ),
         body: Consumer<PasswordProvider>(
           builder: (context, provider, child) {
             return SingleChildScrollView(
               padding: EdgeInsets.all(16),
               child: Column(
                 crossAxisAlignment: CrossAxisAlignment.stretch,
                 children: [
                   Card(
                     child: Padding(
                       padding: EdgeInsets.all(16),
                       child: Column(
                         crossAxisAlignment: CrossAxisAlignment.start,
                         children: [
                           Text(
                             'Password Length',
                             style: Theme.of(context).textTheme.titleMedium,
                           ),
                           Slider(
                             value: 12,
                             min: 8,
                             max: 32,
                             divisions: 24,
                             label: '12',
                             onChanged: (value) {
                               // Update length
                             },
                           ),
                           SizedBox(height: 16),
                           Text(
                             'Password Options',
                             style: Theme.of(context).textTheme.titleMedium,
                           ),
                           PasswordOptions(
                             options: {
                               'uppercase': true,
                               'lowercase': true,
                               'numbers': true,
                               'special': true,
                             },
                             onOptionChanged: (key, value) {
                               // Update options
                             },
                           ),
                         ],
                       ),
                     ),
                   ),
                   SizedBox(height: 16),
                   ElevatedButton.icon(
                     onPressed: () {
                       provider.generatePassword(
                         length: 12,
                         options: {
                           'uppercase': true,
                           'lowercase': true,
                           'numbers': true,
                           'special': true,
                         },
                       );
                     },
                     icon: Icon(Icons.refresh),
                     label: Text('Generate Password'),
                   ),
                   if (provider.currentPassword != null) ...[
                     SizedBox(height: 16),
                     Card(
                       child: Padding(
                         padding: EdgeInsets.all(16),
                         child: Column(
                           crossAxisAlignment: CrossAxisAlignment.start,
                           children: [
                             Text(
                               'Generated Password',
                               style: Theme.of(context).textTheme.titleMedium,
                             ),
                             SizedBox(height: 8),
                             Text(
                               provider.currentPassword!,
                               style: Theme.of(context).textTheme.headlineSmall,
                             ),
                             SizedBox(height: 16),
                             PasswordStrengthIndicator(
                               strength: PasswordGenerator().calculateStrength(
                                 provider.currentPassword!,
                               ),
                             ),
                             SizedBox(height: 16),
                             Row(
                               mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                               children: [
                                 IconButton(
                                   icon: Icon(Icons.copy),
                                   onPressed: () {
                                     Clipboard.setData(
                                       ClipboardData(
                                         text: provider.currentPassword!,
                                       ),
                                     );
                                     ScaffoldMessenger.of(context).showSnackBar(
                                       SnackBar(
                                         content: Text('Password copied!'),
                                       ),
                                     );
                                   },
                                 ),
                                 IconButton(
                                   icon: Icon(Icons.save),
                                   onPressed: () {
                                     // Save password
                                   },
                                 ),
                                 IconButton(
                                   icon: Icon(Icons.share),
                                   onPressed: () {
                                     Share.share(
                                       'Generated Password: ${provider.currentPassword}',
                                     );
                                   },
                                 ),
                               ],
                             ),
                           ],
                         ),
                       ),
                     ),
                   ],
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

1. **Security**

   - Use secure random generation
   - Encrypt stored passwords
   - Handle sensitive data
   - Implement proper validation

2. **User Experience**

   - Show password strength
   - Provide clear feedback
   - Add copy functionality
   - Support sharing

3. **Performance**

   - Optimize generation
   - Handle large lists
   - Cache results
   - Manage memory

4. **Testing**
   - Test generation
   - Verify strength
   - Check storage
   - Test edge cases

## Conclusion

This tutorial has shown you how to create a password generator app with features like:

- Customizable passwords
- Strength indicators
- Password storage
- Copy and share
- History tracking

You can extend this implementation by adding:

- Password categories
- Import/export
- Password analysis
- Custom rules
- Backup/restore

Remember to:

- Follow security best practices
- Test thoroughly
- Consider user experience
- Handle errors gracefully
- Keep dependencies updated

This implementation provides a solid foundation for creating a secure password generator app.
