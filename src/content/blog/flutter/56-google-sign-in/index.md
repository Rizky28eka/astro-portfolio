---
title: "Google Sign-In with Flutter"
summary: "Quick login using Google account"
date: "2025, 03, 26"
tags: ["flutter", "authentication", "google-signin", "firebase"]
difficulty: "medium"
draft: false
---

## Google Sign-In with Flutter

Implementing Google Sign-In in your Flutter app provides a seamless authentication experience for users. This tutorial will guide you through setting up and implementing Google Sign-In functionality.

## Features

- Google Sign-In integration
- Firebase Authentication
- User profile management
- Sign-out functionality
- Error handling
- Loading states
- Persistent login
- Profile picture display

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     firebase_core: ^2.24.2
     firebase_auth: ^4.15.3
     google_sign_in: ^6.1.6
     provider: ^6.1.1
     shared_preferences: ^2.2.2
   ```

2. **Configure Firebase**

   - Create a new Firebase project
   - Add Android and iOS apps
   - Download and add configuration files
   - Enable Google Sign-In in Firebase Console

3. **Create Authentication Service**

   ```dart
   class AuthService {
     final FirebaseAuth _auth = FirebaseAuth.instance;
     final GoogleSignIn _googleSignIn = GoogleSignIn();

     // Get current user
     User? get currentUser => _auth.currentUser;

     // Stream of auth changes
     Stream<User?> get authStateChanges => _auth.authStateChanges();

     // Sign in with Google
     Future<UserCredential?> signInWithGoogle() async {
       try {
         // Trigger the authentication flow
         final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

         if (googleUser == null) return null;

         // Obtain the auth details from the request
         final GoogleSignInAuthentication googleAuth =
             await googleUser.authentication;

         // Create a new credential
         final credential = GoogleAuthProvider.credential(
           accessToken: googleAuth.accessToken,
           idToken: googleAuth.idToken,
         );

         // Sign in to Firebase with the Google credential
         return await _auth.signInWithCredential(credential);
       } catch (e) {
         print('Error signing in with Google: $e');
         return null;
       }
     }

     // Sign out
     Future<void> signOut() async {
       await Future.wait([
         _auth.signOut(),
         _googleSignIn.signOut(),
       ]);
     }
   }
   ```

4. **Create Auth Provider**

   ```dart
   class AuthProvider extends ChangeNotifier {
     final AuthService _authService;
     User? _user;
     bool _isLoading = false;
     String? _error;

     AuthProvider({required AuthService authService})
         : _authService = authService {
       _init();
     }

     User? get user => _user;
     bool get isLoading => _isLoading;
     String? get error => _error;
     bool get isAuthenticated => _user != null;

     void _init() {
       _authService.authStateChanges.listen((User? user) {
         _user = user;
         notifyListeners();
       });
     }

     Future<bool> signInWithGoogle() async {
       try {
         _isLoading = true;
         _error = null;
         notifyListeners();

         final result = await _authService.signInWithGoogle();
         return result != null;
       } catch (e) {
         _error = e.toString();
         return false;
       } finally {
         _isLoading = false;
         notifyListeners();
       }
     }

     Future<void> signOut() async {
       try {
         _isLoading = true;
         _error = null;
         notifyListeners();

         await _authService.signOut();
       } catch (e) {
         _error = e.toString();
       } finally {
         _isLoading = false;
         notifyListeners();
       }
     }
   }
   ```

5. **Create Auth Widgets**

   ```dart
   class GoogleSignInButton extends StatelessWidget {
     final VoidCallback onPressed;
     final bool isLoading;

     const GoogleSignInButton({
       required this.onPressed,
       this.isLoading = false,
     });

     @override
     Widget build(BuildContext context) {
       return ElevatedButton.icon(
         onPressed: isLoading ? null : onPressed,
         icon: isLoading
             ? SizedBox(
                 width: 20,
                 height: 20,
                 child: CircularProgressIndicator(
                   strokeWidth: 2,
                   valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                 ),
               )
             : Image.asset(
                 'assets/google_logo.png',
                 height: 24,
               ),
         label: Text(isLoading ? 'Signing in...' : 'Sign in with Google'),
         style: ElevatedButton.styleFrom(
           padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
           shape: RoundedRectangleBorder(
             borderRadius: BorderRadius.circular(8),
           ),
         ),
       );
     }
   }

   class UserProfileCard extends StatelessWidget {
     final User user;
     final VoidCallback onSignOut;

     const UserProfileCard({
       required this.user,
       required this.onSignOut,
     });

     @override
     Widget build(BuildContext context) {
       return Card(
         child: Padding(
           padding: EdgeInsets.all(16),
           child: Column(
             mainAxisSize: MainAxisSize.min,
             children: [
               CircleAvatar(
                 radius: 40,
                 backgroundImage: user.photoURL != null
                     ? NetworkImage(user.photoURL!)
                     : null,
                 child: user.photoURL == null
                     ? Icon(Icons.person, size: 40)
                     : null,
               ),
               SizedBox(height: 16),
               Text(
                 user.displayName ?? 'User',
                 style: Theme.of(context).textTheme.titleLarge,
               ),
               SizedBox(height: 8),
               Text(
                 user.email ?? '',
                 style: Theme.of(context).textTheme.bodyMedium,
               ),
               SizedBox(height: 16),
               ElevatedButton(
                 onPressed: onSignOut,
                 child: Text('Sign Out'),
                 style: ElevatedButton.styleFrom(
                   backgroundColor: Colors.red,
                   foregroundColor: Colors.white,
                 ),
               ),
             ],
           ),
         ),
       );
     }
   }
   ```

6. **Create Auth Screen**

   ```dart
   class AuthScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         body: Consumer<AuthProvider>(
           builder: (context, provider, child) {
             if (provider.isLoading) {
               return Center(
                 child: CircularProgressIndicator(),
               );
             }

             if (provider.isAuthenticated) {
               return Center(
                 child: UserProfileCard(
                   user: provider.user!,
                   onSignOut: () => provider.signOut(),
                 ),
               );
             }

             return Center(
               child: Column(
                 mainAxisAlignment: MainAxisAlignment.center,
                 children: [
                   Text(
                     'Welcome',
                     style: Theme.of(context).textTheme.headlineMedium,
                   ),
                   SizedBox(height: 32),
                   GoogleSignInButton(
                     onPressed: () => provider.signInWithGoogle(),
                     isLoading: provider.isLoading,
                   ),
                   if (provider.error != null) ...[
                     SizedBox(height: 16),
                     Text(
                       provider.error!,
                       style: TextStyle(color: Colors.red),
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

   - Handle tokens securely
   - Implement proper error handling
   - Validate user sessions
   - Protect sensitive data

2. **User Experience**

   - Show loading states
   - Provide clear error messages
   - Handle offline scenarios
   - Maintain session persistence

3. **Code Organization**

   - Separate concerns
   - Use dependency injection
   - Follow SOLID principles
   - Write clean, maintainable code

4. **Testing**
   - Write unit tests
   - Test error scenarios
   - Mock dependencies
   - Test UI components

## Conclusion

This tutorial has shown you how to implement Google Sign-In in your Flutter app with features like:

- Google authentication
- User profile management
- Session handling
- Error handling
- Loading states

You can extend this implementation by adding:

- Additional sign-in methods
- User profile editing
- Account linking
- Role-based access
- Custom claims

Remember to:

- Handle errors gracefully
- Test thoroughly
- Follow security best practices
- Consider user experience
- Keep dependencies updated

This implementation provides a solid foundation for authentication in your Flutter app.
