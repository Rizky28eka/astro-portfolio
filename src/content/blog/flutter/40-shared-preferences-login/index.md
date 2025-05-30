---
title: "Using Shared Preferences for Login"
summary: "Store user data locally"
date: "2024, 04, 20"
tags: ["flutter", "local-storage", "authentication", "shared-preferences"]
difficulty: "medium"
draft: false
---

## Using Shared Preferences for Login

Implementing a login system with local storage using Shared Preferences is a common requirement in Flutter apps. This guide will show you how to create a secure and efficient login system that persists user data locally.

## Why Use Shared Preferences for Login?

- Persistent user sessions
- Offline functionality
- Fast access to user data
- Reduced server load
- Better user experience
- Simple implementation

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     shared_preferences: ^2.2.2
     crypto: ^3.0.3
   ```

2. **Create User Model**

   ```dart
   class User {
     final String username;
     final String email;
     final String? token;
     final DateTime? lastLogin;

     User({
       required this.username,
       required this.email,
       this.token,
       this.lastLogin,
     });

     Map<String, dynamic> toJson() {
       return {
         'username': username,
         'email': email,
         'token': token,
         'lastLogin': lastLogin?.toIso8601String(),
       };
     }

     factory User.fromJson(Map<String, dynamic> json) {
       return User(
         username: json['username'],
         email: json['email'],
         token: json['token'],
         lastLogin: json['lastLogin'] != null
             ? DateTime.parse(json['lastLogin'])
             : null,
       );
     }
   }
   ```

3. **Create Auth Service**

   ```dart
   class AuthService {
     static const String _userKey = 'user_data';
     static const String _tokenKey = 'auth_token';
     final SharedPreferences _prefs;

     AuthService(this._prefs);

     Future<void> saveUser(User user) async {
       final userJson = user.toJson();
       await _prefs.setString(_userKey, jsonEncode(userJson));
       if (user.token != null) {
         await _prefs.setString(_tokenKey, user.token!);
       }
     }

     Future<User?> getUser() async {
       final userJson = _prefs.getString(_userKey);
       if (userJson == null) return null;
       return User.fromJson(jsonDecode(userJson));
     }

     Future<String?> getToken() async {
       return _prefs.getString(_tokenKey);
     }

     Future<void> clearUser() async {
       await _prefs.remove(_userKey);
       await _prefs.remove(_tokenKey);
     }

     Future<bool> isLoggedIn() async {
       final token = await getToken();
       return token != null;
     }
   }
   ```

4. **Create Login Screen**

   ```dart
   class LoginScreen extends StatefulWidget {
     @override
     _LoginScreenState createState() => _LoginScreenState();
   }

   class _LoginScreenState extends State<LoginScreen> {
     final _formKey = GlobalKey<FormState>();
     final _usernameController = TextEditingController();
     final _passwordController = TextEditingController();
     final _authService = AuthService(await SharedPreferences.getInstance());
     bool _isLoading = false;

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Login'),
         ),
         body: Padding(
           padding: EdgeInsets.all(16.0),
           child: Form(
             key: _formKey,
             child: Column(
               children: [
                 TextFormField(
                   controller: _usernameController,
                   decoration: InputDecoration(
                     labelText: 'Username',
                     border: OutlineInputBorder(),
                   ),
                   validator: (value) {
                     if (value == null || value.isEmpty) {
                       return 'Please enter your username';
                     }
                     return null;
                   },
                 ),
                 SizedBox(height: 16),
                 TextFormField(
                   controller: _passwordController,
                   decoration: InputDecoration(
                     labelText: 'Password',
                     border: OutlineInputBorder(),
                   ),
                   obscureText: true,
                   validator: (value) {
                     if (value == null || value.isEmpty) {
                       return 'Please enter your password';
                     }
                     return null;
                   },
                 ),
                 SizedBox(height: 24),
                 ElevatedButton(
                   onPressed: _isLoading ? null : _handleLogin,
                   child: _isLoading
                       ? CircularProgressIndicator()
                       : Text('Login'),
                 ),
               ],
             ),
           ),
         ),
       );
     }

     Future<void> _handleLogin() async {
       if (_formKey.currentState!.validate()) {
         setState(() {
           _isLoading = true;
         });

         try {
           // Simulate API call
           await Future.delayed(Duration(seconds: 2));

           final user = User(
             username: _usernameController.text,
             email: '${_usernameController.text}@example.com',
             token: 'dummy_token_${DateTime.now().millisecondsSinceEpoch}',
             lastLogin: DateTime.now(),
           );

           await _authService.saveUser(user);
           Navigator.pushReplacement(
             context,
             MaterialPageRoute(builder: (context) => HomeScreen()),
           );
         } catch (e) {
           ScaffoldMessenger.of(context).showSnackBar(
             SnackBar(content: Text('Login failed: $e')),
           );
         } finally {
           setState(() {
             _isLoading = false;
           });
         }
       }
     }

     @override
     void dispose() {
       _usernameController.dispose();
       _passwordController.dispose();
       super.dispose();
     }
   }
   ```

5. **Create Auth Wrapper**

   ```dart
   class AuthWrapper extends StatelessWidget {
     final AuthService _authService;

     const AuthWrapper({
       required AuthService authService,
     }) : _authService = authService;

     @override
     Widget build(BuildContext context) {
       return FutureBuilder<bool>(
         future: _authService.isLoggedIn(),
         builder: (context, snapshot) {
           if (snapshot.connectionState == ConnectionState.waiting) {
             return Scaffold(
               body: Center(
                 child: CircularProgressIndicator(),
               ),
             );
           }

           if (snapshot.data == true) {
             return HomeScreen();
           }

           return LoginScreen();
         },
       );
     }
   }
   ```

## Advanced Features

1. **Secure Storage**

   ```dart
   class SecureAuthService {
     static const String _userKey = 'user_data';
     static const String _tokenKey = 'auth_token';
     final SharedPreferences _prefs;
     final _encryptionKey = 'your_encryption_key';

     SecureAuthService(this._prefs);

     String _encrypt(String data) {
       final key = utf8.encode(_encryptionKey);
       final bytes = utf8.encode(data);
       final hmac = Hmac(sha256, key);
       final digest = hmac.convert(bytes);
       return base64.encode(digest.bytes);
     }

     String _decrypt(String encryptedData) {
       // Implement decryption logic
       return encryptedData;
     }

     Future<void> saveUser(User user) async {
       final userJson = user.toJson();
       final encryptedData = _encrypt(jsonEncode(userJson));
       await _prefs.setString(_userKey, encryptedData);
       if (user.token != null) {
         await _prefs.setString(_tokenKey, _encrypt(user.token!));
       }
     }

     Future<User?> getUser() async {
       final encryptedData = _prefs.getString(_userKey);
       if (encryptedData == null) return null;
       final decryptedData = _decrypt(encryptedData);
       return User.fromJson(jsonDecode(decryptedData));
     }
   }
   ```

2. **Auto Login**

   ```dart
   class AutoLoginService {
     final AuthService _authService;
     final Duration _sessionDuration;

     AutoLoginService(
       this._authService, {
       this._sessionDuration = const Duration(days: 7),
     });

     Future<bool> shouldAutoLogin() async {
       final user = await _authService.getUser();
       if (user == null || user.lastLogin == null) return false;

       final now = DateTime.now();
       final difference = now.difference(user.lastLogin!);
       return difference < _sessionDuration;
     }

     Future<void> refreshSession() async {
       final user = await _authService.getUser();
       if (user != null) {
         await _authService.saveUser(
           User(
             username: user.username,
             email: user.email,
             token: user.token,
             lastLogin: DateTime.now(),
           ),
         );
       }
     }
   }
   ```

3. **Remember Me**

   ```dart
   class RememberMeService {
     static const String _rememberMeKey = 'remember_me';
     final SharedPreferences _prefs;

     RememberMeService(this._prefs);

     Future<void> setRememberMe(bool value) async {
       await _prefs.setBool(_rememberMeKey, value);
     }

     Future<bool> getRememberMe() async {
       return _prefs.getBool(_rememberMeKey) ?? false;
     }
   }
   ```

## Best Practices

1. **Security**

   - Encrypt sensitive data
   - Use secure storage
   - Implement token expiration
   - Clear data on logout
   - Handle errors properly
   - Validate input data

2. **User Experience**

   - Show loading states
   - Provide error feedback
   - Remember user preferences
   - Auto-login when appropriate
   - Smooth transitions
   - Clear error messages

3. **Implementation**
   - Clean architecture
   - Separation of concerns
   - Error handling
   - State management
   - Code organization
   - Testing

## Common Use Cases

1. **Authentication**

   - User login
   - Session management
   - Token handling
   - Auto-login
   - Remember me
   - Logout

2. **User Data**

   - Profile information
   - Preferences
   - Settings
   - History
   - Favorites
   - Cache

3. **App Features**
   - Offline access
   - Data persistence
   - User sessions
   - Settings sync
   - Profile management
   - Security

## Conclusion

Implementing a login system with Shared Preferences in Flutter provides a simple yet effective way to manage user authentication and data persistence. By following these guidelines and implementing the provided examples, you can create a secure and user-friendly login system for your app.
